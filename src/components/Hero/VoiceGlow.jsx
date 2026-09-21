import { useEffect, useRef, useState } from 'react';
import CtaButton from '../CtaButton/CtaButton';
import { loadUnicornStudioV2 } from '../../lib/unicornStudioV2';
import { VOICE_PROJECT, VOICE_IDLE, VOICE_BASE, VOICE_LABELS } from './heroData';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const mix = (from, to, t) => from + (to - from) * t;

/*
 * RMS of the current waveform, gated and gained so ordinary speech lands
 * roughly in 0..1 (the tuning from the original Unicorn Studio embed).
 */
function readLevel({ analyser, data }) {
  analyser.getByteTimeDomainData(data);

  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    const sample = (data[i] - 128) / 128;
    sum += sample * sample;
  }

  return clamp((Math.sqrt(sum / data.length) - 0.02) * 7, 0, 1);
}

/*
 * Average energy in a few speech frequency bands, gated and gained into 0..1.
 * Each ring outside the inner disc listens to its own band, so while someone
 * talks every ring moves on its own rather than only echoing the centre.
 */
const BANDS_HZ = [
  [250, 1000], // middle ring: vowel body
  [1000, 3000], // outer ring: consonants / presence
  [80, 250], // halo + outline: voice fundamental
];

function readBands({ analyser, context, freq }) {
  analyser.getByteFrequencyData(freq);
  const binHz = context.sampleRate / analyser.fftSize;

  return BANDS_HZ.map(([low, high]) => {
    const from = Math.max(1, Math.floor(low / binHz));
    const to = Math.min(freq.length - 1, Math.ceil(high / binHz));
    let sum = 0;
    for (let i = from; i <= to; i++) sum += freq[i];
    const avg = sum / (to - from + 1) / 255;
    return clamp((avg - 0.28) * 2.6, 0, 1);
  });
}

/* Ring 0 is the inner disc; each ring after it mixes its band with a ripple from inside. */
const RING_COUNT = 4;
const RING_FOLLOW = [0.3, 0.22, 0.18, 0.14];
const RIPPLE_SHARE = 0.45;
const RING_REST = 0.002;

/**
 * The concentric rings inside the hero circle, the voice-reactive orb clipped
 * to the innermost disc, and the pill that turns the microphone on and off.
 *
 * The orb idles at the dim VOICE_IDLE values. Nothing touches the microphone
 * until the button is clicked. While listening, the smoothed mic level pushes
 * the scene's Scale / Amplitude / Brightness variables up from VOICE_BASE, and
 * ripples outward through the rings as `--voice-0..3` (each ring easing
 * towards the one inside it). Stopping eases everything back down rather than
 * snapping. Unmounting stops the stream, closes the AudioContext, cancels the
 * frame loop and destroys the WebGL scene.
 *
 * With `pauseWhenIdle` (used where the orb is hidden at rest, over the hero
 * photos) the WebGL scene stops rendering once everything has eased back to
 * idle, and resumes when the mic starts, so an invisible orb costs no GPU time.
 */
export default function VoiceGlow({ pauseWhenIdle = false }) {
  const ringsRef = useRef(null);
  const ripplesRef = useRef(new Array(RING_COUNT).fill(0));
  const sceneElRef = useRef(null);
  const sceneRef = useRef(null);
  const audioRef = useRef(null);
  const frameRef = useRef(0);
  const levelRef = useRef(0);
  const activeRef = useRef(0);
  const listeningRef = useRef(false);
  const mountedRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState('idle');

  function tick() {
    const scene = sceneRef.current;
    if (!scene) {
      frameRef.current = 0;
      return;
    }

    const audio = audioRef.current;
    const level = audio ? readLevel(audio) : 0;
    levelRef.current += (level - levelRef.current) * (level > levelRef.current ? 0.28 : 0.08);
    activeRef.current += ((listeningRef.current ? 1 : 0) - activeRef.current) * 0.06;

    const active = activeRef.current;
    const voice = levelRef.current * active;

    const bands = audio ? readBands(audio) : [0, 0, 0];
    const ripples = ripplesRef.current;
    ripples.forEach((value, i) => {
      const target =
        i === 0
          ? voice
          : clamp(ripples[i - 1] * RIPPLE_SHARE + bands[i - 1] * active * (1 - RIPPLE_SHARE) * 1.4, 0, 1);
      ripples[i] = value + (target - value) * RING_FOLLOW[i];
      ringsRef.current?.style.setProperty(`--voice-${i}`, ripples[i].toFixed(4));
    });

    if (!listeningRef.current && active < RING_REST && ripples.every((v) => v < RING_REST)) {
      activeRef.current = 0;
      levelRef.current = 0;
      ripples.fill(0);
      ripples.forEach((_, i) => ringsRef.current?.style.setProperty(`--voice-${i}`, '0'));
      scene.setVariables(VOICE_IDLE);
      if (pauseWhenIdle) scene.paused = true;
      frameRef.current = 0;
      return;
    }

    scene.setVariables({
      Scale: clamp(mix(VOICE_IDLE.Scale, VOICE_BASE.Scale, active) + voice * 0.12, 0, 0.6),
      Amplitude: clamp(mix(VOICE_IDLE.Amplitude, VOICE_BASE.Amplitude, active) + voice * 0.65, 0, 1),
      Brightness: clamp(
        mix(VOICE_IDLE.Brightness, VOICE_BASE.Brightness, active) + voice * 0.75,
        0,
        1.75
      ),
    });

    frameRef.current = requestAnimationFrame(tick);
  }

  function ensureLoop() {
    if (!frameRef.current) frameRef.current = requestAnimationFrame(tick);
  }

  function releaseAudio() {
    const audio = audioRef.current;
    audioRef.current = null;
    if (!audio) return;

    audio.source.disconnect();
    audio.stream.getTracks().forEach((track) => track.stop());
    audio.context.close().catch(() => {});
  }

  function stopMic() {
    listeningRef.current = false;
    releaseAudio();
    if (!mountedRef.current) return;
    setStatus('idle');
    ensureLoop();
  }

  async function startMic() {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unavailable');
      return;
    }

    setStatus('requesting');

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      if (mountedRef.current) setStatus('blocked');
      return;
    }

    if (!mountedRef.current) {
      stream.getTracks().forEach((track) => track.stop());
      return;
    }

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const context = new AudioCtx();
    const analyser = context.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0;
    /* Map the speech range onto the byte scale readBands expects. */
    analyser.minDecibels = -85;
    analyser.maxDecibels = -25;
    const source = context.createMediaStreamSource(stream);
    source.connect(analyser);
    if (context.state === 'suspended') context.resume().catch(() => {});

    /* The mic can also be revoked or unplugged from outside the page. */
    stream.getAudioTracks().forEach((track) => track.addEventListener('ended', stopMic));

    audioRef.current = {
      stream,
      context,
      analyser,
      source,
      data: new Uint8Array(analyser.fftSize),
      freq: new Uint8Array(analyser.frequencyBinCount),
    };
    listeningRef.current = true;
    if (sceneRef.current) sceneRef.current.paused = false;
    setStatus('listening');
    ensureLoop();
  }

  useEffect(() => {
    mountedRef.current = true;
    let cancelled = false;

    loadUnicornStudioV2()
      .then((UnicornStudio) =>
        UnicornStudio.addScene({
          projectId: VOICE_PROJECT,
          element: sceneElRef.current,
          initialVariables: VOICE_IDLE,
        })
      )
      .then((scene) => {
        if (cancelled) {
          scene.destroy();
          return;
        }
        sceneRef.current = scene;
        if (pauseWhenIdle) scene.paused = true;
        setReady(true);
      })
      .catch(() => {
        /* Offline or blocked: the hero simply renders without the orb. */
      });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      listeningRef.current = false;
      cancelAnimationFrame(frameRef.current);
      frameRef.current = 0;
      releaseAudio();
      sceneRef.current?.destroy();
      sceneRef.current = null;
    };
  }, []);

  const listening = status === 'listening';
  const glowClasses = ['voice-glow', ready && 'is-ready', listening && 'is-listening']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className="voice-rings" ref={ringsRef} aria-hidden="true">
        <span className="voice-rings__halo" />
        <span className="voice-rings__outline" />
        <span className="voice-rings__ring --outer" />
        <span className="voice-rings__ring --middle" />
        <div className="voice-rings__ring --inner">
          <div className={glowClasses} ref={sceneElRef} />
        </div>
      </div>
      {ready && (
        <CtaButton
          variant="white"
          className="voice-glow__button"
          onClick={listening ? stopMic : startMic}
          disabled={status === 'requesting' || status === 'unavailable'}
          aria-pressed={listening}
        >
          {VOICE_LABELS[status]}
        </CtaButton>
      )}
    </>
  );
}

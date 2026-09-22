import { useEffect, useRef, useState } from 'react';
import { useVoiceOrb } from '../../hooks/useVoiceOrb';
import { VOICE_IDLE, VOICE_BASE } from '../Hero/heroData';
import { DEMO_MODES, VOICE_DEMO, TEXT_DEMO, DEMO_ACTIONS } from './liquidHeroData';
import {
  ArrowUpRightIcon,
  CheckIcon,
  ChevronLeftIcon,
  PauseIcon,
  PlayIcon,
  TextModeIcon,
  VoiceModeIcon,
  WaveIcon,
} from './HeroIcons';

/*
 * The orb keeps its idle size while listening (the CSS sizes the idle orb to
 * its circle), so only the voice itself swells it. It rests brighter than the
 * hero's, since here it is always on show.
 */
const ORB_IDLE = { ...VOICE_IDLE, Brightness: 0.8 };
const ORB_BASE = { ...VOICE_BASE, Scale: VOICE_IDLE.Scale };

/* Bar heights (0..1) of the waveform under the orb: quiet edges, two peaks. */
const WAVE = Array.from({ length: 36 }, (_, i) => {
  const peak = (at, width) => Math.exp(-(((i - at) / width) ** 2));
  return 0.08 + 0.75 * peak(9, 3) + 0.9 * peak(25, 3.5) + 0.12 * ((i * 7) % 3);
});

const MODE_ICONS = { voice: VoiceModeIcon, text: TextModeIcon };

/* 95.4 -> "01:35". */
function formatDuration(seconds) {
  const whole = Math.round(seconds);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(Math.floor(whole / 60))}:${pad(whole % 60)}`;
}

/*
 * Reads each recording's length from its metadata only (not the audio), so
 * the rows always show the real duration. Missing files stay at "--:--".
 */
function useDurations(sources) {
  const [durations, setDurations] = useState(() => sources.map(() => null));

  useEffect(() => {
    const probes = sources.map((src, i) => {
      const probe = new Audio();
      probe.preload = 'metadata';
      probe.addEventListener('loadedmetadata', () => {
        if (!Number.isFinite(probe.duration)) return;
        setDurations((current) => current.map((value, j) => (j === i ? probe.duration : value)));
      });
      probe.src = src;
      return probe;
    });

    return () =>
      probes.forEach((probe) => {
        probe.removeAttribute('src');
        probe.load();
      });
  }, [sources]);

  return durations;
}

const SAMPLE_SOURCES = VOICE_DEMO.samples.map((sample) => sample.src);

/**
 * Right-hand demo panel of the liquid hero. A toggle flips between two views
 * stacked in the same grid cell (so the voice scene stays alive while hidden):
 *
 * - Voice: the voice-reactive orb over a waveform, and recorded sample calls.
 * - Text: a phone with a short text thread, and the selling points.
 *
 * "Talk to AI" switches to the voice view and turns the mic on. Only one
 * sample plays at a time, and talking stops it.
 */
export default function DemoPanel({ className = '', orbReady = true }) {
  const [mode, setMode] = useState('voice');
  /* The orb's WebGL scene is only created once `orbReady` (after the hero intro). */
  const { levelsRef, sceneElRef, ready, status, listening, toggle } = useVoiceOrb({
    idle: ORB_IDLE,
    base: ORB_BASE,
    enabled: orbReady,
  });

  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(-1);
  const durations = useDurations(SAMPLE_SOURCES);

  function stopSample() {
    audioRef.current?.pause();
    setPlaying(-1);
  }

  function toggleSample(index) {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing === index) {
      stopSample();
      return;
    }
    if (listening) toggle();
    audio.src = VOICE_DEMO.samples[index].src;
    audio.play().then(
      () => setPlaying(index),
      () => setPlaying(-1)
    );
  }

  function talk() {
    setMode('voice');
    stopSample();
    toggle();
  }

  /* Hiding the voice view stops whatever it is doing. */
  useEffect(() => {
    if (mode === 'voice') return;
    stopSample();
    if (listening) toggle();
  }, [mode]);

  const micBusy = status === 'requesting' || status === 'unavailable';
  const isText = mode === 'text';

  return (
    <div className={`demo-panel ${listening ? 'is-listening' : ''} ${className}`} ref={levelsRef}>
      {/*
        * Keeps the orb light at every level, so it never shows dark shading:
        * 1. alpha = brightness, scaled up past a negative offset, so dim
        *    pixels (the scene's black backdrop and its shadowed side) are cut
        *    out rather than left as grey-brown haze;
        * 2. a gamma curve lifts whatever survives well into the bright range,
        *    so mid-tones read as light coral instead of dark red.
        */}
      <svg className="demo-panel__defs" aria-hidden="true" focusable="false">
        <filter id="demo-orb-black-out" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2.2 2.2 2.2 0 -0.5" />
          <feComponentTransfer>
            <feFuncR type="gamma" amplitude="1.25" exponent="0.4" offset="0.08" />
            <feFuncG type="gamma" amplitude="1.25" exponent="0.4" offset="0.08" />
            <feFuncB type="gamma" amplitude="1.25" exponent="0.4" offset="0.08" />
          </feComponentTransfer>
        </filter>
      </svg>
      <audio ref={audioRef} onEnded={() => setPlaying(-1)} onError={() => setPlaying(-1)} preload="none" />

      <div className="demo-panel__toggle" role="group" aria-label="Demo mode">
        {DEMO_MODES.map(({ id, label }, i) => {
          const ModeIcon = MODE_ICONS[id];
          const option = (
            <button
              key={id}
              type="button"
              className={`demo-panel__mode ${mode === id ? 'is-active' : ''}`}
              onClick={() => setMode(id)}
              aria-pressed={mode === id}
            >
              <ModeIcon />
              {label}
            </button>
          );
          if (i === 0) {
            return [
              option,
              <button
                key="switch"
                type="button"
                className={`demo-panel__switch ${isText ? 'is-on' : ''}`}
                onClick={() => setMode(isText ? 'voice' : 'text')}
                aria-label="Switch demo mode"
              >
                <span />
              </button>,
            ];
          }
          return option;
        })}
      </div>

      <div className="demo-panel__card">
        <div className="demo-panel__views">
          <div className={`demo-panel__view --voice ${isText ? '' : 'is-active'}`} aria-hidden={isText}>
            <div className="demo-panel__stage">
              <button
                type="button"
                className="demo-panel__orb"
                onClick={toggle}
                disabled={micBusy}
                aria-pressed={listening}
                aria-label={listening ? 'Stop talking' : 'Talk to the AI'}
                tabIndex={isText ? -1 : 0}
              >
                <span className={`demo-panel__glow ${ready ? 'is-ready' : ''}`} ref={sceneElRef} />
              </button>
              <div className="demo-panel__wave" aria-hidden="true">
                {WAVE.map((h, i) => (
                  <span key={i} style={{ '--h': h.toFixed(3), '--i': i }} />
                ))}
              </div>
              <p className="demo-panel__status" aria-live="polite">
                {VOICE_DEMO.status[status]}
              </p>
            </div>

            <ul className="demo-panel__rows">
              {VOICE_DEMO.samples.map((sample, i) => (
                <li key={sample.src}>
                  <button
                    type="button"
                    className={`demo-panel__sample ${playing === i ? 'is-playing' : ''}`}
                    onClick={() => toggleSample(i)}
                    aria-pressed={playing === i}
                    tabIndex={isText ? -1 : 0}
                  >
                    <span className="demo-panel__play">{playing === i ? <PauseIcon size={16} /> : <PlayIcon size={16} />}</span>
                    <span className="demo-panel__sample-title">{sample.title}</span>
                    <WaveIcon className="demo-panel__sample-wave" />
                    <span className="demo-panel__sample-time">
                      {durations[i] == null ? '--:--' : formatDuration(durations[i])}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className={`demo-panel__view --text ${isText ? 'is-active' : ''}`} aria-hidden={!isText}>
            <div className="demo-panel__screen">
              <div className="demo-phone">
                <div className="demo-phone__bar">
                  <span>9:41</span>
                  <span className="demo-phone__island" />
                  <span className="demo-phone__signal" />
                </div>
                <div className="demo-phone__head">
                  <ChevronLeftIcon className="demo-phone__back" size={16} />
                  <span className="demo-phone__avatar">AI</span>
                  <span className="demo-phone__name">{TEXT_DEMO.contact}</span>
                </div>
                <p className="demo-phone__stamp">{TEXT_DEMO.stamp}</p>
                <div className="demo-phone__thread">
                  {TEXT_DEMO.messages.map((message, i) => (
                    <p key={i} className={`demo-phone__bubble --${message.from}`}>
                      {message.text}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <ul className="demo-panel__rows --points">
              {TEXT_DEMO.points.map((point) => (
                <li key={point} className="demo-panel__point">
                  <CheckIcon size={16} />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="demo-panel__actions">
          <button type="button" className="demo-panel__action --solid" onClick={talk} disabled={micBusy}>
            {listening ? 'Stop talking' : DEMO_ACTIONS.talk}
            <ArrowUpRightIcon size={18} />
          </button>
          <a className="demo-panel__action --ghost" href={DEMO_ACTIONS.human.href}>
            {DEMO_ACTIONS.human.label}
            <ArrowUpRightIcon size={18} />
          </a>
        </div>
      </div>
    </div>
  );
}

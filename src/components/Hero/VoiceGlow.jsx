import CtaButton from '../CtaButton/CtaButton';
import { useVoiceOrb } from '../../hooks/useVoiceOrb';
import { VOICE_LABELS } from './heroData';

/**
 * The concentric rings inside the hero circle, the voice-reactive orb clipped
 * to the innermost disc, and the pill that turns the microphone on and off.
 * The mic level ripples outward through the rings as `--voice-0..3` (see
 * useVoiceOrb).
 */
export default function VoiceGlow({ pauseWhenIdle = false }) {
  const { levelsRef, sceneElRef, ready, status, listening, toggle } = useVoiceOrb({ pauseWhenIdle });

  const glowClasses = ['voice-glow', ready && 'is-ready', listening && 'is-listening']
    .filter(Boolean)
    .join(' ');

  return (
    <>
      <div className="voice-rings" ref={levelsRef} aria-hidden="true">
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
          onClick={toggle}
          disabled={status === 'requesting' || status === 'unavailable'}
          aria-pressed={listening}
        >
          {VOICE_LABELS[status]}
        </CtaButton>
      )}
    </>
  );
}

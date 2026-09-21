import { useEffect, useRef, useState } from 'react';
import { IS_MOBILE } from '../../lib/gsap';
import './VideoWrapper.css';

/**
 * Looping product clip with a play/pause toggle.
 *
 * The `--m` variant (used inside the feature sliders) does not autoplay on
 * desktop: it starts paused and plays only while hovered, which is how the
 * original keeps eight simultaneous videos cheap. On phones it falls back to
 * plain autoplay.
 */
export default function VideoWrapper({ src, poster, modest = false, className = '' }) {
  const wrapperRef = useRef(null);
  const videoRef = useRef(null);
  const hoverControlled = modest && !IS_MOBILE;
  /*
   * Mirrors the original: the toggle renders in its "pause" state from the
   * start and only flips on click. Hover play/pause deliberately leaves it
   * alone — the control is itself only visible on hover, at which point the
   * clip really is running.
   */
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const video = videoRef.current;
    if (!wrapper || !video || !hoverControlled) return;

    video.pause();
    video.removeAttribute('autoplay');

    const onEnter = () => {
      video.currentTime = 0;
      video.play().catch(() => {});
    };
    const onLeave = () => {
      video.currentTime = 0;
      video.pause();
      video.load();
    };

    wrapper.addEventListener('mouseenter', onEnter);
    wrapper.addEventListener('mouseleave', onLeave);
    return () => {
      wrapper.removeEventListener('mouseenter', onEnter);
      wrapper.removeEventListener('mouseleave', onLeave);
    };
  }, [hoverControlled]);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  };

  const classes = ['video-wrapper', modest ? '--m' : '', className].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={wrapperRef}>
      <video ref={videoRef} autoPlay muted loop playsInline poster={poster}>
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="video-wrapper__button-wrapper">
        <button
          type="button"
          aria-label={playing ? 'Pause video' : 'Play video'}
          className={`video-wrapper__button${playing ? ' play' : ''}`}
          onClick={toggle}
        />
      </div>
    </div>
  );
}

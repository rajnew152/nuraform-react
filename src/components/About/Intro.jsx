import { useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import { INTRO_LINES } from './aboutData';

/**
 * Pinned three-beat pitch. Each line splits into words that stagger in, then the
 * whole line fades out before the next one arrives. Behind it the Nuraform glyph
 * scales from nothing to 2x while fading, which reads as a slow zoom-through.
 *
 * Triggers and pins are passed as elements, never selector strings: a scoped
 * gsap.context() resolves selectors against the scope's descendants, so a string
 * naming the scope element itself silently matches nothing and ScrollTrigger
 * falls back to a document-wide range.
 */
export default function Intro() {
  const introRef = useRef(null);
  const containerRef = useRef(null);
  const bgRef = useRef(null);
  const glyphRef = useRef(null);
  const linesRef = useRef([]);

  useGsapEffect(() => {
    const intro = introRef.current;
    const container = containerRef.current;
    if (!intro || !container) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: intro,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        pin: container,
      },
    });

    /*
     * The background wrapper is deliberately part of this list. The original
     * walks every direct div of the container, and that includes `.--bg`, whose
     * empty word-split and fade still occupy a beat of the scrubbed timeline.
     * Dropping it would redistribute the scroll range across the three real
     * lines and desynchronise the whole sequence. Its own fade is a no-op
     * because `.--intro .--bg` is pinned to `opacity: 1 !important` in CSS.
     */
    const beats = [bgRef.current, ...linesRef.current].filter(Boolean);

    beats.forEach((beat) => {
      const split = new SplitText(beat, { type: 'words' });
      timeline
        .from(split.words, {
          opacity: 0,
          y: 20,
          stagger: 0.1,
          duration: 1,
          ease: 'power2.out',
        })
        .to(beat, { opacity: 0, duration: 0.5, ease: 'power1.in' }, '+=0.3');
    });

    gsap.fromTo(
      glyphRef.current,
      { scale: 0, opacity: 1, filter: 'drop-shadow(0px 0px 60px rgba(255, 255, 255, 0))' },
      {
        scale: 2,
        opacity: 0,
        filter: 'drop-shadow(2px 2px 50px #FF633E)',
        ease: 'none',
        scrollTrigger: { trigger: intro, start: 'top top', end: '+=200%', scrub: true },
      }
    );
  }, introRef);

  return (
    <div className="--intro" ref={introRef}>
      <div className="container" ref={containerRef}>
        <div className="--bg" ref={bgRef}>
          <img ref={glyphRef} src="/assets/intro-bg.svg" alt="" />
        </div>
        {INTRO_LINES.map((line, i) => (
          <div
            key={line}
            ref={(el) => {
              linesRef.current[i] = el;
            }}
          >
            {line}
          </div>
        ))}
      </div>
    </div>
  );
}

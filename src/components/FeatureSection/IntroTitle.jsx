import { useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import '../SectionTitle/SectionTitle.css';

/**
 * Section header that borrows the About intro's motion: subtitle, heading and
 * description split into words that fade up one after another as the block
 * scrolls in, while the Nuraform glyph glows and zooms through behind them.
 * Unlike the intro it is not pinned, so the slider below keeps its normal flow.
 */
export default function IntroTitle({ subtitle, heading, description }) {
  const rootRef = useRef(null);
  const glyphRef = useRef(null);
  const linesRef = useRef([]);

  useGsapEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: root,
        start: 'top 85%',
        end: 'bottom 55%',
        scrub: true,
      },
    });

    linesRef.current.filter(Boolean).forEach((line) => {
      const split = new SplitText(line, { type: 'words' });
      timeline.from(split.words, {
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 1,
        ease: 'power2.out',
      });
    });

    gsap.fromTo(
      glyphRef.current,
      { scale: 0, opacity: 1, filter: 'drop-shadow(0px 0px 60px rgba(255, 255, 255, 0))' },
      {
        scale: 2,
        opacity: 0,
        filter: 'drop-shadow(2px 2px 50px #FF633E)',
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    );
  }, rootRef);

  const setLine = (i) => (el) => {
    linesRef.current[i] = el;
  };

  return (
    <section className="section-title has-padding section-title--intro" ref={rootRef}>
      <div className="section-title__bg">
        <img ref={glyphRef} src="/assets/intro-bg.svg" alt="" />
      </div>
      {subtitle && (
        <p ref={setLine(0)} className="section-title__subtitle">
          {subtitle}
        </p>
      )}
      {heading && (
        <h2 ref={setLine(1)} className="section-title__heading">
          {heading}
        </h2>
      )}
      {description && (
        <h4 ref={setLine(2)} className="section-title__description">
          {description}
        </h4>
      )}
    </section>
  );
}

import { useRef } from 'react';
import { gsap, SplitText } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import '../SectionTitle/SectionTitle.css';

/**
 * Section header built like the About intro: a tall (300vh) block whose inner
 * screen is pinned while two beats play out on scroll, with the glyph glowing
 * and zooming through behind them.
 *
 *   Beat 1  the subtitle, set large ("Your best rep, on every call."), fades in
 *           word by word as the block scrolls up, so it fills the first screen.
 *   Beat 2  once pinned, beat 1 fades out and the heading ("Intelligence that
 *           sells while you sleep") rises in word by word, then the
 *           description if one is passed. Beat 2 stays up as the pin releases.
 *
 * As in Intro, triggers and pins are elements rather than selector strings.
 */
export default function IntroTitle({ subtitle, heading, description }) {
  const rootRef = useRef(null);
  const pinRef = useRef(null);
  const glyphRef = useRef(null);
  const firstRef = useRef(null);
  const headingRef = useRef(null);
  const descriptionRef = useRef(null);

  useGsapEffect(() => {
    const root = rootRef.current;
    const pin = pinRef.current;
    if (!root || !pin) return;

    const words = (el) => (el ? new SplitText(el, { type: 'words' }).words : []);

    /* Beat 1 arrives while the block scrolls into place. */
    gsap.from(words(firstRef.current), {
      opacity: 0,
      y: 20,
      stagger: 0.1,
      ease: 'power2.out',
      scrollTrigger: { trigger: root, start: 'top 75%', end: 'top top', scrub: true },
    });

    /* Beat 2 plays out while the screen is pinned. */
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: root, start: 'top top', end: 'bottom bottom', scrub: true, pin },
    });

    timeline
      .to(firstRef.current, { opacity: 0, y: -20, duration: 0.6, ease: 'power1.in' }, '+=0.3')
      .from(words(headingRef.current), { opacity: 0, y: 20, stagger: 0.1, duration: 1, ease: 'power2.out' });

    if (descriptionRef.current) {
      timeline.from(descriptionRef.current, { opacity: 0, y: 20, duration: 0.6, ease: 'power2.out' }, '-=0.3');
    }

    /* A short hold so beat 2 settles before the pin releases. */
    timeline.to({}, { duration: 0.6 });

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

  return (
    <section className="section-title section-title--intro" ref={rootRef}>
      <div className="section-title__pin" ref={pinRef}>
        <div className="section-title__bg">
          <img ref={glyphRef} src="/assets/intro-bg.svg" alt="" />
        </div>

        {subtitle && (
          <div className="section-title__beat">
            <p ref={firstRef} className="section-title__lead">
              {subtitle}
            </p>
          </div>
        )}

        <div className="section-title__beat">
          {heading && (
            <h2 ref={headingRef} className="section-title__heading">
              {heading}
            </h2>
          )}
          {description && (
            <h4 ref={descriptionRef} className="section-title__description">
              {description}
            </h4>
          )}
        </div>
      </div>
    </section>
  );
}

import { useRef } from 'react';
import { gsap, IS_WIDE } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import { useSplitTextEffect } from '../../hooks/useSplitTextEffect';
import { TESTIMONIALS } from './testimonialData';
import './Testimonials.css';

/**
 * Floating quote bubbles around a blurred, counter-spinning gradient.
 * The motif bars on either edge slide inwards on scroll; the right-hand set
 * also fades out as it travels.
 */
export default function Testimonials() {
  const sectionRef = useRef(null);
  const headingRef = useRef(null);

  useSplitTextEffect(headingRef);

  useGsapEffect(() => {
    const section = sectionRef.current;
    if (!section || !IS_WIDE) return;

    const leftMotifs = section.querySelectorAll('.--motif .--left img');
    const rightMotifs = section.querySelectorAll('.--motif .--right img');

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    });

    leftMotifs.forEach((img, i) => {
      timeline.to(img, { x: -100 - i * 80, ease: 'none' }, 0);
    });
    rightMotifs.forEach((img, i) => {
      timeline.to(img, { x: -100 + i * 80, opacity: 0, ease: 'none' }, 0);
    });
  }, sectionRef);

  return (
    <section className="testimonials" ref={sectionRef}>
      <div className="--motif">
        <div className="--left">
          <img src="/assets/motif-r1.svg" alt="" />
          <img src="/assets/motif-l1.svg" alt="" />
        </div>
        <div className="--right">
          <img src="/assets/motif-l1.svg" alt="" />
          <img src="/assets/motif-r1.svg" alt="" />
        </div>
      </div>

      <div className="spinner-container">
        <img className="bg" src="/assets/loader-bg.webp" alt="From Hello to Closed" />
        <img className="bg --2" src="/assets/loader-bg2.webp" alt="From Hello to Closed" />
      </div>

      <h3 ref={headingRef} data-text-effect>
        From Hello to Closed
      </h3>

      <div className="--bubbles" data-speed=".9">
        {TESTIMONIALS.map((item) => (
          <div key={item.alt}>
            <p>{item.quote}</p>
            <img src={item.avatar} alt={item.alt} />
          </div>
        ))}
      </div>
    </section>
  );
}

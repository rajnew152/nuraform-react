import { useRef } from 'react';
import { gsap, IS_WIDE } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import SectionTitle from '../SectionTitle/SectionTitle';
import HowBlock from './HowBlock';
import { HOW_STEPS } from './productDemoData';
import './ProductDemo.css';

/**
 * The three-step walkthrough. Each block's media slides in from the outer edge
 * as it crosses the viewport — inwards from the right for `--right` blocks and
 * from the left for `--left` ones. Disabled at 768px and below, where the blocks
 * stack and the parallax would only cause horizontal overflow.
 */
export default function ProductDemo() {
  const howRef = useRef(null);

  useGsapEffect(() => {
    if (!IS_WIDE) return;

    gsap.utils.toArray('.how__blocks .--block').forEach((block) => {
      const media = block.querySelector('.--img');
      const from = block.classList.contains('--right') ? '-20%' : '20%';

      gsap.fromTo(
        media,
        { x: from },
        {
          x: '0%',
          ease: 'none',
          scrollTrigger: { trigger: block, start: 'top bottom', end: 'bottom top', scrub: true },
        }
      );
    });
  }, howRef);

  return (
    <section className="how" ref={howRef}>
      <SectionTitle
        hasPadding
        heading="Live in minutes. Closing deals by tonight."
        description="No code, no hiring, no months of training. Tell us how you sell, plug in your tools, and your AI agent starts picking up calls the same day."
      />
      <div className="how__blocks">
        {HOW_STEPS.map((item) => (
          <HowBlock key={item.step} {...item} />
        ))}
      </div>
    </section>
  );
}

import { useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import { USE_CASES, STEP, LEFT_START, RIGHT_START } from './aboutData';

/**
 * Two oversized wheels whose rims meet just off the centre of the screen: the
 * left one carries the photos, the right one the labels. Scrolling rotates both
 * by the same amount while each spoke's content is counter-rotated, so portraits
 * and captions stay upright and line up as a pair at the centre.
 *
 * As in Intro, triggers are elements rather than selector strings so they cannot
 * silently miss the scope element and fall back to a document-wide range.
 */
export default function UseCases() {
  const usersRef = useRef(null);
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  useGsapEffect(() => {
    const users = usersRef.current;
    const container = containerRef.current;
    const left = leftRef.current;
    const right = rightRef.current;
    if (!users || !container || !left || !right) return;

    /* Hidden until the section reaches the top of the viewport. */
    gsap.set(container, { autoAlpha: 0 });
    gsap.to(container, {
      autoAlpha: 1,
      ease: 'none',
      scrollTrigger: { trigger: users, start: 'top top', end: 'top top', scrub: true },
    });

    const leftSpokes = left.querySelectorAll('.circle');
    const rightSpokes = right.querySelectorAll('.circle');

    leftSpokes.forEach((spoke, i) => {
      gsap.set(spoke, { rotation: LEFT_START + i * STEP });
      gsap.set(spoke.querySelector('.image'), { rotation: -(LEFT_START + i * STEP) });
    });

    rightSpokes.forEach((spoke, i) => {
      gsap.set(spoke, { rotation: RIGHT_START + i * STEP });
      gsap.set(spoke.querySelector('.text'), { rotation: -(RIGHT_START + i * STEP) });
    });

    const sweep = 180 + STEP * leftSpokes.length;
    const scroll = { trigger: users, start: 'top top', end: 'bottom bottom', scrub: true };

    gsap.to(left, { rotation: -sweep, ease: 'none', scrollTrigger: { ...scroll, pin: container } });
    gsap.to(left.querySelectorAll('.image'), {
      rotation: `+=${sweep}`,
      ease: 'none',
      scrollTrigger: scroll,
    });
    gsap.to(right, { rotation: -sweep, ease: 'none', scrollTrigger: scroll });
    gsap.to(right.querySelectorAll('.text'), {
      rotation: `+=${sweep}`,
      ease: 'none',
      scrollTrigger: scroll,
    });
  }, usersRef);

  return (
    <div className="--users" ref={usersRef}>
      <div className="container" ref={containerRef}>
        <div className="parent-circle parent-circle-left" ref={leftRef}>
          {USE_CASES.map((item) => (
            <div className="circle" key={item.title}>
              <img src={item.image} alt={item.title} className="image" />
            </div>
          ))}
        </div>

        <div className="parent-circle parent-circle-right" ref={rightRef}>
          {USE_CASES.map((item) => (
            <div className="circle" key={item.title}>
              <div className="text">
                <h4 style={item.wideTitle ? { width: '80%', whiteSpace: 'normal' } : undefined}>
                  {item.title}
                </h4>
                <p>{item.copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

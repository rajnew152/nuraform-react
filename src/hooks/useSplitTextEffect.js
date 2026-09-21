import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { gsap, SplitText, IS_MOBILE } from '../lib/gsap';

/**
 * The site-wide `[data-text-effect]` heading reveal: each word tips up from
 * -90deg on the X axis and settles as the heading scrolls into place.
 * Skipped below 768px, exactly as in the original BaseLayout script.
 */
export function useSplitTextEffect(ref) {
  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el || IS_MOBILE) return;

    const split = new SplitText(el, { type: 'words' });
    const words = split.words;

    gsap.set(words, { perspective: 1000 });
    gsap.set(words, {
      willChange: 'opacity, transform',
      opacity: 0,
      rotationX: -90,
      yPercent: 50,
    });

    const tween = gsap.fromTo(
      words,
      { willChange: 'opacity, transform', opacity: 0, rotationX: -90, yPercent: 50 },
      {
        opacity: 1,
        rotationX: 0,
        yPercent: 0,
        ease: 'power1.inOut',
        stagger: { each: 0.05, from: 0 },
        scrollTrigger: {
          trigger: el,
          start: 'bottom bottom+=10%',
          end: 'bottom center+=10%',
          scrub: 0.9,
        },
      }
    );

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      split.revert();
    };
  }, [ref]);
}

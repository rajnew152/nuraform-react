import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollSmoother } from 'gsap/ScrollSmoother';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText);

/*
 * The original site reads window.innerWidth once, at script-evaluation time, and
 * branches on two different thresholds. Both are mirrored here so the breakpoints
 * behave identically rather than approximately.
 *
 *   IS_MOBILE (< 768)  skips ScrollSmoother, the split-word heading effect and
 *                      the hover-to-play video behaviour.
 *   IS_WIDE   (> 768)  enables the "how" block and testimonial motif parallax.
 */
export const IS_MOBILE = typeof window !== 'undefined' && window.innerWidth < 768;
export const IS_WIDE = typeof window !== 'undefined' && window.innerWidth > 768;

/*
 * React runs the sections' effects (and so creates their pins) before App
 * creates ScrollSmoother, but a pin picks its pinType when it is created. Left
 * alone, the About intro and use-case wheels pin with `position: fixed` inside
 * the smoother's transformed content, which does not hold them in place: the
 * wheels drift up off-centre instead of staying pinned in the middle of the
 * screen. Wherever the smoother runs, pin by transform from the start.
 */
if (!IS_MOBILE) ScrollTrigger.defaults({ pinType: 'transform' });

export { gsap, ScrollTrigger, ScrollSmoother, ScrollToPlugin, SplitText };

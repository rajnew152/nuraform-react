import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';
import { gsap } from '../lib/gsap';

/**
 * Runs `setup` inside a gsap.context() scoped to `scopeRef`, and reverts every
 * tween, ScrollTrigger and SplitText it created on unmount. Scoping means the
 * selector strings inside `setup` resolve against the component's own subtree,
 * which is what keeps the ported animation code as close to the original as
 * possible without leaking global queries.
 */
export function useGsapEffect(setup, scopeRef, deps = []) {
  useIsomorphicLayoutEffect(() => {
    const ctx = gsap.context(setup, scopeRef?.current ?? undefined);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

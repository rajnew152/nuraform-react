import { useRef } from 'react';
import { ScrollSmoother, ScrollTrigger, IS_MOBILE } from './lib/gsap';
import { SmootherContext } from './lib/SmootherContext';
import { useIsomorphicLayoutEffect } from './hooks/useIsomorphicLayoutEffect';

import Navbar from './components/Navbar/Navbar';
import LiquidHero from './components/LiquidHero/LiquidHero';
import Hero from './components/Hero/Hero';
import About from './components/About/About';
import ProductDemo from './components/ProductDemo/ProductDemo';
import FeatureSection from './components/FeatureSection/FeatureSection';
import Testimonials from './components/Testimonials/Testimonials';
import Footer from './components/Footer/Footer';

import './styles/globals.css';

export default function App() {
  const smootherRef = useRef(null);

  /*
   * Child effects have already registered their ScrollTriggers by the time this
   * runs, which matches the original load order. `effects: true` is what makes
   * the `data-speed` / `data-lag` attributes scattered through the markup work.
   * ScrollSmoother is skipped below 768px, where the original hands scrolling
   * back to the browser.
   */
  useIsomorphicLayoutEffect(() => {
    if (!IS_MOBILE) {
      smootherRef.current = ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.2,
        effects: true,
      });
    }

    /*
     * Those triggers were measured against fallback metrics: the variable fonts
     * had not swapped in yet, which changes the height of every wrapped
     * paragraph above them and therefore every pin start further down the page.
     * ScrollTrigger only self-refreshes on window `load`, and in a bundled app
     * that can fire before React has even mounted — so re-measure explicitly
     * here and again once the fonts actually land.
     */
    ScrollTrigger.refresh();

    let cancelled = false;
    document.fonts?.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });

    return () => {
      cancelled = true;
      smootherRef.current?.kill();
      smootherRef.current = null;
    };
  }, []);

  return (
    <SmootherContext.Provider value={smootherRef}>
      <Navbar />
      <div id="smooth-wrapper">
        <main id="smooth-content">
          <LiquidHero />
          <About />
          <ProductDemo />
          <Hero />
          <FeatureSection />
          <Testimonials />
          <Footer />
        </main>
      </div>
    </SmootherContext.Provider>
  );
}

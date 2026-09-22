import { useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import LiquidCanvas from './LiquidCanvas';
import DemoPanel from './DemoPanel';
import { LIQUID_HERO, HERO_STATS, HERO_PROOF } from './liquidHeroData';
import { CheckIcon, SparkleIcon, STAT_ICONS } from './HeroIcons';
import GlobeCanvas from './GlobeCanvas';
import './LiquidHero.css';

/*
 * Globe size (fraction of the visible card's shorter side), line opacity and
 * tint (0 = intro yellow, 1 = resting white).
 */
const GLOBE_START = { radius: 0.035, alpha: 0.2, tint: 0 };
const GLOBE_OPEN = { radius: 0.42, alpha: 0.15 };
const GLOBE_REST = { radius: 0.95, alpha: 0.06, tint: 1 };

/**
 * Opening section: an inset rounded card filled with a pointer-reactive liquid
 * gradient, with a turning wireframe globe drawn over it. Left: badge, headline and supporting line. Right: the demo
 * panel (voice orb and samples, or a text thread). Along the bottom: stat
 * pills and check pills. The fixed navbar floats over it.
 */
export default function LiquidHero() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const globeRef = useRef({ ...GLOBE_START });
  /* The panel's voice orb is a third WebGL scene: start it only after the intro. */
  const [introDone, setIntroDone] = useState(false);

  useGsapEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intro = gsap.timeline({ onComplete: () => setIntroDone(true) });

    /*
     * White logo and nav pill while the header sits over the bright card, but
     * not while the card is still a pill on the white screen: the white half
     * of the logo would vanish. The trigger records whether the nav is over
     * the card; the class is only applied once the card is full.
     */
    const nav = document.querySelector('.nav');
    let overCard = false;
    let cardFull = reduceMotion;
    const syncNav = () => nav?.classList.toggle('white', overCard && cardFull);
    const setOverCard = (value) => () => {
      overCard = value;
      syncNav();
    };

    ScrollTrigger.create({
      trigger: section,
      start: 'top top+=100',
      end: 'bottom top+=60',
      onEnter: setOverCard(true),
      onEnterBack: setOverCard(true),
      onLeave: setOverCard(false),
      onLeaveBack: setOverCard(false),
    });

    /*
     * Load intro, on every load and reload:
     * 1. The liquid appears as a small pill in the middle of a white screen,
     *    with the tiny globe glowing inside it, and grows out to the full card.
     * 2. The globe opens up into a large turning wireframe.
     * 3. It keeps growing past the card's edges and fades back while the
     *    content rises in over it.
     * With reduced motion the card is full, the globe rests, and the copy
     * just fades in.
     */
    const globe = globeRef.current;
    if (reduceMotion) {
      Object.assign(globe, GLOBE_REST);
    } else {
      Object.assign(globe, GLOBE_START);

      /*
       * Tween plain pixel insets and write the clip-path ourselves (GSAP
       * mis-pairs values when browsers collapse `inset()` shorthands). The
       * pill is centred on the first screen's worth of card, the same point
       * the globe is drawn around, since the card can be taller than the
       * viewport.
       */
      const width = card.offsetWidth;
      const height = card.offsetHeight;
      const centerY = Math.min(height, window.innerHeight) / 2;
      const pillX = width * 0.06;
      const pillY = Math.min(height, window.innerHeight) * 0.08;
      const clip = { top: centerY - pillY, bottom: height - centerY - pillY, x: width / 2 - pillX, radius: 999 };
      const applyClip = () => {
        card.style.clipPath = `inset(${clip.top}px ${clip.x}px ${clip.bottom}px ${clip.x}px round ${clip.radius}px)`;
      };
      applyClip();

      intro
        .to(
          clip,
          { top: 0, bottom: 0, x: 0, radius: 24, duration: 1.8, ease: 'expo.inOut', onUpdate: applyClip },
          0.2
        )
        .add(() => {
          card.style.clipPath = '';
        })
        /* The nav flips as the card's edge reaches it, not after the fact. */
        .add(() => {
          cardFull = true;
          syncNav();
        }, '-=0.35')
        /* Gentle eases and no hard stop between the globe's two moves. */
        .to(globe, { ...GLOBE_OPEN, duration: 2.2, ease: 'power2.inOut' }, '-=0.6')
        .to(globe, { ...GLOBE_REST, duration: 2.6, ease: 'sine.inOut' }, '-=0.2');
    }

    intro.from(
      section.querySelectorAll('.liquid-hero__reveal'),
      { opacity: 0, y: 60, duration: 1.1, stagger: 0.12, ease: 'power3.out' },
      reduceMotion ? 0.15 : '-=1.1'
    );

    /* The pills arrive one by one rather than as two whole rows. */
    intro.from(
      section.querySelectorAll('.liquid-hero__proof li'),
      { opacity: 0, y: 40, scale: 0.9, duration: 0.9, stagger: 0.08, ease: 'back.out(1.7)', clearProps: 'transform' },
      '-=0.9'
    );

    /*
     * Hold on the still pill until the page has finished loading (at most
     * 1.2s), so the intro doesn't compete with font, image and script work
     * for the main thread in its first second. Two frames later it plays, once
     * the browser has painted the starting state.
     */
    intro.pause();
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      requestAnimationFrame(() => requestAnimationFrame(() => intro.play()));
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    const fallback = setTimeout(start, 1200);

    return () => {
      clearTimeout(fallback);
      window.removeEventListener('load', start);
    };
  }, sectionRef);

  return (
    <section className="liquid-hero" ref={sectionRef}>
      <div className="liquid-hero__card" ref={cardRef}>
        <LiquidCanvas hoverTarget={cardRef} />
        <GlobeCanvas state={globeRef.current} />

        <div className="liquid-hero__main">
          <div className="liquid-hero__text">
            <p className="liquid-hero__badge liquid-hero__reveal">
              <SparkleIcon size={18} />
              {LIQUID_HERO.badge}
            </p>

            <h1 className="liquid-hero__heading liquid-hero__reveal">
              {LIQUID_HERO.heading.lead} <em>{LIQUID_HERO.heading.accent}</em>
            </h1>

            <p className="liquid-hero__copy liquid-hero__reveal">{LIQUID_HERO.copy}</p>
          </div>

          <DemoPanel className="liquid-hero__reveal" orbReady={introDone} />
        </div>

        <div className={`liquid-hero__proof${introDone ? ' is-settled' : ''}`}>
          <ul className="liquid-hero__stats">
            {HERO_STATS.map(({ icon, label }) => {
              const StatIcon = STAT_ICONS[icon];
              return (
                <li key={label}>
                  {/* The pill floats; the inner layer takes the hover lift. */}
                  <span className="--inner">
                    <StatIcon size={22} />
                    {label}
                  </span>
                </li>
              );
            })}
          </ul>
          <ul className="liquid-hero__checks">
            {HERO_PROOF.map((item) => (
              <li key={item}>
                <span className="--inner">
                  <span className="--tick">
                    <CheckIcon size={14} />
                  </span>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

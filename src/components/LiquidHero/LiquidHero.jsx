import { useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import LiquidCanvas from './LiquidCanvas';
import { LIQUID_HERO } from './liquidHeroData';
import { ArrowRightIcon } from '../icons/Icons';
import './LiquidHero.css';

/**
 * Opening section: an inset rounded card filled with a pointer-reactive liquid
 * gradient, a large headline, a supporting line bottom-left and the CTA
 * bottom-right. The fixed navbar floats over it.
 */
export default function LiquidHero() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useGsapEffect(() => {
    const section = sectionRef.current;
    const card = cardRef.current;
    if (!section || !card) return;

    /*
     * Load intro: the liquid appears as a small pill in the middle of a white
     * screen and grows in one smooth move out to the full card, then the copy
     * rises in. Clip-path only, so layout never shifts. Skipped for
     * reduced motion, where only the copy fades in.
     */
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const intro = gsap.timeline();

    /*
     * White logo and nav pill while the header sits over the bright card, but
     * not during the intro: the card is still a pill on a white screen then, so
     * the white half of the logo would vanish. The trigger records whether the
     * nav is over the card; the class is only applied once the card is full.
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

    if (!reduceMotion) {
      /*
       * Tween plain numbers and write the clip-path ourselves: browsers
       * collapse `inset(19% 19% 19% 19%)` to `inset(19%)`, and GSAP tweening
       * between strings with different value counts pairs the wrong numbers.
       */
      const clip = { y: 42, x: 44, radius: 999 };
      const applyClip = () => {
        card.style.clipPath = `inset(${clip.y}% ${clip.x}% ${clip.y}% ${clip.x}% round ${clip.radius}px)`;
      };
      applyClip();

      /* One continuous move: small pill straight out to the full card. */
      intro
        .to(clip, {
          y: 0,
          x: 0,
          radius: 24,
          duration: 1.8,
          ease: 'expo.inOut',
          onUpdate: applyClip,
        })
        .add(() => {
          card.style.clipPath = '';
        })
        /* The nav flips as the card's edge reaches it, not after the fact. */
        .add(() => {
          cardFull = true;
          syncNav();
        }, '-=0.35');
    }

    intro.from(
      section.querySelectorAll('.liquid-hero__reveal'),
      { opacity: 0, y: 60, duration: 1.1, stagger: 0.12, ease: 'power3.out' },
      reduceMotion ? 0.15 : '-=0.45'
    );
  }, sectionRef);

  return (
    <section className="liquid-hero" ref={sectionRef}>
      <div className="liquid-hero__card" ref={cardRef}>
        <LiquidCanvas hoverTarget={cardRef} />

        <h1 className="liquid-hero__heading">
          {LIQUID_HERO.heading.map((line) => (
            <span className="liquid-hero__reveal" key={line}>
              {line}
            </span>
          ))}
        </h1>

        <div className="liquid-hero__footer">
          <p className="liquid-hero__copy liquid-hero__reveal">{LIQUID_HERO.copy}</p>
          <a className="liquid-hero__cta liquid-hero__reveal" href={LIQUID_HERO.cta.href}>
            <span>{LIQUID_HERO.cta.label}</span>
            <span className="--arrow" aria-hidden="true">
              <ArrowRightIcon />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}

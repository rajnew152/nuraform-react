import { useRef } from 'react';
import { gsap, ScrollTrigger } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import { useUnicornStudio } from '../../hooks/useUnicornStudio';
import CtaButton from '../CtaButton/CtaButton';
import { QuoteMarkIcon } from '../icons/Icons';
import VoiceGlow from './VoiceGlow';
import { HERO_PHOTOS, PHOTO_WIPE, PHOTO_HOLD } from './heroData';
import './Hero.css';

const UNICORN_PROJECT = 'R4QGWiyS7SYks3bqd6Y5';

export default function Hero() {
  const bannerRef = useRef(null);

  useUnicornStudio();

  useGsapEffect(() => {
    const banner = bannerRef.current;

    /*
     * Photo carousel, as on the original site: each photo opens with a circular
     * wipe from the centre (power4.out) on top of the one before, which is then
     * closed underneath it. Each incoming photo is raised above the rest, so the
     * loop wraps from the last back to the first without a gap. It starts the
     * first time the hero scrolls into view.
     */
    const photos = banner ? gsap.utils.toArray(banner.querySelectorAll('.masked-img')) : [];
    let pending = null;

    if (photos.length) {
      let index = -1;
      let layer = 1;

      const showNext = () => {
        const previous = photos[index];
        index = (index + 1) % photos.length;
        const photo = photos[index];

        gsap.set(photo, { zIndex: ++layer, visibility: 'visible' });
        gsap.fromTo(
          photo,
          { clipPath: 'circle(0% at 50% 50%)', opacity: 1 },
          {
            clipPath: 'circle(75% at 50% 50%)',
            duration: PHOTO_WIPE,
            ease: 'power4.out',
            onComplete: () => {
              /* Drop the settled photo's clip mask, and take the covered one out of rendering. */
              photo.style.clipPath = 'none';
              if (previous && previous !== photo) {
                gsap.set(previous, { clipPath: 'circle(0% at 50% 50%)', visibility: 'hidden' });
              }
            },
          }
        );

        if (photos.length > 1) pending = gsap.delayedCall(PHOTO_WIPE + PHOTO_HOLD, showNext);
      };

      /*
       * Decode the photos off the main thread while the hero is still a screen
       * away, so the first wipe never stalls a scroll frame on a big JPEG decode.
       */
      ScrollTrigger.create({
        trigger: banner,
        start: 'top bottom+=100%',
        once: true,
        onEnter: () => photos.forEach((img) => img.decode?.().catch(() => {})),
      });

      ScrollTrigger.create({ trigger: banner, start: 'top 70%', once: true, onEnter: showNext });
    }

    /* Decorative motif bars drift sideways as the banner scrolls away. */
    const topMotif = banner?.querySelector('.banner__motifs .--top img');
    const bottomMotifs = banner?.querySelectorAll('.banner__motifs .--bottom img') ?? [];

    if (banner) {
      const parallax = gsap.timeline({
        scrollTrigger: {
          trigger: banner,
          start: 'top top',
          end: 'bottom top-=500',
          scrub: true,
        },
      });
      parallax.to(topMotif, { x: 150, ease: 'power2.out' }, 0);
      parallax.to(bottomMotifs[0], { x: -120, ease: 'power2.out' }, 0);
      parallax.to(bottomMotifs[1], { x: 60, ease: 'power2.out' }, 0);
      parallax.to(bottomMotifs[2], { x: -240, ease: 'power2.out' }, 0);
      parallax.to(bottomMotifs[3], { x: 60, ease: 'power2.out' }, 0);
    }

    /* While the header overlaps the orange banner it switches to its light theme. */
    const nav = document.querySelector('.nav');
    ScrollTrigger.create({
      trigger: banner,
      start: 'top top+=100',
      end: 'bottom top+=60',
      onEnter: () => nav?.classList.add('white'),
      onEnterBack: () => nav?.classList.add('white'),
      onLeave: () => nav?.classList.remove('white'),
      onLeaveBack: () => nav?.classList.remove('white'),
    });

    /* The carousel's delayed calls are created later, outside the context, so stop them here. */
    return () => pending?.kill();
  }, bannerRef);

  return (
    <section className="banner" ref={bannerRef}>
      {/*
       * Soft full-screen gradient: rendering it at half resolution and 1x DPI
       * looks identical but cuts the GPU work per frame by roughly 4-8x, which
       * is what kept scrolling into this section from staying smooth.
       */}
      <div data-us-project={UNICORN_PROJECT} data-us-scale="0.5" data-us-dpi="1" className="--bg" />

      <div className="banner__text">
        <div className="--left">
          <div>
            <h1 data-speed="1.1">AI Voice Agents That Close, Not Just Call.</h1>
            <CtaButton variant="white" href="/demo">
              Book a Free Demo
            </CtaButton>
          </div>
          <div>
            <a href="/demo#live-call">Hear a real call →</a>
            <a href="mailto:contact@betterpitch.ai">Talk to sales →</a>
          </div>
        </div>

        <div className="--right">
          <div>
            <QuoteMarkIcon />
            <p>
              Every call answered in under a second — inbound, outbound, 3AM or Christmas morning.
              Better Pitch qualifies leads, handles objections, books meetings and updates your CRM,
              so your team only talks to buyers who are ready.
            </p>
          </div>
        </div>
      </div>

      <div className="banner__motifs">
        <div className="--circle --photo">
          {/* Sits under the voice rings, which are later in the DOM. */}
          <div className="image-wrapper">
            {HERO_PHOTOS.map((photo) => (
              <img
                className="masked-img"
                key={photo.src}
                src={photo.src}
                alt={photo.alt}
                decoding="async"
              />
            ))}
          </div>
          <VoiceGlow pauseWhenIdle />
        </div>

        <div className="--top">
          <img src="/assets/motif-t1.svg" alt="" />
        </div>

        <div className="--bottom">
          <div>
            <img src="/assets/motif-l1.svg" alt="" />
            <img src="/assets/motif-r1.svg" alt="" />
          </div>
          <div>
            <img src="/assets/motif-l2.svg" alt="" />
            <img src="/assets/motif-r2.svg" alt="" />
          </div>
        </div>
      </div>
    </section>
  );
}

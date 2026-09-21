import { useRef } from 'react';
import { gsap } from '../../lib/gsap';
import { useGsapEffect } from '../../hooks/useGsapEffect';
import CTA from '../CTA/CTA';
import { LogoMark } from '../icons/Icons';
import './Footer.css';

const BAR_COUNT = 7;

const AVATARS = [
  { className: 'a1', src: '/assets/person1.png' },
  { className: 'a2', src: '/assets/person2.png' },
  { className: 'a3', src: '/assets/person3.png' },
];

export default function Footer() {
  const footerRef = useRef(null);

  useGsapEffect(() => {
    const bars = gsap.utils.toArray('.footer__lines .bar');
    const logo = document.querySelector('.--mark .logo');
    const avatars = gsap.utils.toArray('.--mark .avatar-wrap');
    if (!bars.length) return;

    const middle = Math.floor(bars.length / 2);

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: '.footer__lines',
        start: 'bottom bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    /* Bars grow outwards from the centre, so their delay tracks their distance from it. */
    bars.forEach((bar, i) => {
      timeline.fromTo(bar, { scaleY: 0 }, { scaleY: 1, ease: 'power3.out' }, Math.abs(i - middle) * 0.1);
    });

    if (logo) {
      timeline.fromTo(logo, { scale: 0 }, { scale: 1, ease: 'power3.out' }, '-0.05');
    }

    /*
     * The avatars are laid out by CSS, then pulled back to the centre of the mark
     * and released to their real offsets — which is why the offsets are read from
     * the DOM rather than hard-coded.
     */
    avatars.forEach((avatar, i) => {
      const { offsetLeft, offsetTop, parentElement } = avatar;
      gsap.set(avatar, { x: 0, y: 0 });

      timeline.to(
        avatar,
        {
          x: offsetLeft - parentElement.offsetWidth / 2,
          y: offsetTop - parentElement.offsetHeight / 2,
          opacity: 1,
          ease: 'power3.out',
          onComplete: () => {
            const img = avatar.querySelector('img');
            if (img) img.style.animationPlayState = 'running';
          },
        },
        `-=${0.8 - i * 0.04}`
      );
    });
  }, footerRef);

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer__lines">
        {Array.from({ length: BAR_COUNT }, (_, index) => (
          <div className="bar" key={index} style={{ '--index': index }} />
        ))}

        <div className="--mark">
          <span>
            <LogoMark className="logo" />
          </span>
          {AVATARS.map((avatar) => (
            <span className={`avatar-wrap ${avatar.className}`} key={avatar.className}>
              <img src={avatar.src} alt="" />
            </span>
          ))}
        </div>
      </div>

      <CTA />

      <div className="__links">
        <div>
          <a data-speed="1.3" href="/platform">
            Platform
          </a>
          <a data-speed="1.1" href="/pricing">
            Pricing
          </a>
          <a href="mailto:contact@betterpitch.ai">Contact</a>
        </div>

        <LogoMark />

        <div>
          <a href="#" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a data-speed="1.1" href="#" target="_blank" rel="noreferrer">
            Twitter
          </a>
          <a
            data-speed="1.3"
            href="#"
            target="_blank"
            rel="noreferrer"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <div className="__legal">
        <p>© 2026 Better Pitch. All rights reserved.</p>
        <div>
          <a href="/terms">Terms &amp; Use</a>
          <span>|</span>
          <a href="/privacy">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

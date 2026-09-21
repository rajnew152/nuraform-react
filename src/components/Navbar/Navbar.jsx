import { useCallback, useRef, useState } from 'react';
import Logo from '../Logo/Logo';
import CtaButton from '../CtaButton/CtaButton';
import { useSmoother } from '../../lib/SmootherContext';
import { NAV_LINKS, DRAWER_LINKS, SOCIALS } from './navData';
import './Navbar.css';

/**
 * Fixed header plus the full-screen drawer used below 768px.
 *
 * The `white` class is added by the hero's ScrollTrigger while the header sits
 * over the orange banner; opening the drawer has to strip it and put it back on
 * close, otherwise the white logo lands on the drawer's white panel.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);
  const wasWhiteRef = useRef(false);
  const smoother = useSmoother();

  const setDrawer = useCallback(
    (next) => {
      const nav = navRef.current;
      setOpen(next);

      if (nav) {
        if (next) {
          wasWhiteRef.current = nav.classList.contains('white');
          nav.classList.remove('white');
        } else if (wasWhiteRef.current) {
          nav.classList.add('white');
        }
      }

      smoother.current?.paused(next);
    },
    [smoother]
  );

  return (
    <>
      {/* NAVIGATION */}
      <div className="nav" ref={navRef}>
        <Logo />

        <div className="nav__links">
          {NAV_LINKS.map((link) => (
            <a key={link.label} href={link.href}>
              {link.label}
            </a>
          ))}
          <CtaButton href="/demo">
            Book a Free Demo
          </CtaButton>
        </div>

        <div
          className={`nav__menu-btn${open ? ' open' : ''}`}
          role="button"
          tabIndex={0}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setDrawer(!open)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setDrawer(!open);
            }
          }}
        >
          <span />
          <span />
          <span />
          <span />
        </div>
      </div>

      <div className={`nav__menu${open ? ' open' : ''}`}>
        <div className="bg" onClick={() => setDrawer(false)} />
        <div className="content">
          <ul className="links scroll-link">
            {DRAWER_LINKS.map((link) => (
              <li key={link.label}>
                <a href={link.href} onClick={() => setDrawer(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="--cta">
            <CtaButton href="/login">Log In</CtaButton>
            <CtaButton href="/demo">Book a Demo</CtaButton>
          </div>

          <ul className="socials">
            {SOCIALS.map((social) => (
              <li key={social.label}>
                <a href={social.href} aria-label={social.label}>
                  <img src={social.icon} alt="" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {/* NAV END */}
    </>
  );
}

import { useEffect, useRef, useState } from 'react';
import { gsap } from '../../lib/gsap';
import { useIsomorphicLayoutEffect } from '../../hooks/useIsomorphicLayoutEffect';
import SectionTitle from '../SectionTitle/SectionTitle';
import LiquidCanvas from '../LiquidHero/LiquidCanvas';
import { ArrowRightIcon } from '../icons/Icons';
import { TEAM, TEAM_TITLE, TEAM_HOLD, TEAM_WIPE } from './teamData';
import './TeamSection.css';

const initials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('');

/** Round portrait; shows the initials when the photo file is missing. */
function Portrait({ member }) {
  const [failed, setFailed] = useState(false);

  return (
    <div className="team__photo">
      {failed ? (
        <span className="team__initials">{initials(member.name)}</span>
      ) : (
        <img src={member.photo} alt={member.name} onError={() => setFailed(true)} />
      )}
      <span className="team__badge">{member.badge}</span>
    </div>
  );
}

/**
 * A liquid-gradient block holding one white card, one person at a time:
 * details on the left, their photo in the panel on the right. The pointer
 * stirs the liquid anywhere over the block. People rotate on a timer once it is on
 * screen; each portrait opens with the hero's circular wipe on top of the one
 * before, while the details swap with a short fade-up. The tabs jump straight
 * to a person and restart the timer.
 */
export default function TeamSection() {
  const rootRef = useRef(null);
  const layerRef = useRef(1);
  const firstRef = useRef(true);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.35,
    });
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return undefined;
    const timer = setTimeout(() => setActive((i) => (i + 1) % TEAM.length), TEAM_HOLD * 1000);
    return () => clearTimeout(timer);
  }, [active, inView]);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const photos = root.querySelectorAll('.team__photo');
    const details = root.querySelectorAll('.team__details');
    const photo = photos[active];
    const detail = details[active];

    gsap.set(photo, { zIndex: ++layerRef.current });

    if (firstRef.current) {
      firstRef.current = false;
      gsap.set(photo, { clipPath: 'circle(75% at 50% 50%)' });
      gsap.set(detail, { autoAlpha: 1 });
      return undefined;
    }

    const tweens = [
      gsap.fromTo(
        photo,
        { clipPath: 'circle(0% at 50% 50%)' },
        {
          clipPath: 'circle(75% at 50% 50%)',
          duration: TEAM_WIPE,
          ease: 'power4.out',
          onComplete: () => {
            photos.forEach((other) => {
              if (other !== photo) gsap.set(other, { clipPath: 'circle(0% at 50% 50%)' });
            });
          },
        }
      ),
    ];

    details.forEach((other) => {
      if (other !== detail) {
        tweens.push(gsap.to(other, { autoAlpha: 0, y: -16, duration: 0.35, ease: 'power1.in' }));
      }
    });

    gsap.set(detail, { autoAlpha: 1, y: 0 });
    tweens.push(
      gsap.fromTo(
        detail.children,
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.08, ease: 'power3.out', delay: 0.3 }
      )
    );

    return () => tweens.forEach((tween) => tween.progress(1).kill());
  }, [active]);

  return (
    <section className="team" ref={rootRef}>
      <div className="team__bg">
        <LiquidCanvas hoverTarget={rootRef} />
      </div>

      <SectionTitle hasPadding {...TEAM_TITLE} />

      <div className="team__card">
        <div className="team__info">
          <div className="team__stack">
            {TEAM.map((member, i) => (
              <div className="team__details" key={member.name} aria-hidden={i !== active}>
                <p className="team__role">{member.role}</p>
                <h3 className="team__name">{member.name}</h3>
                <p className="team__bio">{member.bio}</p>
                <a
                  className="team__link"
                  href={member.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  tabIndex={i === active ? 0 : -1}
                >
                  <span>LinkedIn</span>
                  <span className="--arrow" aria-hidden="true">
                    <ArrowRightIcon />
                  </span>
                </a>
              </div>
            ))}
          </div>

          <div className="team__tabs" role="tablist" aria-label="Team members">
            {TEAM.map((member, i) => (
              <button
                key={member.name}
                type="button"
                role="tab"
                aria-selected={i === active}
                className={`team__tab${i === active ? ' is-active' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="team__tab-label">{member.name}</span>
                <span className="team__tab-track">
                  {i === active && (
                    <span
                      key={active}
                      className={`team__tab-fill${inView ? '' : ' is-paused'}`}
                      style={{ animationDuration: `${TEAM_HOLD}s` }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="team__panel">
          <div className="team__photos">
            {TEAM.map((member) => (
              <Portrait key={member.name} member={member} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { campus, timeline } from '@/lib/data';
import { scrollToId } from '@/lib/scroll';

gsap.registerPlugin(ScrollTrigger);

export default function Campus() {
  const root = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add('(min-width: 861px) and (prefers-reduced-motion: no-preference)', () => {
      root.current.classList.add('is-pinned');
      const distance = () => track.current.scrollWidth - innerWidth;
      const tween = gsap.to(track.current, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          onUpdate: (self) => bar.current && (bar.current.style.transform = `scaleX(${self.progress})`),
        },
      });
      track.current.querySelectorAll('.campus__photo img').forEach((img) => {
        gsap.fromTo(
          img,
          { xPercent: -8 },
          {
            xPercent: 8,
            ease: 'none',
            scrollTrigger: { trigger: img.closest('.campus__panel'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          }
        );
      });
      track.current.querySelectorAll('.campus__year').forEach((el) => {
        gsap.from(el, {
          yPercent: 60,
          opacity: 0,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, containerAnimation: tween, start: 'left 85%', end: 'left 45%', scrub: true },
        });
      });
      const section = root.current;
      return () => section.classList.remove('is-pinned');
    });
    return () => mm.revert();
  }, []);

  const photos = campus.photos;
  const slots = [timeline[0], null, timeline[1], null, timeline[2]];

  return (
    <section id="campus" ref={root} className="campus" aria-labelledby="campus-title">
      <div ref={track} className="campus__track">
        <div className="campus__panel campus__intro">
          <div className="label mono">
            <span>(02)</span>
            <span>Campus</span>
          </div>
          <h2 id="campus-title" className="display display--sm">
            Vellore, <em className="serif">Tamil Nadu</em>
          </h2>
          <p className="campus__lede">
            Four years at the {campus.title}, studying {campus.degree.replace('B.Tech, ', '').toLowerCase()} — class of {campus.classOf}.
          </p>
          <div className="campus__gpa">
            <span className="campus__gpa-num">{campus.cgpa}</span>
            <span className="campus__gpa-meta mono">
              CGPA / 10
              <br />
              {campus.best}
            </span>
          </div>
          <ul className="campus__courses" aria-label="Selected coursework">
            {campus.coursework.map((c) => (
              <li key={c} className="mono">
                {c}
              </li>
            ))}
          </ul>
          <span className="campus__hint mono" aria-hidden="true">
            Keep scrolling →
          </span>
        </div>

        {photos.map((ph, i) => (
          <Fragment key={ph.src}>
            <figure className="campus__panel campus__photo" data-shape={i % 2 ? 'tall' : 'wide'}>
              <div className="campus__frame">
                <Image src={ph.src} alt={`${ph.title}, VIT Vellore`} fill sizes="(max-width: 860px) 85vw, 50vw" />
              </div>
              <figcaption>
                <span className="campus__photo-n mono">{String(i + 1).padStart(2, '0')}</span>
                <span className="campus__photo-title">{ph.title}</span>
                <span className="campus__photo-cap">{ph.caption}</span>
                <a className="campus__credit mono" href={ph.source} target="_blank" rel="noopener noreferrer">
                  Photo: {ph.credit} · {ph.license}
                </a>
              </figcaption>
            </figure>
            {slots[i] && (
              <div className="campus__panel campus__milestone">
                <span className="campus__year serif">{slots[i].year}</span>
                <p>{slots[i].text}</p>
              </div>
            )}
          </Fragment>
        ))}

        <div className="campus__panel campus__end">
          <p className="campus__end-kicker mono">Next stop</p>
          <p className="campus__end-title">
            Your team<em className="serif">?</em>
          </p>
          <a
            href="#contact"
            className="btn btn--accent"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('contact');
            }}
            data-cursor="Let's talk"
          >
            Start a conversation <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <div className="campus__progress" aria-hidden="true">
        <span ref={bar} />
      </div>
    </section>
  );
}

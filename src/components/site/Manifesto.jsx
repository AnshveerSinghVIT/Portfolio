'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { manifesto, profile } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

function PortraitStack() {
  const [open, setOpen] = useState(false);
  const [front, setFront] = useState(0);
  const photos = profile.photos;

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setFront((f) => (f + 1) % photos.length), 1100);
    return () => clearInterval(id);
  }, [open, photos.length]);

  return (
    <button
      type="button"
      className="manifesto__portrait"
      data-open={open}
      aria-expanded={open}
      aria-label="Show photos of Anshveer"
      data-cursor="Say hi"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onClick={() => setOpen((o) => !o)}
    >
      <span className="manifesto__portrait-img">
        <Image src={photos[0].src} alt="" fill sizes="240px" priority />
      </span>
      <span className="stack" aria-hidden="true">
        {photos.map((p, i) => {
          const order = (i - front + photos.length) % photos.length;
          return (
            <span key={p.src} className="stack__card" style={{ '--o': order, '--r': `${(i - 1.5) * 7}deg` }}>
              <Image src={p.src} alt={p.alt} fill sizes="260px" />
            </span>
          );
        })}
      </span>
    </button>
  );
}

export default function Manifesto() {
  const root = useRef(null);
  const words = manifesto.split(' ');
  const [first, ...rest] = words;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto__word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 50%', scrub: true },
        }
      );
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="manifesto" aria-label="About">
      <div className="label mono">
        <span>(About)</span>
        <span>A note before the work</span>
      </div>
      <p className="manifesto__text">
        <span className="manifesto__word">{first}</span> <PortraitStack />{' '}
        {rest.map((w, i) => (
          <span key={i}>
            <span className="manifesto__word">{w}</span>{' '}
          </span>
        ))}
      </p>
      <dl className="manifesto__facts">
        <div>
          <dt className="mono">Based in</dt>
          <dd>{profile.location}</dd>
        </div>
        <div>
          <dt className="mono">Studying</dt>
          <dd>CSE at VIT Vellore, class of ’27</dd>
        </div>
        <div>
          <dt className="mono">Focus</dt>
          <dd>AI/ML · full-stack · 3D web</dd>
        </div>
        <div>
          <dt className="mono">Most recently</dt>
          <dd>Intern, Dell Technologies</dd>
        </div>
      </dl>
    </section>
  );
}

'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { manifesto, profile } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const PORTRAIT_AFTER = 2;

export default function Manifesto() {
  const root = useRef(null);
  const words = manifesto.split(' ');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto__word',
        { opacity: 0.12 },
        {
          opacity: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 45%', scrub: true },
        }
      );
      gsap.fromTo(
        '.manifesto__portrait',
        { width: '0.2em' },
        {
          width: '1.9em',
          ease: 'power2.out',
          scrollTrigger: { trigger: '.manifesto__text', start: 'top 85%', end: 'top 40%', scrub: true },
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
        {words.map((w, i) => (
          <span key={i}>
            <span className="manifesto__word">{w}</span>{' '}
            {i === PORTRAIT_AFTER && (
              <span className="manifesto__portrait" aria-hidden="true">
                <Image src="/profile.jpg" alt="" fill sizes="200px" />
              </span>
            )}
            {i === PORTRAIT_AFTER && ' '}
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
          <dd>CSE at VIT, Vellore</dd>
        </div>
        <div>
          <dt className="mono">Focus</dt>
          <dd>Web · ML · 3D on the web</dd>
        </div>
        <div>
          <dt className="mono">Currently</dt>
          <dd>Open to internships</dd>
        </div>
      </dl>
    </section>
  );
}

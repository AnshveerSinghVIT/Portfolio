'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '@/lib/data';
import { scrollToId } from '@/lib/scroll';
import LocalTime from './LocalTime';

const HeroBlob = dynamic(() => import('./HeroBlob'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

function Letters({ text, offset = 0 }) {
  return text.split('').map((ch, i) => (
    <span key={i} className="char" style={{ '--i': i + offset }}>
      <span>{ch}</span>
    </span>
  ));
}

export default function Hero() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero__name', {
        yPercent: -18,
        opacity: 0.15,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__foot', {
        y: -60,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '60% top', scrub: true },
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title">
      <HeroBlob />

      <div className="hero__meta mono reveal" style={{ '--d': '0.1s' }}>
        <span>Portfolio — Edition 2026</span>
        <span className="hero__meta-mid">{profile.coords}</span>
        <span>Index / 001</span>
      </div>

      <h1 id="hero-title" className="hero__name">
        <span className="hero__line hero__line--sans">
          <Letters text={profile.first} />
        </span>
        <span className="hero__line hero__line--serif">
          <span className="hero__aside mono reveal" style={{ '--d': '0.9s' }}>
            ( Full-stack
            <br />× ML engineer )
          </span>
          <span className="hero__word">
            <Letters text={profile.last} offset={profile.first.length} />
            <span className="char hero__dot" style={{ '--i': profile.first.length + profile.last.length }}>
              <span>.</span>
            </span>
          </span>
        </span>
      </h1>

      <div className="hero__foot">
        <p className="hero__intro reveal" style={{ '--d': '1.05s' }}>
          I design and engineer software at the edge of <em>models</em> and <em>interfaces</em> — studying CS at VIT
          Vellore, shipping from Bengaluru.
        </p>
        <div className="hero__status reveal" style={{ '--d': '1.15s' }}>
          <span className="pulse" aria-hidden="true" />
          <span>
            Open to internships
            <br />& collaborations
          </span>
        </div>
        <div className="hero__side mono reveal" style={{ '--d': '1.25s' }}>
          <span>
            Local — <LocalTime seconds />
          </span>
          <a
            href="#work"
            className="hero__scroll"
            onClick={(e) => {
              e.preventDefault();
              scrollToId('work');
            }}
            data-cursor="Dive in"
          >
            Scroll to explore
            <span className="hero__scroll-line" aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '@/lib/data';
import { emit, scrollToId } from '@/lib/scroll';
import LocalTime from './LocalTime';

const HeroBlob = dynamic(() => import('./HeroBlob'), { ssr: false });

gsap.registerPlugin(ScrollTrigger);

const RING = 'Software engineer — AI/ML & full-stack ✦ VIT Vellore ’27 ✦ Bengaluru, India ✦ ';

function PressureLetters({ text, offset = 0 }) {
  return text.split('').map((ch, i) => (
    <span key={i} className="char" data-pressure style={{ '--i': i + offset }}>
      <span>{ch}</span>
    </span>
  ));
}

export default function Hero() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to('.hero__line', {
        yPercent: -22,
        scale: 0.94,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero__ring', {
        scale: 1.35,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '70% top', scrub: true },
      });
      gsap.to('.hero__foot, .hero__meta', {
        y: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: '50% top', scrub: true },
      });
    }, root);

    const letters = [...root.current.querySelectorAll('[data-pressure]')];
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let mouse = null;
    const weights = letters.map(() => 600);
    const tick = () => {
      raf = 0;
      let moving = false;
      letters.forEach((el, i) => {
        let target = 600;
        if (mouse) {
          const r = el.getBoundingClientRect();
          const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
          const t = Math.max(0, 1 - d / 420);
          target = 260 + 640 * t * t;
        }
        weights[i] += (target - weights[i]) * 0.18;
        if (Math.abs(target - weights[i]) > 1) moving = true;
        el.style.fontWeight = Math.round(weights[i]);
      });
      if (moving) raf = requestAnimationFrame(tick);
    };
    const onMove = (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const onLeave = () => {
      mouse = null;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const hero = root.current;
    if (fine && !reduced) {
      hero.addEventListener('pointermove', onMove);
      hero.addEventListener('pointerleave', onLeave);
    }

    return () => {
      ctx.revert();
      cancelAnimationFrame(raf);
      hero.removeEventListener('pointermove', onMove);
      hero.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const pulse = (e) => {
    if (e.target.closest('a, button')) return;
    const r = root.current.getBoundingClientRect();
    emit('blob:pulse', { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) });
  };

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title" onPointerDown={pulse}>
      <HeroBlob />

      <div className="hero__ring" aria-hidden="true">
        <svg viewBox="0 0 600 600">
          <defs>
            <path id="ring-path" d="M300,300 m-262,0 a262,262 0 1,1 524,0 a262,262 0 1,1 -524,0" />
          </defs>
          <text>
            <textPath href="#ring-path" textLength="1640">
              {RING + RING}
            </textPath>
          </text>
        </svg>
      </div>

      <div className="hero__meta mono">
        <span className="reveal" style={{ '--d': '0.1s' }}>
          Portfolio — Edition 2026
        </span>
        <span className="hero__index reveal" style={{ '--d': '0.3s' }}>
          Index / 001
        </span>
      </div>

      <h1 id="hero-title" className="hero__name">
        <span className="hero__line hero__line--sans">
          <PressureLetters text={profile.first} />
        </span>
        <span className="hero__line hero__line--serif">
          {profile.last.split('').map((ch, i) => (
            <span key={i} className="char" style={{ '--i': profile.first.length + i }}>
              <span>{ch}</span>
            </span>
          ))}
          <span className="char hero__dot" style={{ '--i': profile.first.length + profile.last.length }}>
            <span>.</span>
          </span>
        </span>
        <span className="sr-only"> — {profile.role}</span>
      </h1>

      <div className="hero__foot">
        <p className="hero__intro reveal" style={{ '--d': '1.05s' }}>
          Software engineer working at the edge of <em>models</em> and <em>interfaces</em>. CS at VIT Vellore, ex-intern at Dell
          Technologies.
        </p>
        <div className="hero__side mono reveal" style={{ '--d': '1.25s' }}>
          <span className="hero__hint">( Click anywhere — it reacts )</span>
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

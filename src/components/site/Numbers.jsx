'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stats } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const format = (v, s) => (s.decimals ? v.toFixed(s.decimals) : Math.round(v).toLocaleString('en-IN'));

export default function Numbers() {
  const root = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      root.current.querySelectorAll('[data-stat]').forEach((el) => {
        const s = stats[Number(el.dataset.stat)];
        const out = el.querySelector('.numbers__value-num');
        const obj = { v: 0 };
        out.textContent = format(0, s);
        gsap.to(obj, {
          v: s.value,
          duration: 2.2,
          ease: 'expo.out',
          onUpdate: () => (out.textContent = format(obj.v, s)),
          scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        });
        gsap.from(el.querySelector('.numbers__bar'), { scaleX: 0, duration: 1.6, ease: 'power3.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="numbers" aria-label="By the numbers">
      <div className="label mono">
        <span>(By the numbers)</span>
        <span>Receipts</span>
      </div>
      <ul className="numbers__grid">
        {stats.map((s, i) => (
          <li key={s.label} className="numbers__item" data-stat={i}>
            <span className="numbers__bar" aria-hidden="true" />
            <span className="numbers__value" aria-label={`${format(s.value, s)}${s.suffix ?? ''}`}>
              <span className="numbers__value-num tabular" aria-hidden="true">
                {format(s.value, s)}
              </span>
              <span className="numbers__suffix" aria-hidden="true">
                {s.suffix}
              </span>
            </span>
            <span className="numbers__label">{s.label}</span>
            <span className="numbers__note mono">{s.note}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

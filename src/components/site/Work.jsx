'use client';

import { useEffect, useRef, useState } from 'react';
import { alsoBuilt, projects } from '@/lib/data';
import { emit } from '@/lib/scroll';
import ProjectVisual from './ProjectVisual';

export default function Work() {
  const preview = useRef(null);
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return;
    const el = preview.current;
    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const cur = { ...pos };
    let raf;
    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
    };
    const loop = () => {
      const dx = pos.x - cur.x;
      cur.x += dx * 0.12;
      cur.y += (pos.y - cur.y) * 0.12;
      const skew = Math.max(-12, Math.min(12, dx * 0.06));
      const w = el.offsetWidth;
      const h = el.offsetHeight;
      const x = Math.min(cur.x + 48, innerWidth - w - 24);
      const y = Math.max(24, Math.min(cur.y - h / 2, innerHeight - h - 24));
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${skew * 0.5}deg) skewX(${skew}deg)`;
      raf = requestAnimationFrame(loop);
    };
    loop();
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
    };
  }, []);

  return (
    <section id="work" className="work" aria-labelledby="work-title">
      <div className="section-head">
        <div className="label mono">
          <span>(01)</span>
          <span>Selected work</span>
        </div>
        <h2 id="work-title" className="display">
          Things I&apos;ve <em className="serif">built</em>
          <sup className="mono">({String(projects.length).padStart(2, '0')})</sup>
        </h2>
        <p className="section-sub">Open any project for its full case file. On a keyboard, ⌘&nbsp;K jumps anywhere.</p>
      </div>

      <ul className="work__list" data-hovering={hovered !== null} onMouseLeave={() => setHovered(null)}>
        {projects.map((p, i) => (
          <li key={p.id} className="work__item" data-active={hovered === i} style={{ '--accent': p.accent }}>
            <button
              type="button"
              className="work__row"
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onBlur={() => setHovered(null)}
              onClick={() => emit('case:open', p.id)}
              data-cursor="Open case"
              aria-label={`Open case file: ${p.title}, ${p.kind}`}
            >
              <span className="work__index mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="work__title">
                <span className="work__title-text">{p.title}</span>
                <span className="work__title-text work__title-text--alt serif" aria-hidden="true">
                  {p.title}
                </span>
              </span>
              <span className="work__kind">
                {p.kind}
                <span className="work__context mono">{p.context}</span>
              </span>
              <span className="work__stack mono">{p.stack.join(' / ')}</span>
              <span className="work__arrow" aria-hidden="true">
                ↗
              </span>
            </button>
            <div className="work__mobile-visual">
              <ProjectVisual project={p} sizes="100vw" />
            </div>
          </li>
        ))}
      </ul>
      <p className="work__also mono">
        Also built —{' '}
        {alsoBuilt.map((a) => (
          <span key={a.title}>
            <strong>{a.title}</strong>, {a.kind.toLowerCase()}
          </span>
        ))}
      </p>

      <div ref={preview} className="work__preview" data-show={hovered !== null} aria-hidden="true">
        {projects.map((p, i) => (
          <div key={p.id} className="work__preview-slide" data-active={hovered === i}>
            <ProjectVisual project={p} sizes="440px" />
          </div>
        ))}
      </div>
    </section>
  );
}

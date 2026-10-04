'use client';

import { useEffect, useRef, useState } from 'react';

const VIEWS = [
  { id: 'editorial', href: '/', label: 'Editorial', short: 'Editorial', arrive: 'Back to editorial' },
  { id: 'atlas', href: '/atlas', label: 'Atlas', short: 'Atlas', arrive: 'Unfolding the atlas', isNew: true },
  { id: 'flythrough', href: '/flythrough', label: '3D Flythrough', short: '3D', arrive: 'Entering the flythrough' },
];
const KEY = 'as-view-wipe';

export default function ViewToggle({ current }) {
  const [wipe, setWipe] = useState(null);
  const [target, setTarget] = useState(null);
  const wipeRef = useRef(null);

  useEffect(() => {
    const el = wipeRef.current;
    let t;
    try {
      const origin = JSON.parse(sessionStorage.getItem(KEY));
      sessionStorage.removeItem(KEY);
      if (origin) {
        el.style.setProperty('--x', `${origin.x}px`);
        el.style.setProperty('--y', `${origin.y}px`);
        el.dataset.state = 'covered';
        t = setTimeout(() => (el.dataset.state = 'out'), 150);
      }
    } catch {}
    const onShow = (e) => {
      if (e.persisted) setWipe(null);
    };
    window.addEventListener('pageshow', onShow);
    return () => {
      clearTimeout(t);
      window.removeEventListener('pageshow', onShow);
    };
  }, []);

  const go = (view) => (e) => {
    if (view.id === current || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.location.assign(view.href);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    setTarget(view);
    setWipe(origin);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(origin));
    } catch {}
    setTimeout(() => window.location.assign(view.href), 750);
  };

  return (
    <>
      <nav className="view-toggle" aria-label="Choose how to view the portfolio" data-current={current} data-dev={process.env.NODE_ENV === 'development' || undefined}>
        {VIEWS.map((v) => (
          <a
            key={v.id}
            href={v.href}
            onClick={go(v)}
            aria-current={v.id === current ? 'page' : undefined}
            className="view-toggle__opt"
            data-cursor={v.id === current ? undefined : 'Switch'}
          >
            <span className="view-toggle__long">{v.label}</span>
            <span className="view-toggle__short" aria-hidden="true">
              {v.short}
            </span>
            {v.isNew && v.id !== current && <span className="view-toggle__new">new</span>}
          </a>
        ))}
      </nav>
      <div
        ref={wipeRef}
        className="view-wipe"
        aria-hidden="true"
        data-state={wipe ? 'in' : undefined}
        style={wipe ? { '--x': `${wipe.x}px`, '--y': `${wipe.y}px` } : undefined}
      >
        <span className="view-wipe__label">{wipe && target ? target.arrive : ''}</span>
      </div>
    </>
  );
}

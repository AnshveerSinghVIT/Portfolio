'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const VIEWS = [
  { id: 'editorial', href: '/', label: 'Editorial' },
  { id: 'flythrough', href: '/flythrough', label: '3D Flythrough' },
];
const KEY = 'as-view-wipe';

export default function ViewToggle({ current }) {
  const router = useRouter();
  const [wipe, setWipe] = useState(null);
  const wipeRef = useRef(null);

  useEffect(() => {
    let origin = null;
    try {
      origin = JSON.parse(sessionStorage.getItem(KEY));
      sessionStorage.removeItem(KEY);
    } catch {}
    if (!origin) return;
    const el = wipeRef.current;
    el.style.setProperty('--x', `${origin.x}px`);
    el.style.setProperty('--y', `${origin.y}px`);
    el.dataset.state = 'covered';
    const t = setTimeout(() => (el.dataset.state = 'out'), 120);
    return () => clearTimeout(t);
  }, []);

  const go = (view) => (e) => {
    if (view.id === current || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      router.push(view.href);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const origin = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    setWipe(origin);
    try {
      sessionStorage.setItem(KEY, JSON.stringify(origin));
    } catch {}
    router.prefetch(view.href);
    setTimeout(() => router.push(view.href), 750);
  };

  return (
    <>
      <nav className="view-toggle" aria-label="Choose how to view the portfolio" data-current={current}>
        {VIEWS.map((v) => (
          <Link key={v.id} href={v.href} onClick={go(v)} aria-current={v.id === current ? 'page' : undefined} className="view-toggle__opt" data-cursor={v.id === current ? undefined : 'Switch'}>
            {v.label}
          </Link>
        ))}
        <span className="view-toggle__thumb" aria-hidden="true" />
      </nav>
      <div
        ref={wipeRef}
        className="view-wipe"
        aria-hidden="true"
        data-state={wipe ? 'in' : undefined}
        style={wipe ? { '--x': `${wipe.x}px`, '--y': `${wipe.y}px` } : undefined}
      >
        <span className="view-wipe__label">{wipe ? (current === 'editorial' ? 'Entering the flythrough' : 'Back to editorial') : ''}</span>
      </div>
    </>
  );
}

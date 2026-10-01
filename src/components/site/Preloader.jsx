'use client';

import { useEffect, useState } from 'react';
import { lockScroll, prefersReducedMotion } from '@/lib/scroll';

const WORDS = ['Interfaces', 'Models', 'Systems', 'Experiences'];

export default function Preloader() {
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState('loading');

  useEffect(() => {
    const finish = () => {
      document.documentElement.classList.add('is-ready');
      window.dispatchEvent(new Event('preloader:done'));
    };
    if (prefersReducedMotion()) {
      finish();
      const id = requestAnimationFrame(() => setPhase('gone'));
      return () => cancelAnimationFrame(id);
    }
    const repeat = sessionStorage.getItem('as-visited') === '1';
    sessionStorage.setItem('as-visited', '1');
    const duration = repeat ? 600 : 1600;
    lockScroll(true);
    window.scrollTo(0, 0);

    const timers = [];
    const start = performance.now();
    let raf;
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCount(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(step);
        return;
      }
      const fonts = document.fonts?.ready ?? Promise.resolve();
      Promise.race([fonts, new Promise((r) => setTimeout(r, 800))]).then(() => {
        setPhase('leaving');
        timers.push(setTimeout(finish, 350));
        timers.push(
          setTimeout(() => {
            setPhase('gone');
            lockScroll(false);
          }, 1300)
        );
      });
    };
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };
  }, []);

  if (phase === 'gone') return null;
  const word = WORDS[Math.min(WORDS.length - 1, Math.floor((count / 101) * WORDS.length))];

  return (
    <div className="loader" data-phase={phase} aria-hidden="true">
      <div className="loader__row mono">
        <span>Anshveer Singh</span>
        <span>Portfolio — Ed. 2026</span>
      </div>
      <div className="loader__center">
        <span className="loader__crafting mono">Crafting</span>
        <span key={word} className="loader__word serif">
          {word}
        </span>
      </div>
      <div className="loader__row loader__row--bottom">
        <span className="mono">Bengaluru, IN</span>
        <span className="loader__count">{String(count).padStart(3, '0')}</span>
      </div>
      <div className="loader__bar" style={{ transform: `scaleX(${count / 100})` }} />
    </div>
  );
}

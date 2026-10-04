'use client';

import { useEffect, useState } from 'react';
import { sections } from '@/lib/data';
import { emit, revealResume, scrollToId } from '@/lib/scroll';
import LocalTime from './LocalTime';

export default function Nav() {
  const [active, setActive] = useState('top');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        setProgress(max > 0 ? scrollY / max : 0);
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const go = (id) => (e) => {
    e.preventDefault();
    scrollToId(id);
  };

  return (
    <>
      <div className="progress" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      <header className="nav" data-tone={active === 'contact' ? 'ink' : undefined}>
        <a href="#top" className="mark" onClick={go('top')} data-cursor-mini>
          <span className="mark__badge" aria-hidden="true">
            <svg className="mark__ring" viewBox="0 0 100 100">
              <defs>
                <path id="mark-ring-path" d="M50,50 m-39,0 a39,39 0 1,1 78,0 a39,39 0 1,1 -78,0" />
              </defs>
              <text>
                <textPath href="#mark-ring-path" textLength="243">
                  ANSHVEER ✦ SINGH ✦ PORTFOLIO ✦{' '}
                </textPath>
              </text>
            </svg>
            <span className="mark__flip">
              <span className="mark__face mark__face--front">
                <span className="mark__a">A</span>
                <span className="mark__s">s</span>
              </span>
              <span className="mark__face mark__face--back">↑</span>
            </span>
          </span>
          <span className="mark__word">
            <span className="mark__name">
              Anshveer <em>Singh</em>
            </span>
            <span className="sr-only">, back to top</span>
            <span className="mark__roll" aria-hidden="true">
              <span>Software engineer</span>
              <span>Back to top</span>
            </span>
          </span>
        </a>
        <nav aria-label="Sections" className="nav__links">
          {sections.slice(1).map((s, i) => (
            <a key={s.id} href={`#${s.id}`} className="nav__link" aria-current={active === s.id ? 'true' : undefined} onClick={go(s.id)}>
              <span className="nav__num">0{i + 1}</span>
              {s.label}
            </a>
          ))}
        </nav>
        <div className="nav__right">
          <span className="nav__time mono">
            BLR <LocalTime />
          </span>
          <a
            href="#resume"
            className="nav__resume"
            onClick={(e) => {
              e.preventDefault();
              revealResume();
            }}
            data-cursor="Find it"
          >
            <span className="nav__resume-icon" aria-hidden="true">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M4 1.75h5.5L12.25 4.5v9.75H4z" />
                <path d="M9.25 1.75V4.75h3" />
                <path d="M6.25 8.25h3.5M6.25 10.75h3.5" />
              </svg>
            </span>
            Résumé
          </a>
          <button type="button" className="nav__cmd" onClick={() => emit('palette:open')} data-cursor="Explore">
            <span className="nav__cmd-key" aria-hidden="true">⌘K</span>
            <span className="nav__cmd-text">Menu</span>
          </button>
        </div>
      </header>
    </>
  );
}

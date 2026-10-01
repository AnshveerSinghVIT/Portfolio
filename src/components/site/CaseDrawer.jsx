'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '@/lib/data';
import { lockScroll } from '@/lib/scroll';
import ProjectVisual from './ProjectVisual';
import Magnetic from './Magnetic';

const ease = [0.76, 0, 0.24, 1];

export default function CaseDrawer() {
  const [index, setIndex] = useState(null);
  const closeBtn = useRef(null);
  const returnFocus = useRef(null);
  const panel = useRef(null);
  const open = index !== null;
  const p = open ? projects[index] : null;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback((d) => setIndex((i) => (i + d + projects.length) % projects.length), []);

  useEffect(() => {
    const onOpen = (e) => {
      const i = projects.findIndex((x) => x.id === e.detail);
      if (i >= 0) setIndex(i);
    };
    window.addEventListener('case:open', onOpen);
    const initial = new URLSearchParams(location.search).get('case');
    const openInitial = () => onOpen({ detail: initial });
    if (initial) {
      if (document.documentElement.classList.contains('is-ready')) openInitial();
      else window.addEventListener('preloader:done', openInitial, { once: true });
    }
    return () => {
      window.removeEventListener('case:open', onOpen);
      window.removeEventListener('preloader:done', openInitial);
    };
  }, []);

  useEffect(() => {
    const url = new URL(location.href);
    if (p) url.searchParams.set('case', p.id);
    else url.searchParams.delete('case');
    history.replaceState(history.state, '', url);
  }, [p]);

  useEffect(() => {
    if (!open) return;
    returnFocus.current = document.activeElement;
    lockScroll(true);
    requestAnimationFrame(() => closeBtn.current?.focus());
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('a[href], button');
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      lockScroll(false);
      returnFocus.current?.focus?.();
    };
  }, [open, close, step]);

  useEffect(() => {
    if (open) panel.current?.scrollTo({ top: 0 });
  }, [index, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="drawer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
          <div className="drawer__scrim" onClick={close} />
          <motion.aside
            ref={panel}
            className="drawer__panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="case-title"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.75, ease }}
            data-lenis-prevent
            style={{ '--accent': p.accent }}
          >
            <div className="drawer__bar mono">
              <span>
                Case file {String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}
              </span>
              <div className="drawer__nav">
                <button type="button" onClick={() => step(-1)} aria-label="Previous project">
                  ←
                </button>
                <button type="button" onClick={() => step(1)} aria-label="Next project">
                  →
                </button>
                <button ref={closeBtn} type="button" onClick={close} className="drawer__close">
                  Close <span aria-hidden="true">✕</span>
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                className="drawer__body"
              >
                <p className="drawer__kind mono">
                  {p.kind} <span className="drawer__context">— {p.context}</span>
                </p>
                <h3 id="case-title" className="drawer__title">
                  {p.title}
                </h3>
                <div className="drawer__visual">
                  <ProjectVisual project={p} sizes="(max-width: 760px) 100vw, 720px" priority />
                </div>
                <p className="drawer__summary">{p.summary}</p>

                <div className="drawer__grid">
                  <div>
                    <h4 className="mono">Highlights</h4>
                    <ul className="drawer__points">
                      {p.points.map((pt) => (
                        <li key={pt}>{pt}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="mono">Stack</h4>
                    <ul className="chips">
                      {p.stack.map((s) => (
                        <li key={s} className="chip">
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="drawer__cta">
                  {p.url ? (
                    <Magnetic>
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="btn btn--accent" data-cursor="Let's go">
                        <span>{p.urlLabel}</span> <span aria-hidden="true">↗</span>
                      </a>
                    </Magnetic>
                  ) : (
                    <p className="drawer__note mono">{p.note ?? 'Source available on request.'}</p>
                  )}
                  <button type="button" className="btn btn--ghost" onClick={() => step(1)}>
                    Next: {projects[(index + 1) % projects.length].title} →
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { profile, projects, sections } from '@/lib/data';
import { emit, lockScroll, scrollToId } from '@/lib/scroll';

async function copyEmail() {
  try {
    await navigator.clipboard.writeText(profile.email);
    emit('toast', 'Email copied — say hi');
  } catch {
    window.location.href = `mailto:${profile.email}`;
  }
}

function buildCommands() {
  const open = (url) => () => window.open(url, '_blank', 'noopener');
  return [
    ...sections.map((s) => ({ id: `go-${s.id}`, group: 'Navigate', label: s.label, hint: 'Jump to', run: () => scrollToId(s.id) })),
    ...projects.map((p) => ({ id: `case-${p.id}`, group: 'Case files', label: p.title, hint: p.kind, run: () => emit('case:open', p.id) })),
    { id: 'copy-email', group: 'Actions', label: 'Copy email address', hint: profile.email, run: copyEmail },
    { id: 'resume', group: 'Actions', label: 'Open résumé', hint: 'PDF', run: open(profile.resume) },
    { id: 'mail', group: 'Actions', label: 'Write an email', hint: 'mailto', run: () => (window.location.href = `mailto:${profile.email}`) },
    ...profile.socials.map((s) => ({ id: `social-${s.label}`, group: 'Elsewhere', label: s.label, hint: s.handle, run: open(s.url) })),
  ];
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);
  const inputRef = useRef(null);
  const returnFocus = useRef(null);
  const commands = useMemo(() => buildCommands(), []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter((c) => `${c.group} ${c.label} ${c.hint}`.toLowerCase().includes(q));
  }, [query, commands]);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e) => {
      const typing = /INPUT|TEXTAREA/.test(document.activeElement?.tagName ?? '');
      if ((e.key.toLowerCase() === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault();
        setQuery('');
        setIndex(0);
        setOpen((o) => !o);
      }
    };
    const onOpen = () => {
      setQuery('');
      setIndex(0);
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('palette:open', onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('palette:open', onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      returnFocus.current = document.activeElement;
      lockScroll(true);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else if (returnFocus.current) {
      lockScroll(false);
      returnFocus.current.focus?.();
      returnFocus.current = null;
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.getElementById(`cmd-${results[index]?.id}`)?.scrollIntoView({ block: 'nearest' });
  }, [index, results, open]);

  const run = (cmd) => {
    if (!cmd) return;
    setOpen(false);
    setTimeout(cmd.run, 200);
  };

  const onKeyDown = (e) => {
    const n = Math.max(1, results.length);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndex((i) => (i + 1) % n);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndex((i) => (i - 1 + n) % n);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      run(results[index]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            className="palette__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Command menu"
            initial={{ y: 24, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 12, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
          >
            <div className="palette__search">
              <span className="mono palette__prompt">→</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Where to? Try work, email, vall…"
                aria-label="Search commands"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={results[index] ? `cmd-${results[index].id}` : undefined}
                autoComplete="off"
                spellCheck="false"
              />
              <kbd className="palette__esc">esc</kbd>
            </div>
            <ul className="palette__list" id="palette-list" role="listbox" aria-label="Commands" data-lenis-prevent>
              {results.length === 0 && <li className="palette__empty">Nothing here. Yet.</li>}
              {results.map((c, i) => {
                const header = results[i - 1]?.group !== c.group ? c.group : null;
                return (
                  <li key={c.id} role="presentation">
                    {header && <div className="palette__group mono">{header}</div>}
                    <div
                      id={`cmd-${c.id}`}
                      role="option"
                      aria-selected={i === index}
                      className="palette__item"
                      onMouseMove={() => i !== index && setIndex(i)}
                      onClick={() => run(c)}
                    >
                      <span>{c.label}</span>
                      <span className="palette__hint mono">{c.hint}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="palette__foot mono">
              <span>↑↓ navigate</span>
              <span>↵ select</span>
              <span>⌘K or / to toggle</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

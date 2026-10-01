'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { aiSectionMap, sections } from '@/lib/data';
import { scrollToId } from '@/lib/scroll';
import EmailForm from './EmailForm';

const CHIPS = ['What did you build at Dell?', 'Show me your projects', 'What’s your tech stack?', 'How do I contact you?'];
const GREETING = 'Hi — I’m Anshveer’s AI. Ask me about his work, skills or experience, and I’ll take you to the right part of the page.';

const FALLBACK_NAV = [
  ['projects', ['project', 'built', 'build', 'app', 'github', 'made']],
  ['experience', ['experience', 'intern', 'dell', 'smartbridge', 'job', 'work']],
  ['skills', ['skill', 'stack', 'tech', 'language', 'framework', 'tool']],
  ['contact', ['contact', 'email', 'reach', 'phone', 'hire', 'touch']],
];

function guessNav(text) {
  const t = text.toLowerCase();
  return FALLBACK_NAV.find(([, keys]) => keys.some((k) => t.includes(k)))?.[0] ?? 'none';
}

export default function AskAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'ai', text: GREETING }]);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const launcher = useRef(null);

  const go = (nav) => {
    const id = aiSectionMap[nav];
    if (!id) return;
    if (nav === 'contact') setShowForm(true);
    const label = sections.find((s) => s.id === id)?.label;
    setMessages((m) => [...m, { from: 'nav', text: `Took you to ${label}` }]);
    setTimeout(() => scrollToId(id), 250);
  };

  const ask = useCallback(async (text) => {
    const q = text.trim();
    if (!q) return;
    setMessages((m) => [...m, { from: 'me', text: q }]);
    setBusy(true);
    try {
      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: q }) });
      const data = await res.json();
      setMessages((m) => [...m, { from: 'ai', text: data.reply || 'Hmm, I lost my train of thought. Try again?' }]);
      const nav = res.ok ? data.navigate : guessNav(q);
      if (nav && nav !== 'none') go(nav);
    } catch {
      setMessages((m) => [...m, { from: 'ai', text: 'I can’t reach my brain right now — but I can still point you around.' }]);
      const nav = guessNav(q);
      if (nav !== 'none') go(nav);
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    const onAsk = (e) => {
      setOpen(true);
      if (e.detail) ask(e.detail);
    };
    window.addEventListener('ai:ask', onAsk);
    return () => window.removeEventListener('ai:ask', onAsk);
  }, [ask]);

  useEffect(() => {
    if (!open) return;
    requestAnimationFrame(() => inputRef.current?.focus());
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const btn = launcher.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      btn?.focus();
    };
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, showForm]);

  const submit = (e) => {
    e.preventDefault();
    if (busy) return;
    const input = inputRef.current;
    ask(input.value);
    input.value = '';
  };

  return (
    <>
      <button ref={launcher} type="button" className="ai__launcher" data-open={open} onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-controls="ai-panel" aria-label={open ? 'Close AI chat' : 'Ask my AI'} data-cursor={open ? 'Close' : 'Ask'}>
        <span className="ai__orb" aria-hidden="true" />
        <span className="ai__launcher-text">{open ? 'Close' : 'Ask my AI'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            id="ai-panel"
            className="ai"
            role="dialog"
            aria-label="Ask Anshveer’s AI"
            initial={{ opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 16, scale: 0.97, filter: 'blur(6px)' }}
            transition={{ type: 'spring', stiffness: 360, damping: 32 }}
          >
            <header className="ai__head">
              <span className="ai__orb ai__orb--sm" aria-hidden="true" />
              <div>
                <p className="ai__title">AI Navigator</p>
                <p className="ai__sub mono">Trained on my résumé · may be wrong</p>
              </div>
            </header>

            <ol ref={listRef} className="ai__list" aria-live="polite" data-lenis-prevent>
              {messages.map((m, i) => (
                <li key={i} className={`ai__msg ai__msg--${m.from}`}>
                  {m.from === 'nav' ? <span className="mono">→ {m.text}</span> : m.text}
                </li>
              ))}
              {busy && (
                <li className="ai__msg ai__msg--ai ai__typing" aria-label="Thinking">
                  <span />
                  <span />
                  <span />
                </li>
              )}
              {showForm && (
                <li className="ai__msg--form">
                  <EmailForm
                    onDone={(text) => {
                      setShowForm(false);
                      setMessages((m) => [...m, { from: 'ai', text }]);
                    }}
                  />
                </li>
              )}
            </ol>

            {messages.length < 3 && (
              <div className="ai__chips">
                {CHIPS.map((c) => (
                  <button key={c} type="button" onClick={() => ask(c)} disabled={busy}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            <form className="ai__input" onSubmit={submit}>
              <label htmlFor="ai-q" className="sr-only">
                Ask a question
              </label>
              <input id="ai-q" ref={inputRef} placeholder="Ask anything about Anshveer…" autoComplete="off" maxLength={500} />
              <button type="submit" aria-label="Send" disabled={busy}>
                ↑
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

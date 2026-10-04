'use client';

import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { projects } from '@/lib/data';
import { emit, lockScroll, scrollToId } from '@/lib/scroll';
import EmailForm from './EmailForm';

const STORE = 'as-ai-chat-v2';
const GREETING = 'Hi — I’m Anshveer’s AI. Ask me about his work, skills or experience, and I’ll point you to the right part of the page.';
const STARTERS = ['What did he build at Dell?', 'Show me his best projects', 'Is he good with LLMs and RAG?', 'How can I reach him?'];

const SECTION_IDS = { intro: 'top', projects: 'work', campus: 'campus', skills: 'arsenal', experience: 'experience', beyond: 'beyond', contact: 'contact' };
const SECTION_LABELS = { intro: 'the intro', projects: 'Work', campus: 'Campus', skills: 'Arsenal', experience: 'Experience', beyond: 'Off the clock', contact: 'Contact' };

const PROJECT_ALIASES = {
  'driver-analysis': ['driver vulnerab', 'ghidra'],
  realpro: ['realpro'],
  vall: ['vall'],
  examguide: ['examguide'],
  'self-healing': ['self-healing', 'self healing'],
  'mental-health': ['mental health', 'mental-health'],
};

const FALLBACK_NAV = [
  ['projects', ['project', 'built', 'build', 'app', 'github', 'made']],
  ['experience', ['experience', 'intern', 'dell', 'smartbridge', 'job']],
  ['skills', ['skill', 'stack', 'tech', 'language', 'framework', 'tool']],
  ['campus', ['college', 'vit', 'university', 'cgpa', 'gpa', 'study', 'education']],
  ['contact', ['contact', 'email', 'reach', 'phone', 'hire', 'touch']],
];

let nextId = 1;
const uid = () => `m${Date.now().toString(36)}${nextId++}`;

function guessNav(text) {
  const t = text.toLowerCase();
  return FALLBACK_NAV.find(([, keys]) => keys.some((k) => t.includes(k)))?.[0] ?? null;
}

function normalise(s) {
  return s.replace(/[\u2010\u2011]/g, '-').replace(/[\u00a0\u202f]/g, ' ').replace(/(\d) %/g, '$1%');
}

// Strips control tags; while streaming, hides a half-received "[[" tag so it never flashes on screen.
function parseReply(raw, streaming) {
  const tags = [...raw.matchAll(/\[\[(nav|next|error)(?::([^\]]*))?\]\]/g)];
  let text = raw.replace(/\[\[[\s\S]*?\]\]/g, '');
  if (streaming) {
    const open = text.lastIndexOf('[[');
    if (open !== -1) text = text.slice(0, open);
    text = text.replace(/\[$/, '');
  }
  const nav = tags.find((t) => t[1] === 'nav')?.[2]?.trim().toLowerCase();
  const next = tags
    .find((t) => t[1] === 'next')?.[2]
    ?.split('|')
    .map((q) => q.trim())
    .filter(Boolean)
    .slice(0, 2);
  return { text: normalise(text).trim(), nav: SECTION_IDS[nav] ? nav : null, next: next ?? [], error: tags.some((t) => t[1] === 'error') };
}

function mentionedProjects(text) {
  const t = text.toLowerCase();
  return projects.filter((p) => (PROJECT_ALIASES[p.id] ?? [p.title.toLowerCase()]).some((a) => t.includes(a))).slice(0, 3);
}

const INLINE = /(\*\*[^*\n]+\*\*|[\w.+-]+@[\w-]+(?:\.[\w-]+)+|https?:\/\/[^\s)]+)/g;

function Inline({ text }) {
  return text.split(INLINE).map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(part)) return <a key={i} href={`mailto:${part}`}>{part}</a>;
    if (/^https?:\/\//.test(part)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer">
          {part.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

function RichText({ text }) {
  const blocks = [];
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const bullet = /^[-•*]\s+/.test(trimmed);
    const content = trimmed.replace(/^[-•*]\s+/, '');
    const last = blocks[blocks.length - 1];
    if (bullet) {
      if (last?.type === 'ul') last.items.push(content);
      else blocks.push({ type: 'ul', items: [content] });
    } else {
      blocks.push({ type: 'p', text: content });
    }
  }
  return blocks.map((b, i) =>
    b.type === 'ul' ? (
      <ul key={i}>
        {b.items.map((it, j) => (
          <li key={j}>
            <Inline text={it} />
          </li>
        ))}
      </ul>
    ) : (
      <p key={i}>
        <Inline text={b.text} />
      </p>
    )
  );
}

function loadChat() {
  try {
    const saved = JSON.parse(sessionStorage.getItem(STORE));
    if (Array.isArray(saved) && saved.length) return saved.map((m) => ({ ...m, streaming: false }));
  } catch {}
  return [{ id: 'greeting', role: 'assistant', content: GREETING }];
}

export default function AskAI() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(loadChat);
  const [busy, setBusy] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState('');
  const [announce, setAnnounce] = useState('');
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const launcher = useRef(null);
  const abortRef = useRef(null);
  const messagesRef = useRef(messages);

  useEffect(() => {
    messagesRef.current = messages;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(messages.filter((m) => !m.streaming).slice(-30)));
    } catch {}
  }, [messages]);

  const patch = (id, fn) => setMessages((list) => list.map((m) => (m.id === id ? { ...m, ...fn(m) } : m)));

  const goTo = useCallback((nav, { closeSheet } = {}) => {
    const id = SECTION_IDS[nav];
    if (!id) return;
    if (nav === 'contact') setShowForm(true);
    if (closeSheet) setOpen(false);
    setTimeout(() => scrollToId(id), closeSheet ? 320 : 200);
  }, []);

  const ask = useCallback(
    async (question) => {
      const q = question.trim().slice(0, 1000);
      if (!q || abortRef.current) return;
      const history = messagesRef.current
        .filter((m) => (m.role === 'user' || m.role === 'assistant') && !m.error && m.id !== 'greeting')
        .map((m) => ({ role: m.role, content: parseReply(m.content, false).text }));
      const userMsg = { id: uid(), role: 'user', content: q };
      const botId = uid();
      setMessages((list) => [...list, userMsg, { id: botId, role: 'assistant', content: '', streaming: true, question: q }]);
      setBusy(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: [...history, { role: 'user', content: q }] }),
          signal: controller.signal,
        });
        if (!res.ok || !res.body) {
          const body = await res.json().catch(() => ({}));
          const nav = guessNav(q);
          patch(botId, () => ({
            content: body.error || 'Something went wrong on my side.',
            error: true,
            streaming: false,
            fallbackNav: nav,
          }));
          return;
        }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let raw = '';
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          raw += decoder.decode(value, { stream: true });
          patch(botId, () => ({ content: raw }));
        }
        const parsed = parseReply(raw, false);
        if (parsed.error && !parsed.text) {
          patch(botId, () => ({ content: 'I lost my train of thought mid-answer.', error: true, streaming: false }));
          return;
        }
        patch(botId, () => ({ content: raw, streaming: false }));
        setAnnounce(parsed.text);
        if (parsed.nav && window.matchMedia('(min-width: 761px)').matches) goTo(parsed.nav);
        else if (parsed.nav === 'contact') setShowForm(true);
      } catch (err) {
        if (err?.name === 'AbortError') {
          patch(botId, (m) => ({ streaming: false, stopped: true, content: m.content }));
        } else {
          patch(botId, () => ({ content: 'I can’t reach my brain right now — check your connection and try again.', error: true, streaming: false, fallbackNav: guessNav(q) }));
        }
      } finally {
        abortRef.current = null;
        setBusy(false);
      }
    },
    [goTo]
  );

  const retry = (msg) => {
    const list = messagesRef.current;
    const i = list.findIndex((m) => m.id === msg.id);
    const trimmed = i > 0 ? list.slice(0, i - 1) : list;
    messagesRef.current = trimmed;
    setMessages(trimmed);
    ask(msg.question);
  };

  const reset = () => {
    abortRef.current?.abort();
    setShowForm(false);
    setMessages([{ id: 'greeting', role: 'assistant', content: GREETING }]);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

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
    const sheet = window.matchMedia('(max-width: 760px)').matches;
    if (sheet) lockScroll(true);
    requestAnimationFrame(() => inputRef.current?.focus({ preventScroll: true }));
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    const btn = launcher.current;
    return () => {
      window.removeEventListener('keydown', onKey);
      if (sheet) lockScroll(false);
      btn?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    if (nearBottom || !busy) el.scrollTo({ top: el.scrollHeight, behavior: busy ? 'auto' : 'smooth' });
  }, [messages, busy, showForm, open]);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 132)}px`;
  }, [draft, open]);

  const send = () => {
    if (busy || !draft.trim()) return;
    ask(draft);
    setDraft('');
  };

  const last = messages[messages.length - 1];
  const lastParsed = last?.role === 'assistant' && !last.streaming && !last.error ? parseReply(last.content, false) : null;
  const suggestions = messages.length === 1 ? STARTERS : lastParsed?.next ?? [];
  const isSheet = typeof window !== 'undefined' && window.matchMedia('(max-width: 760px)').matches;

  return (
    <>
      <button
        ref={launcher}
        type="button"
        className="ai__launcher"
        data-open={open}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="ai-panel"
        aria-label={open ? 'Close AI chat' : 'Ask my AI'}
        data-cursor={open ? 'Close' : 'Ask'}
      >
        <span className="ai__orb" aria-hidden="true" />
        <span className="ai__launcher-text">{open ? 'Close' : 'Ask my AI'}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            className="ai__scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
        )}
        {open && (
          <motion.section
            key="panel"
            id="ai-panel"
            className="ai"
            role="dialog"
            aria-label="Ask Anshveer’s AI"
            initial={isSheet ? { y: '100%' } : { opacity: 0, y: 24, scale: 0.96, filter: 'blur(8px)' }}
            animate={isSheet ? { y: 0 } : { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={isSheet ? { y: '100%' } : { opacity: 0, y: 16, scale: 0.97, filter: 'blur(6px)' }}
            transition={isSheet ? { type: 'spring', stiffness: 380, damping: 38 } : { type: 'spring', stiffness: 360, damping: 32 }}
          >
            <span className="ai__grab" aria-hidden="true" />
            <header className="ai__head">
              <span className="ai__orb ai__orb--sm" data-busy={busy} aria-hidden="true" />
              <div className="ai__head-text">
                <p className="ai__title">AI Navigator</p>
                <p className="ai__sub mono">
                  <span className="ai__status" data-busy={busy} aria-hidden="true" />
                  {busy ? 'Thinking…' : 'Answers from Anshveer’s résumé'}
                </p>
              </div>
              <div className="ai__head-actions">
                <button type="button" className="ai__icon-btn" onClick={reset} disabled={messages.length < 2 && !showForm} aria-label="Start a new chat" title="New chat">
                  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M13.25 8A5.25 5.25 0 1 1 11.7 4.3" />
                    <path d="M12.25 1.75v3h-3" />
                  </svg>
                </button>
                <button type="button" className="ai__icon-btn" onClick={() => setOpen(false)} aria-label="Close chat" title="Close">
                  <svg viewBox="0 0 16 16" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <path d="M3.5 3.5l9 9M12.5 3.5l-9 9" />
                  </svg>
                </button>
              </div>
            </header>

            <ol ref={listRef} className="ai__list" data-lenis-prevent aria-busy={busy}>
              {messages.map((m) => {
                if (m.role === 'user') {
                  return (
                    <li key={m.id} className="ai__msg ai__msg--me">
                      {m.content}
                    </li>
                  );
                }
                const parsed = parseReply(m.content, m.streaming);
                const related = m.streaming || m.error ? [] : mentionedProjects(parsed.text);
                const nav = m.error ? m.fallbackNav : parsed.nav;
                return (
                  <li key={m.id} className="ai__row">
                    <div className={`ai__msg ai__msg--ai${m.error ? ' ai__msg--error' : ''}`}>
                      {m.streaming && !parsed.text ? (
                        <span className="ai__typing" aria-label="Thinking">
                          <span />
                          <span />
                          <span />
                        </span>
                      ) : (
                        <div className="ai__rich">
                          <RichText text={parsed.text} />
                          {m.streaming && <span className="ai__caret" aria-hidden="true" />}
                        </div>
                      )}
                      {m.stopped && <p className="ai__meta mono">Stopped</p>}
                    </div>
                    {(m.error || related.length > 0 || (nav && !m.streaming)) && (
                      <div className="ai__actions">
                        {m.error && m.question && (
                          <button type="button" className="ai__action" onClick={() => retry(m)} disabled={busy}>
                            ↻ Try again
                          </button>
                        )}
                        {nav && !m.streaming && (
                          <button type="button" className="ai__action ai__action--go" onClick={() => goTo(nav, { closeSheet: isSheet })}>
                            Take me to {SECTION_LABELS[nav]} →
                          </button>
                        )}
                        {related.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="ai__action"
                            style={{ '--accent': p.accent }}
                            onClick={() => {
                              if (isSheet) setOpen(false);
                              emit('case:open', p.id);
                            }}
                          >
                            <span className="ai__action-dot" aria-hidden="true" />
                            {p.title} case file
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                );
              })}
              {showForm && (
                <li className="ai__msg--form">
                  <EmailForm
                    onDone={(text) => {
                      setShowForm(false);
                      setMessages((list) => [...list, { id: uid(), role: 'assistant', content: text }]);
                    }}
                  />
                </li>
              )}
            </ol>

            {suggestions.length > 0 && !busy && (
              <div className="ai__chips" role="group" aria-label="Suggested questions">
                {suggestions.map((c) => (
                  <button key={c} type="button" onClick={() => ask(c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}

            <form
              className="ai__input"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <label htmlFor="ai-q" className="sr-only">
                Ask a question
              </label>
              <textarea
                id="ai-q"
                ref={inputRef}
                rows={1}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Ask anything about Anshveer…"
                autoComplete="off"
                maxLength={1000}
                enterKeyHint="send"
              />
              {busy ? (
                <button type="button" className="ai__send ai__send--stop" onClick={() => abortRef.current?.abort()} aria-label="Stop generating">
                  <span aria-hidden="true" />
                </button>
              ) : (
                <button type="submit" className="ai__send" aria-label="Send" disabled={!draft.trim()}>
                  ↑
                </button>
              )}
            </form>
            <p className="sr-only" aria-live="polite">
              {announce}
            </p>
            <p className="ai__foot mono">Enter to send · Shift+Enter for a new line · AI can be wrong</p>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}

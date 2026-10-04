'use client';

import { useId, useState } from 'react';

const TOPICS = [
  { id: 'role', label: 'A role on my team', subject: 'Role on our team', prompt: 'Hi Anshveer — we’re building… and think you’d be a great fit for…' },
  { id: 'collab', label: 'Collaboration', subject: 'Collaboration idea', prompt: 'Hi Anshveer — I’m working on… and would love to collaborate on…' },
  { id: 'project', label: 'Project idea', subject: 'Project idea', prompt: 'Hi Anshveer — I have an idea for…' },
  { id: 'hello', label: 'Just saying hi', subject: 'Hello from your portfolio', prompt: 'Hi Anshveer…' },
];

export default function EmailForm({ onDone, title = 'Send Anshveer a message', className = 'ai__form' }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
  const [topic, setTopic] = useState(null);
  const [subject, setSubject] = useState('');
  const groupId = useId();
  const current = TOPICS.find((t) => t.id === topic);

  const pick = (t) => {
    const next = topic === t.id ? null : t.id;
    setTopic(next);
    if (!subject || TOPICS.some((x) => x.subject === subject)) setSubject(next ? t.subject : '');
  };

  const submit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setState('sending');
    try {
      const res = await fetch('/api/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error);
      }
      form.reset();
      setTopic(null);
      setSubject('');
      setState('idle');
      onDone('Sent! Anshveer will get back to you soon — check your inbox for a confirmation.');
    } catch (err) {
      setError(err.message || '');
      setState('error');
    }
  };

  return (
    <form className={className} onSubmit={submit}>
      <p className="ai__form-title mono">{title}</p>
      <input name="company" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hp" />
      <label>
        <span>Your email</span>
        <input name="email" type="email" required autoComplete="email" spellCheck="false" placeholder="you@company.com" />
      </label>
      <label>
        <span>Subject</span>
        <input
          name="subject"
          type="text"
          autoComplete="off"
          maxLength={150}
          placeholder="Collaboration idea…"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
      </label>
      <fieldset className="topics" aria-labelledby={groupId}>
        <span id={groupId} className="topics__legend">
          What’s it about?
        </span>
        <div className="topics__list">
          {TOPICS.map((t) => (
            <button key={t.id} type="button" className="topics__chip" aria-pressed={topic === t.id} onClick={() => pick(t)}>
              {t.label}
            </button>
          ))}
        </div>
      </fieldset>
      <label>
        <span>Message</span>
        <textarea
          name="message"
          required
          rows={3}
          maxLength={5000}
          placeholder={current?.prompt ?? 'Hi Anshveer…'}
          onKeyDown={(e) => (e.metaKey || e.ctrlKey) && e.key === 'Enter' && e.currentTarget.form.requestSubmit()}
        />
      </label>
      {state === 'error' && (
        <p className="ai__error" role="alert">
          {error || 'Couldn’t send that. Try again, or use the email link in Contact.'}
        </p>
      )}
      <button type="submit" className="btn btn--accent" disabled={state === 'sending'}>
        {state === 'sending' ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

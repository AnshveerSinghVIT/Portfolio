'use client';

import { useState } from 'react';

export default function EmailForm({ onDone, title = 'Send Anshveer a message', className = 'ai__form' }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');
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
        <input name="subject" type="text" autoComplete="off" placeholder="Internship opportunity…" />
      </label>
      <label>
        <span>Message</span>
        <textarea
          name="message"
          required
          rows={3}
          placeholder="Hi Anshveer…"
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

'use client';

import { useEffect, useState } from 'react';

export default function Toast() {
  const [msg, setMsg] = useState(null);
  useEffect(() => {
    let t;
    const on = (e) => {
      setMsg(e.detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2400);
    };
    window.addEventListener('toast', on);
    return () => {
      window.removeEventListener('toast', on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div className="toast" data-show={msg ? 'true' : 'false'} role="status" aria-live="polite">
      {msg}
    </div>
  );
}

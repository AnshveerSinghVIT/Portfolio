'use client';

import { useEffect } from 'react';
import { emit } from '@/lib/scroll';

const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export default function EasterEggs() {
  useEffect(() => {
    console.log(
      '%cHey, curious one.%c\nYou read source code for fun — we should talk.\n→ singhanshveer73@gmail.com  ·  try ⌘K, or the Konami code.',
      'font: 600 20px system-ui; color: #ff5a1f',
      'font: 13px ui-monospace, monospace; color: inherit'
    );
    let i = 0;
    const onKey = (e) => {
      i = e.key === KONAMI[i] || e.key.toLowerCase() === KONAMI[i] ? i + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (i === KONAMI.length) {
        i = 0;
        emit('blob:party');
        emit('blob:pulse', { x: 0, y: 0 });
        emit('toast', 'Cheat code accepted — party mode for 5 seconds');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}

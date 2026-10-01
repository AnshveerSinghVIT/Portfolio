'use client';

import { useEffect, useRef, useState } from 'react';

export default function Cursor() {
  const dot = useRef(null);
  const ring = useRef(null);
  const [label, setLabel] = useState('');
  const [mode, setMode] = useState('default');

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    if (!fine.matches) return;
    document.documentElement.classList.add('has-cursor');

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    let raf;
    let visible = false;

    const evaluate = (el) => {
      const target = el?.closest?.('[data-cursor], a, button, input, [role="option"], [role="tab"]');
      if (!target) {
        setMode('default');
        setLabel('');
      } else if (target.dataset.cursor) {
        setMode('label');
        setLabel(target.dataset.cursor);
      } else if (target.tagName === 'INPUT') {
        setMode('text');
        setLabel('');
      } else {
        setMode('hover');
        setLabel('');
      }
    };
    const move = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        document.documentElement.classList.add('cursor-visible');
      }
      evaluate(e.target);
    };
    let pending = 0;
    const recheck = () => {
      clearTimeout(pending);
      pending = setTimeout(() => evaluate(document.elementFromPoint(pos.x, pos.y)), 80);
    };
    const settle = () => setTimeout(recheck, 700);
    const leave = () => {
      visible = false;
      document.documentElement.classList.remove('cursor-visible');
    };
    const down = () => document.documentElement.classList.add('cursor-down');
    const up = () => document.documentElement.classList.remove('cursor-down');

    const loop = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.18;
      ringPos.y += (pos.y - ringPos.y) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      if (ring.current) ring.current.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    loop();

    window.addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('scroll', recheck, { passive: true });
    window.addEventListener('click', settle);
    window.addEventListener('keydown', settle);
    return () => {
      clearTimeout(pending);
      window.removeEventListener('scroll', recheck);
      window.removeEventListener('click', settle);
      window.removeEventListener('keydown', settle);
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.documentElement.classList.remove('has-cursor', 'cursor-visible');
    };
  }, []);

  return (
    <div className="cursor" data-mode={mode} aria-hidden="true">
      <div ref={ring} className="cursor__ring">
        <span className="cursor__label">{label}</span>
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skills } from '@/lib/data';

gsap.registerPlugin(ScrollTrigger);

const categories = Object.keys(skills);
const all = categories.flatMap((c) => skills[c]);

function Marquee() {
  const track = useRef(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = track.current;
    let x = 0;
    let boost = 0;
    let dir = -1;
    const st = ScrollTrigger.create({
      onUpdate: (self) => {
        boost = Math.min(18, Math.abs(self.getVelocity()) / 120);
        dir = self.direction === 1 ? -1 : 1;
      },
    });
    const tick = () => {
      const half = el.scrollWidth / 2;
      x += dir * (0.6 + boost);
      boost *= 0.92;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      st.kill();
    };
  }, []);

  const row = [...all, ...all];
  return (
    <div className="marquee" aria-hidden="true">
      <div ref={track} className="marquee__track">
        {row.map((s, i) => (
          <span key={i} className="marquee__item">
            {s}
            <span className="marquee__star">✳</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function Arsenal() {
  const [active, setActive] = useState('All');
  const list = active === 'All' ? categories.flatMap((c) => skills[c].map((s) => ({ s, c }))) : skills[active].map((s) => ({ s, c: active }));

  return (
    <section id="arsenal" className="arsenal" aria-labelledby="arsenal-title">
      <Marquee />
      <div className="arsenal__inner">
        <aside className="arsenal__side">
          <div className="label mono">
            <span>(03)</span>
            <span>Arsenal</span>
          </div>
          <h2 id="arsenal-title" className="display display--sm">
            The <em className="serif">toolkit</em>
          </h2>
          <div className="arsenal__filters" role="tablist" aria-label="Skill categories">
            {['All', ...categories].map((c) => (
              <button
                key={c}
                type="button"
                role="tab"
                aria-selected={active === c}
                className="arsenal__filter"
                onClick={() => setActive(c)}
              >
                <span>{c}</span>
                <span className="mono">{String(c === 'All' ? all.length : skills[c].length).padStart(2, '0')}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="arsenal__board" role="tabpanel" aria-label={`${active} skills`}>
          <AnimatePresence mode="popLayout">
            {list.map(({ s, c }, i) => (
              <motion.span
                layout
                key={`${c}-${s}`}
                className="arsenal__tag"
                data-cat={categories.indexOf(c)}
                initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, scale: 0.9, filter: 'blur(4px)' }}
                transition={{ duration: 0.45, delay: i * 0.025, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="arsenal__cat mono">{c}</span>
                {s}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

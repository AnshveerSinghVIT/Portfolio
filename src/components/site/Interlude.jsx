'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 192;
const CROP = 0.13;
const src = (i) => `/frames/frame_${String(i + 1).padStart(3, '0')}.webp`;

const CHAPTERS = [
  { n: '01', k: 'Human', t: 'Every model starts with a person on the other side of it.' },
  { n: '02', k: 'Machine', t: 'Data in, signal out — trained, tested, and taken to production.' },
  { n: '03', k: 'Interface', t: 'The handshake: products that make intelligence feel effortless.' },
];

export default function Interlude() {
  const root = useRef(null);
  const canvas = useRef(null);
  const frames = useRef([]);
  const current = useRef(0);
  const [frame, setFrame] = useState(0);
  const [chapter, setChapter] = useState(0);
  const [loaded, setLoaded] = useState(0);

  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv.getContext('2d');

    const nearestLoaded = (i) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        const a = frames.current[i - d];
        if (a?.complete && a.naturalWidth) return a;
        const b = frames.current[i + d];
        if (b?.complete && b.naturalWidth) return b;
      }
      return null;
    };

    const draw = () => {
      const img = nearestLoaded(current.current);
      if (!img) return;
      const sw = img.naturalWidth;
      const sy = img.naturalHeight * CROP;
      const sh = img.naturalHeight * (1 - CROP * 2);
      const scale = Math.max(cv.width / sw, cv.height / sh);
      const dw = sw * scale;
      const dh = sh * scale;
      ctx.fillStyle = '#05070b';
      ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.drawImage(img, 0, sy, sw, sh, (cv.width - dw) / 2, (cv.height - dh) / 2, dw, dh);
    };

    const resize = () => {
      const dpr = Math.min(devicePixelRatio, 1.5);
      cv.width = cv.clientWidth * dpr;
      cv.height = cv.clientHeight * dpr;
      draw();
    };

    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      const order = [];
      for (let i = 0; i < FRAME_COUNT; i += 8) order.push(i);
      for (let i = 0; i < FRAME_COUNT; i++) if (i % 8) order.push(i);
      let done = 0;
      order.forEach((i) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = img.onerror = () => {
          done++;
          if (done % 12 === 0 || done === FRAME_COUNT) setLoaded(done);
          if (Math.abs(i - current.current) < 8) draw();
        };
        img.src = src(i);
        frames.current[i] = img;
      });
    };

    const io = new IntersectionObserver(([e]) => e.isIntersecting && load(), { rootMargin: '150% 0px' });
    io.observe(root.current);

    const st = ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        const i = Math.min(FRAME_COUNT - 1, Math.round(self.progress * (FRAME_COUNT - 1)));
        if (i !== current.current) {
          current.current = i;
          setFrame(i);
          requestAnimationFrame(draw);
        }
        setChapter(Math.min(CHAPTERS.length - 1, Math.floor(self.progress * CHAPTERS.length * 0.999)));
      },
    });

    resize();
    window.addEventListener('resize', resize);
    return () => {
      io.disconnect();
      st.kill();
      window.removeEventListener('resize', resize);
    };
  }, []);

  const pct = Math.round((frame / (FRAME_COUNT - 1)) * 100);

  return (
    <section ref={root} className="interlude" aria-label="Human, machine, interface">
      <div className="interlude__stage">
        <canvas ref={canvas} className="interlude__canvas" aria-hidden="true" />
        <div className="interlude__vignette" aria-hidden="true" />

        <div className="interlude__hud mono" aria-hidden="true">
          <span className="hud-corner hud-corner--tl" />
          <span className="hud-corner hud-corner--tr" />
          <span className="hud-corner hud-corner--bl" />
          <span className="hud-corner hud-corner--br" />
          <div className="interlude__hud-top">
            <span>
              <span className="rec" /> SEQ_HUMAN×MACHINE
            </span>
            <span>
              FRAME {String(frame + 1).padStart(3, '0')}/{FRAME_COUNT}
            </span>
          </div>
          <div className="interlude__hud-bottom">
            <span>{loaded < FRAME_COUNT ? `BUFFER ${Math.round((loaded / FRAME_COUNT) * 100)}%` : 'BUFFER OK'}</span>
            <span className="interlude__meter">
              <span style={{ transform: `scaleX(${pct / 100})` }} />
            </span>
            <span>{String(pct).padStart(3, '0')}%</span>
          </div>
        </div>

        <div className="interlude__copy">
          <p className="interlude__eyebrow mono">Interlude — where models meet people</p>
          <div className="interlude__chapters">
            {CHAPTERS.map((c, i) => (
              <div key={c.n} className="interlude__chapter" data-active={i === chapter} aria-hidden={i !== chapter}>
                <span className="interlude__k">
                  <span className="mono">{c.n}</span> {c.k}
                </span>
                <p className="interlude__t">{c.t}</p>
              </div>
            ))}
          </div>
          <ol className="interlude__steps mono" aria-hidden="true">
            {CHAPTERS.map((c, i) => (
              <li key={c.n} data-active={i <= chapter}>
                {c.k}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

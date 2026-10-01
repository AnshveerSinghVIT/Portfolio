'use client';

import { useState } from 'react';
import { beyond, profile } from '@/lib/data';

const FILES = 'abcdefgh';
const JUMPS = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];

function knightMoves(f, r) {
  return JUMPS.map(([df, dr]) => [f + df, r + dr]).filter(([a, b]) => a >= 0 && a < 8 && b >= 0 && b < 8);
}

function ChessBoard() {
  const [pos, setPos] = useState([6, 0]);
  const moves = knightMoves(pos[0], pos[1]);
  const isMove = (f, r) => moves.some(([a, b]) => a === f && b === r);
  const square = `${FILES[pos[0]]}${pos[1] + 1}`;

  const onKey = (e) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (!d) return;
    e.preventDefault();
    setPos(([f, r]) => [Math.min(7, Math.max(0, f + d[0])), Math.min(7, Math.max(0, r + d[1]))]);
  };

  return (
    <div className="chess">
      <div
        className="chess__board"
        tabIndex={0}
        role="grid"
        aria-label="Knight move explorer. Use arrow keys or hover to move the knight."
        onKeyDown={onKey}
        data-cursor="Move"
      >
        {Array.from({ length: 64 }, (_, i) => {
          const f = i % 8;
          const r = 7 - Math.floor(i / 8);
          const here = pos[0] === f && pos[1] === r;
          return (
            <span
              key={i}
              className="chess__sq"
              data-dark={(f + r) % 2 === 0}
              data-move={isMove(f, r)}
              onMouseEnter={() => setPos([f, r])}
              aria-hidden="true"
            >
              {here && <span className="chess__knight">♞</span>}
            </span>
          );
        })}
      </div>
      <p className="chess__status mono" aria-live="polite">
        Knight on {square} — {moves.length} legal moves
      </p>
    </div>
  );
}

export default function Beyond() {
  return (
    <section className="beyond" aria-labelledby="beyond-title">
      <div className="section-head">
        <div className="label mono">
          <span>(05)</span>
          <span>Off the clock</span>
        </div>
        <h2 id="beyond-title" className="display display--sm">
          Beyond the <em className="serif">code</em>
        </h2>
      </div>

      <div className="bento">
        <article className="bento__cell bento__chess">
          <header>
            <h3>Chess</h3>
            <p>Where I practise thinking three moves ahead. Hover the board — the knight shows you where it can go.</p>
          </header>
          <ChessBoard />
        </article>

        <article className="bento__cell bento__belt">
          <span className="belt__kanji" lang="ja" aria-hidden="true">
            糸東流
          </span>
          <div className="belt__band" aria-hidden="true">
            <span className="belt__knot" />
          </div>
          <h3>{beyond.belt}</h3>
          <p className="mono">{beyond.style}</p>
        </article>

        <article className="bento__cell bento__game" tabIndex={0} aria-label={beyond.hackathons}>
          <div className="game__sky" aria-hidden="true">
            <span className="game__ship" />
            <span className="game__star" style={{ '--x': '18%', '--y': '22%' }} />
            <span className="game__star" style={{ '--x': '72%', '--y': '14%' }} />
            <span className="game__star" style={{ '--x': '84%', '--y': '62%' }} />
            <span className="game__star" style={{ '--x': '34%', '--y': '70%' }} />
          </div>
          <h3>Hackathons</h3>
          <p className="mono">{beyond.hackathons} · hover to launch</p>
        </article>

        <article className="bento__cell bento__certs">
          <h3>Always learning</h3>
          <p>{beyond.certs}.</p>
          <div className="bento__links">
            {profile.socials.slice(2).map((s) => (
              <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="link-underline mono">
                {s.label} ↗
              </a>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

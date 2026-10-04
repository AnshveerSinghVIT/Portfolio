'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import data from '@/lib/atlas/atlas.json';
import { parseReply, RichText } from '@/components/site/chatFormat';
import { AtlasEngine, minimapImage } from './engine';

const TYPE_LABEL = { project: 'Project', experience: 'Experience', education: 'Education', place: 'Place', skill: 'Skill', course: 'Coursework', life: 'Life' };
const TYPE_GLYPH = { project: '◉', experience: '▲', education: '■', place: '◆', skill: '•', course: '○', life: '✚' };
const EXAMPLES = ['secure systems', 'things real people use', 'where he studied', 'what he does for fun'];
const ROUTE_PRESETS = [
  ['karate', 'llms'],
  ['chess', 'ghidra'],
  ['vellore', 'docker'],
];
const SEMANTIC_MIN = 0.24;

const byId = new Map(data.nodes.map((n) => [n.id, n]));
const adjacency = new Map(data.nodes.map((n) => [n.id, []]));
for (const [a, b, s] of data.edges) {
  adjacency.get(data.nodes[a].id).push({ node: data.nodes[b], similarity: s });
  adjacency.get(data.nodes[b].id).push({ node: data.nodes[a], similarity: s });
}
const neighboursOf = (id) => [...(adjacency.get(id) ?? [])].sort((x, y) => y.similarity - x.similarity);

const mobileQuery = '(max-width: 760px)';
const subscribeMobile = (cb) => {
  const mq = window.matchMedia(mobileQuery);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};
const getMobile = () => window.matchMedia(mobileQuery).matches;
const getMobileServer = () => false;
const builtWith = new Map();
for (const n of data.nodes) for (const u of n.usedIn) builtWith.set(u, [...(builtWith.get(u) ?? []), n]);

function lexicalSearch(q) {
  const words = q.toLowerCase().split(/[^a-z0-9+#.]+/).filter((w) => w.length > 1);
  if (!words.length) return [];
  return data.nodes
    .map((n) => {
      const hay = `${n.title} ${n.kicker ?? ''} ${n.body ?? ''} ${n.type}`.toLowerCase();
      const hits = words.filter((w) => hay.includes(w)).length;
      const title = n.title.toLowerCase().includes(words.join(' ')) ? 0.4 : 0;
      return { id: n.id, score: (hits / words.length) * 0.6 + title };
    })
    .filter((r) => r.score > 0.25)
    .sort((a, b) => b.score - a.score);
}

const QUESTION = /\?\s*$|^(who|what|where|when|why|how|is|are|does|did|can|could|has|have|tell|show|which|list|give)\b/i;
const framed = (q) =>
  QUESTION.test(q.trim()) ? q : `A visitor searched Anshveer's portfolio map for "${q}". Briefly explain what in his work relates to that, or say plainly if nothing does.`;

function niceScale(k) {
  const steps = [0.01, 0.02, 0.05, 0.1, 0.2, 0.25, 0.5, 1];
  const target = 110 / k;
  const L = steps.reduce((best, s) => (Math.abs(s - target) < Math.abs(best - target) ? s : best), steps[0]);
  return { L, px: L * k };
}

const fmt = (v) => `${v < 0 ? '−' : ''}${Math.abs(v).toFixed(3)}`;

// Camera and cursor change every frame; keep them out of the main tree so only the map furniture re-renders.
function createStore(initial) {
  let value = initial;
  const listeners = new Set();
  return {
    get: () => value,
    set: (patch) => {
      value = { ...value, ...patch };
      listeners.forEach((l) => l());
    },
    subscribe: (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };
}
const NULL_VIEW = { cam: null, view: null, coords: null };
const serverView = () => NULL_VIEW;

function ScaleBar({ store }) {
  const { cam, coords } = useSyncExternalStore(store.subscribe, store.get, serverView);
  if (!cam) return null;
  const scale = niceScale(cam.k);
  return (
    <div className="atlas__scale mono" aria-hidden="true">
      <span className="atlas__scale-bar" style={{ width: `${scale.px}px` }} />
      <span>{scale.L} latent units</span>
      {coords && (
        <span className="atlas__coords">
          λ {fmt(coords[0])} · φ {fmt(coords[1])}
        </span>
      )}
    </div>
  );
}

function MiniMap({ store, image, selected, onJump }) {
  const ref = useRef(null);
  const { view } = useSyncExternalStore(store.subscribe, store.get, serverView);
  useEffect(() => {
    const c = ref.current;
    if (!c || !view || !image.current) return;
    const ctx = c.getContext('2d');
    const S = c.width;
    ctx.drawImage(image.current, 0, 0, S, S);
    const toPx = (wx, wy) => [((wx - view.extentMin) / view.extentSize) * S, (1 - (wy - view.extentMin) / view.extentSize) * S];
    const [ax, ay] = toPx(view.x0, view.y1);
    const [bx, by] = toPx(view.x1, view.y0);
    const rx = Math.max(1, ax);
    const ry = Math.max(1, ay);
    const rw = Math.min(S - 1, bx) - rx;
    const rh = Math.min(S - 1, by) - ry;
    ctx.fillStyle = 'rgba(255, 90, 31, 0.08)';
    ctx.strokeStyle = '#ff5a1f';
    ctx.lineWidth = 2;
    if (rw > 0 && rh > 0) {
      ctx.fillRect(rx, ry, rw, rh);
      ctx.strokeRect(rx, ry, rw, rh);
    }
    if (selected) {
      const [sx, sy] = toPx(selected.x, selected.y);
      ctx.fillStyle = '#121212';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }, [view, selected, image]);
  return (
    <canvas
      ref={ref}
      width={168}
      height={168}
      onClick={(ev) => {
        if (!view) return;
        const r = ev.currentTarget.getBoundingClientRect();
        onJump(view.extentMin + ((ev.clientX - r.left) / r.width) * view.extentSize, view.extentMin + (1 - (ev.clientY - r.top) / r.height) * view.extentSize);
      }}
      aria-label="Overview map. Click to move there."
      role="img"
    />
  );
}

export default function Atlas() {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const viewStore = useRef(null);
  viewStore.current ??= createStore(NULL_VIEW);
  const miniImage = useRef(null);
  const engineRef = useRef(null);
  const workerRef = useRef(null);
  const queryId = useRef(0);
  const answerAbort = useRef(null);
  const drawerRef = useRef(null);

  const [glError, setGlError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [hover, setHover] = useState(null);
  const [query, setQuery] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [model, setModel] = useState({ status: 'idle', progress: 0 });
  const [results, setResults] = useState([]);
  const [resultMode, setResultMode] = useState('lexical');
  const [answer, setAnswer] = useState(null);
  const [route, setRoute] = useState(null);
  const [tour, setTour] = useState(null);
  const [listOpen, setListOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const isMobile = useSyncExternalStore(subscribeMobile, getMobile, getMobileServer);

  // ---------- Engine ----------
  useEffect(() => {
    let engine;
    try {
      engine = new AtlasEngine({
        canvas: canvasRef.current,
        overlay: overlayRef.current,
        data,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        onHover: (n) => setHover(n),
        onSelect: (n) => {
          setTour(null);
          setSelected(n);
        },
        onCamera: (c) => engine && viewStore.current.set({ cam: { x: c.x, y: c.y, k: c.k }, view: engine.viewRect() }),
        onPointer: (x, y) => viewStore.current.set({ coords: [x, y] }),
        onError: (err) => {
          console.warn('Atlas shaders failed', err);
          setGlError(String(err?.message ?? err));
          setListOpen(true);
        },
      });
    } catch (err) {
      console.warn('Atlas engine failed', err);
      const id = requestAnimationFrame(() => {
        setGlError(String(err?.message ?? err));
        setListOpen(true);
      });
      return () => cancelAnimationFrame(id);
    }
    engineRef.current = engine;
    viewStore.current.set({ cam: { ...engine.cam }, view: engine.viewRect() });
    const img = minimapImage(engine.grid, 168);
    const off = document.createElement('canvas');
    off.width = off.height = 168;
    off.getContext('2d').putImageData(img, 0, 0);
    miniImage.current = off;
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Keep the map framed around whatever UI is covering it.
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    const drawerOpen = !!selected && !tour;
    if (isMobile) e.setInsets({ top: 175, right: 0, left: 0, bottom: drawerOpen ? Math.round(window.innerHeight * 0.5) : 70 });
    else e.setInsets({ top: 40, left: 360, right: drawerOpen ? 440 : 40, bottom: 60 });
  }, [isMobile, selected, tour]);

  // Labels never hide under panels: tell the engine where the UI sits.
  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    const measure = () => {
      const root = canvasRef.current.getBoundingClientRect();
      const rects = [...document.querySelectorAll('.atlas [data-atlas-ui], .atlas__scale, .view-toggle')]
        .map((el) => el.getBoundingClientRect())
        .filter((r) => r.width && r.height)
        .map((r) => [r.left - root.left - 6, r.top - root.top - 6, r.right - root.left + 6, r.bottom - root.top + 6]);
      e.setExclusions(rects);
    };
    const id = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', measure);
    };
  }, [isMobile, selected, tour, route, infoOpen, listOpen, answer, results, searchFocus]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setSelected(selected?.id ?? null);
    if (selected) e.flyToNode(selected.id, selected.type === 'skill' || selected.type === 'course' ? 3.6 : 2.8);
  }, [selected]);

  useEffect(() => {
    engineRef.current?.setMatches(query.trim() ? results.slice(0, 10) : []);
  }, [results, query]);

  useEffect(() => {
    const e = engineRef.current;
    if (!e) return;
    e.setRoute(route?.ids ?? []);
    if (route?.ids.length) e.flyToNodes(route.ids);
  }, [route]);

  // ---------- Search ----------
  const ensureWorker = useCallback(() => {
    if (workerRef.current) return workerRef.current;
    const w = new Worker('/atlas/search-worker.js', { type: 'module' });
    w.onmessage = ({ data: msg }) => {
      if (msg.type === 'progress') setModel((m) => (m.status === 'ready' ? m : { status: 'loading', progress: msg.total ? msg.loaded / msg.total : 0 }));
      else if (msg.type === 'ready') setModel({ status: 'ready', progress: 1 });
      else if (msg.type === 'error') setModel({ status: 'error', progress: 0 });
      else if (msg.type === 'results' && msg.id === queryId.current && msg.results) {
        setResults(msg.results.filter((r) => r.score >= SEMANTIC_MIN).slice(0, 10));
        setResultMode('semantic');
      }
    };
    workerRef.current = w;
    setModel((m) => (m.status === 'idle' ? { status: 'loading', progress: 0 } : m));
    w.postMessage({ type: 'load' });
    return w;
  }, []);

  useEffect(() => () => workerRef.current?.terminate(), []);

  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    const t = setTimeout(() => {
      const id = ++queryId.current;
      if (model.status === 'ready') {
        workerRef.current?.postMessage({ type: 'query', id, text: q });
      } else {
        setResults(lexicalSearch(q).slice(0, 10));
        setResultMode('lexical');
        if (model.status === 'loading') workerRef.current?.postMessage({ type: 'query', id, text: q });
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query, model.status]);

  const runQuery = (q) => {
    setQuery(q);
    setSearchFocus(true);
    ensureWorker();
  };

  const askAI = useCallback(async (q) => {
    answerAbort.current?.abort();
    const controller = new AbortController();
    answerAbort.current = controller;
    setAnswer({ q, raw: '', streaming: true });
    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: framed(q) }] }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        const body = await res.json().catch(() => ({}));
        setAnswer({ q, raw: body.error || 'The AI is unavailable right now — the map still works.', streaming: false, error: true });
        return;
      }
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let raw = '';
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        raw += dec.decode(value, { stream: true });
        setAnswer({ q, raw, streaming: true });
      }
      setAnswer({ q, raw, streaming: false });
    } catch (err) {
      if (err?.name !== 'AbortError') setAnswer({ q, raw: 'Couldn’t reach the AI — the map still works.', streaming: false, error: true });
    } finally {
      if (answerAbort.current === controller) answerAbort.current = null;
    }
  }, []);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    const top = results.slice(0, 4).map((r) => r.id);
    if (top.length) engineRef.current?.flyToNodes(top);
    askAI(q);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setAnswer(null);
    answerAbort.current?.abort();
  };

  // ---------- Selection, routes, tour ----------
  const select = useCallback((n) => {
    setTour(null);
    setSelected(n);
  }, []);

  const plotRoute = (fromId, toId) => {
    const e = engineRef.current;
    if (!e) return;
    const ids = e.shortestPath(fromId, toId);
    if (ids.length < 2) return;
    const steps = ids.slice(1).map((id, i) => {
      const prev = ids[i];
      const sim = neighboursOf(prev).find((x) => x.node.id === id)?.similarity ?? 0;
      return { from: prev, to: id, sim };
    });
    setSelected(null);
    setTour(null);
    setRoute({ from: fromId, to: toId, ids, steps });
  };

  const goToStop = useCallback((step, playing) => {
    const stop = data.tour[step];
    setTour({ step, playing });
    if (stop.id) setSelected(byId.get(stop.id));
    else {
      setSelected(null);
      engineRef.current?.home();
    }
  }, []);

  useEffect(() => {
    if (!tour?.playing) return;
    const t = setTimeout(() => {
      if (tour.step < data.tour.length - 1) goToStop(tour.step + 1, true);
      else setTour({ ...tour, playing: false });
    }, 7000);
    return () => clearTimeout(t);
  }, [tour, goToStop]);

  const startTour = () => {
    setInfoOpen(false);
    setRoute(null);
    clearSearch();
    setListOpen(false);
    goToStop(0, true);
  };

  // ---------- Keyboard ----------
  useEffect(() => {
    const onKey = (e) => {
      if (typeof e.key !== 'string') return;
      const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName ?? '');
      if (e.key === '/' && !typing) {
        e.preventDefault();
        document.getElementById('atlas-search')?.focus();
      } else if (e.key === 'Escape') {
        if (listOpen) setListOpen(false);
        else if (tour) setTour(null);
        else if (selected) setSelected(null);
        else if (route) setRoute(null);
        else if (query) clearSearch();
      } else if (tour && !typing && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault();
        goToStop(Math.max(0, Math.min(data.tour.length - 1, tour.step + (e.key === 'ArrowRight' ? 1 : -1))), false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [listOpen, tour, selected, route, query, goToStop]);

  // ---------- Derived ----------
  const neighbours = selected ? neighboursOf(selected.id).slice(0, 5) : [];
  const usedIn = selected ? selected.usedIn.map((id) => byId.get(id)).filter(Boolean) : [];
  const builtFrom = selected ? builtWith.get(selected.id) ?? [] : [];
  const region = selected ? data.regions[selected.region]?.name : null;
  const parsedAnswer = answer ? parseReply(answer.raw, answer.streaming) : null;
  const sortedNodes = useMemo(() => [...data.nodes].sort((a, b) => a.title.localeCompare(b.title)), []);
  const showPanel = searchFocus || query.trim();
  const tourStop = tour ? data.tour[tour.step] : null;

  return (
    <div className="atlas" data-mobile={isMobile || undefined}>
      <canvas ref={canvasRef} className="atlas__canvas" aria-hidden="true" />
      <div
        ref={overlayRef}
        className="atlas__overlay"
        tabIndex={0}
        role="application"
        aria-label="Map of Anshveer’s work. Drag to pan, scroll or pinch to zoom, arrow keys to move, 0 to reset. Use List view for an accessible index."
      />

      {/* ---------- Cartouche ---------- */}
      <header className="atlas__cartouche" data-atlas-ui data-open={infoOpen || undefined}>
        <p className="atlas__eyebrow mono">An atlas of</p>
        <h2 className="atlas__title">
          Anshveer <em>Singh</em>
        </h2>
        <p className="atlas__role">Software engineer — AI/ML &amp; full-stack</p>
        <button type="button" className="atlas__info-toggle mono" onClick={() => setInfoOpen((o) => !o)} aria-expanded={infoOpen}>
          {infoOpen ? 'Less' : 'How to read this map'}
        </button>
        <div className="atlas__explain">
          <p>
            Every place is a piece of his work, embedded with <strong>all-MiniLM-L6-v2</strong> and projected with <strong>UMAP</strong>. Near means
            related. Height means depth — mountains are where his work clusters.
          </p>
          <ul className="atlas__legend" aria-label="Legend">
            {Object.entries(TYPE_LABEL).map(([t, label]) => (
              <li key={t}>
                <span className="atlas__glyph" data-type={t} aria-hidden="true">
                  {TYPE_GLYPH[t]}
                </span>
                {label}
              </li>
            ))}
          </ul>
        </div>
        <div className="atlas__cta">
          <button type="button" className="atlas__btn atlas__btn--ink" onClick={startTour}>
            <span aria-hidden="true">▶</span> Take the tour
          </button>
          <button
            type="button"
            className="atlas__btn"
            onClick={() => {
              setInfoOpen(false);
              setListOpen(true);
            }}
          >
            List view
          </button>
        </div>
      </header>

      {/* ---------- Search ---------- */}
      <div className="atlas__search" data-atlas-ui>
        <form onSubmit={submitSearch} role="search">
          <label htmlFor="atlas-search" className="sr-only">
            Search the map or ask a question
          </label>
          <span className="atlas__search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            id="atlas-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              setSearchFocus(true);
              ensureWorker();
            }}
            onBlur={() => setTimeout(() => setSearchFocus(false), 160)}
            placeholder="Search by meaning, or ask a question…"
            autoComplete="off"
            spellCheck="false"
            maxLength={200}
            enterKeyHint="search"
          />
          {query ? (
            <button type="button" className="atlas__search-clear" onClick={clearSearch} aria-label="Clear search">
              ✕
            </button>
          ) : (
            <kbd className="atlas__kbd">/</kbd>
          )}
        </form>
        <p className="atlas__model mono" aria-live="polite">
          {model.status === 'idle' && 'On-device semantic search'}
          {model.status === 'loading' && (
            <>
              Loading a 23 MB model into your browser… {Math.round(model.progress * 100)}%
              <span className="atlas__bar">
                <span style={{ transform: `scaleX(${model.progress})` }} />
              </span>
            </>
          )}
          {model.status === 'ready' && '● all-MiniLM-L6-v2 · running in your browser'}
          {model.status === 'error' && 'Model unavailable — using keyword search'}
        </p>

        {showPanel && (
          <div className="atlas__panel" data-lenis-prevent>
            {answer && (
              <section className="atlas__answer" aria-live="polite">
                <p className="atlas__panel-label mono">
                  {answer.streaming ? 'His AI is answering…' : answer.error ? 'AI' : 'His AI says'}
                </p>
                {parsedAnswer.text ? <RichText text={parsedAnswer.text} /> : <span className="atlas__dots" aria-label="Thinking" />}
                {!answer.streaming && parsedAnswer.next.length > 0 && (
                  <div className="atlas__chips">
                    {parsedAnswer.next.map((n) => (
                      <button
                        key={n}
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          runQuery(n);
                          askAI(n);
                        }}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {query.trim() ? (
              <section>
                <p className="atlas__panel-label mono">
                  {results.length ? (resultMode === 'semantic' ? 'Closest in meaning' : 'Keyword matches') : 'No close matches'}
                  {query.trim() && !answer && <span className="atlas__hint"> · Enter to ask his AI</span>}
                </p>
                <ol className="atlas__results">
                  {results.slice(0, 6).map((r) => {
                    const n = byId.get(r.id);
                    return (
                      <li key={r.id}>
                        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => select(n)}>
                          <span className="atlas__glyph" data-type={n.type} aria-hidden="true">
                            {TYPE_GLYPH[n.type]}
                          </span>
                          <span className="atlas__result-title">{n.title}</span>
                          <span className="atlas__result-score" aria-label={`${Math.round(r.score * 100)}% match`}>
                            <span style={{ transform: `scaleX(${Math.min(1, r.score / 0.7)})` }} />
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </section>
            ) : (
              <section>
                <p className="atlas__panel-label mono">Try a phrase</p>
                <div className="atlas__chips">
                  {EXAMPLES.map((q) => (
                    <button key={q} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => runQuery(q)}>
                      {q}
                    </button>
                  ))}
                </div>
                <p className="atlas__panel-label mono">Or plot a route</p>
                <div className="atlas__chips">
                  {ROUTE_PRESETS.map(([a, b]) => (
                    <button key={a + b} type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => plotRoute(a, b)}>
                      {byId.get(a).title} → {byId.get(b).title}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>

      {/* ---------- Hover tooltip (desktop) ---------- */}
      {hover && !isMobile && hover.id !== selected?.id && (
        <div className="atlas__tip mono" aria-hidden="true">
          {TYPE_LABEL[hover.type]} · {data.regions[hover.region]?.name}
        </div>
      )}

      {/* ---------- Drawer ---------- */}
      {selected && !tour && (
        <aside ref={drawerRef} className="atlas__drawer" data-atlas-ui aria-labelledby="atlas-node-title" data-lenis-prevent>
          <div className="atlas__drawer-head">
            <span className="atlas__type mono">
              <span className="atlas__glyph" data-type={selected.type} aria-hidden="true">
                {TYPE_GLYPH[selected.type]}
              </span>
              {TYPE_LABEL[selected.type]}
            </span>
            <button type="button" className="atlas__close" onClick={() => setSelected(null)} aria-label="Close details">
              ✕
            </button>
          </div>
          {selected.kicker && <p className="atlas__kicker mono">{selected.kicker}</p>}
          <h3 id="atlas-node-title" className="atlas__node-title">
            {selected.title}
          </h3>
          <p className="atlas__where mono">
            {region} · λ {fmt(selected.x)} φ {fmt(selected.y)}
          </p>
          {selected.body ? (
            <p className="atlas__body">{selected.body}</p>
          ) : (
            <p className="atlas__body atlas__body--muted">
              {selected.type === 'course' ? 'Coursework at VIT Vellore.' : 'Part of his toolkit.'} It sits in the {region}, among the places
              below.
            </p>
          )}

          <div className="atlas__links">
            {selected.caseId && (
              <a className="atlas__btn atlas__btn--ink" href={`/?case=${selected.caseId}`}>
                Open case file →
              </a>
            )}
            {selected.url && (
              <a className="atlas__btn" href={selected.url} target="_blank" rel="noopener noreferrer">
                {selected.url.includes('github.com') ? 'View source' : selected.type === 'experience' || selected.type === 'life' ? 'View credentials' : 'Visit live'} ↗
              </a>
            )}
          </div>

          {(usedIn.length > 0 || builtFrom.length > 0) && (
            <section className="atlas__section">
              <h4 className="mono">{usedIn.length ? 'Used in' : 'Built with'}</h4>
              <div className="atlas__chips">
                {(usedIn.length ? usedIn : builtFrom).map((n) => (
                  <button key={n.id} type="button" onClick={() => select(n)}>
                    <span className="atlas__glyph" data-type={n.type} aria-hidden="true">
                      {TYPE_GLYPH[n.type]}
                    </span>
                    {n.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="atlas__section">
            <h4 className="mono">Nearest in meaning</h4>
            <ol className="atlas__near">
              {neighbours.map(({ node, similarity }) => (
                <li key={node.id}>
                  <button type="button" onClick={() => select(node)}>
                    <span className="atlas__glyph" data-type={node.type} aria-hidden="true">
                      {TYPE_GLYPH[node.type]}
                    </span>
                    <span className="atlas__near-title">{node.title}</span>
                    <span className="atlas__near-sim mono">{Math.round(similarity * 100)}%</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <section className="atlas__section">
            <h4 className="mono">Plot a route from here</h4>
            <select
              className="atlas__select"
              value=""
              onChange={(e) => e.target.value && plotRoute(selected.id, e.target.value)}
              aria-label={`Plot a route from ${selected.title} to…`}
            >
              <option value="">Choose a destination…</option>
              {sortedNodes
                .filter((n) => n.id !== selected.id)
                .map((n) => (
                  <option key={n.id} value={n.id}>
                    {n.title}
                  </option>
                ))}
            </select>
          </section>
        </aside>
      )}

      {/* ---------- Route ---------- */}
      {route && !selected && (
        <aside className="atlas__route" data-atlas-ui aria-label="Route" data-lenis-prevent>
          <div className="atlas__drawer-head">
            <span className="atlas__type mono">Route · {route.steps.length} hops</span>
            <button type="button" className="atlas__close" onClick={() => setRoute(null)} aria-label="Clear route">
              ✕
            </button>
          </div>
          <h3 className="atlas__route-title">
            {byId.get(route.from).title} <span>→</span> {byId.get(route.to).title}
          </h3>
          <p className="atlas__body atlas__body--muted">The shortest walk through related ideas — each hop links two of his nearest neighbours in meaning.</p>
          <ol className="atlas__steps">
            {route.ids.map((id, i) => {
              const n = byId.get(id);
              const step = route.steps[i - 1];
              return (
                <li key={id}>
                  {step && <span className="atlas__step-sim mono">{Math.round(step.sim * 100)}% similar</span>}
                  <button type="button" onClick={() => select(n)}>
                    <span className="atlas__glyph" data-type={n.type} aria-hidden="true">
                      {TYPE_GLYPH[n.type]}
                    </span>
                    {n.title}
                  </button>
                </li>
              );
            })}
          </ol>
        </aside>
      )}

      {/* ---------- Tour ---------- */}
      {tour && (
        <div className="atlas__tour" data-atlas-ui role="region" aria-label="Guided tour" aria-live="polite">
          <div className="atlas__tour-progress" aria-hidden="true">
            {data.tour.map((_, i) => (
              <span key={i} data-on={i <= tour.step || undefined} />
            ))}
          </div>
          {tourStop.id && <p className="atlas__tour-kicker mono">{byId.get(tourStop.id).title}</p>}
          <p className="atlas__tour-caption">{tourStop.caption}</p>
          <div className="atlas__tour-nav">
            <button type="button" onClick={() => goToStop(Math.max(0, tour.step - 1), false)} disabled={tour.step === 0} aria-label="Previous stop">
              ←
            </button>
            <button type="button" onClick={() => setTour((t) => ({ ...t, playing: !t.playing }))} aria-label={tour.playing ? 'Pause tour' : 'Play tour'}>
              {tour.playing ? '❚❚' : '▶'}
            </button>
            {tour.step < data.tour.length - 1 ? (
              <button type="button" onClick={() => goToStop(tour.step + 1, false)} aria-label="Next stop">
                →
              </button>
            ) : (
              <button type="button" className="atlas__btn atlas__btn--ink" onClick={() => setTour(null)}>
                Explore
              </button>
            )}
            <button type="button" className="atlas__tour-exit mono" onClick={() => setTour(null)}>
              Exit tour
            </button>
          </div>
        </div>
      )}

      {/* ---------- Map furniture ---------- */}
      <ScaleBar store={viewStore.current} />

      <div className="atlas__mini" data-atlas-ui>
        <MiniMap store={viewStore.current} image={miniImage} selected={selected} onJump={(x, y) => engineRef.current?.flyTo(x, y, engineRef.current.cam.k)} />
        <div className="atlas__zoom">
          <button type="button" onClick={() => engineRef.current?.zoomBy(1.6)} aria-label="Zoom in">
            +
          </button>
          <button type="button" onClick={() => engineRef.current?.zoomBy(1 / 1.6)} aria-label="Zoom out">
            −
          </button>
          <button type="button" onClick={() => engineRef.current?.fit()} aria-label="Fit whole map">
            ⤢
          </button>
        </div>
      </div>

      {/* ---------- List view ---------- */}
      {listOpen && (
        <div className="atlas__list-wrap" data-atlas-ui role="dialog" aria-modal="true" aria-labelledby="atlas-list-title">
          <div className="atlas__list" data-lenis-prevent>
            <div className="atlas__drawer-head">
              <h2 id="atlas-list-title" className="atlas__list-title">
                Index of places
              </h2>
              <button type="button" className="atlas__close" onClick={() => setListOpen(false)} aria-label="Close list view" autoFocus>
                ✕
              </button>
            </div>
            {glError && <p className="atlas__body atlas__body--muted">Your browser can’t draw the map (WebGL2 unavailable), so here’s everything as a list.</p>}
            {data.regions.map((r) => (
              <section key={r.id} className="atlas__section">
                <h3 className="mono">{r.name}</h3>
                <ul className="atlas__index">
                  {data.nodes
                    .filter((n) => n.region === r.id)
                    .sort((a, b) => b.weight - a.weight)
                    .map((n) => (
                      <li key={n.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setListOpen(false);
                            if (!glError) select(n);
                          }}
                        >
                          <span className="atlas__glyph" data-type={n.type} aria-hidden="true">
                            {TYPE_GLYPH[n.type]}
                          </span>
                          <span>
                            <strong>{n.title}</strong>
                            {n.body && <span className="atlas__index-body">{n.body}</span>}
                          </span>
                        </button>
                      </li>
                    ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

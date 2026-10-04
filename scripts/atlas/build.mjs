import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { env, pipeline } from '@huggingface/transformers';
import { UMAP } from 'umap-js';
import { courses, education, experience, life, places, projects, skills, tour } from './nodes.mjs';
import { REGION_NAMES } from './regions.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../..');
const MODEL = 'Xenova/all-MiniLM-L6-v2';
const DTYPE = 'q8';
env.cacheDir = resolve(here, '.cache');

function mulberry32(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const nodes = [...projects, ...experience, ...education, ...places, ...skills, ...courses, ...life];
const ids = new Set();
for (const n of nodes) {
  if (ids.has(n.id)) throw new Error(`duplicate id ${n.id}`);
  ids.add(n.id);
}
for (const n of nodes) for (const u of n.usedIn ?? []) if (!ids.has(u)) throw new Error(`${n.id}.usedIn → unknown ${u}`);

console.log(`Embedding ${nodes.length} nodes with ${MODEL} (${DTYPE})…`);
const extractor = await pipeline('feature-extraction', MODEL, { dtype: DTYPE });
const out = await extractor(nodes.map((n) => `${n.title}. ${n.text}`), { pooling: 'mean', normalize: true });
const dims = out.dims[1];
const vecs = nodes.map((_, i) => Array.from(out.data.slice(i * dims, (i + 1) * dims)));
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const sim = vecs.map((a) => vecs.map((b) => dot(a, b)));

console.log('Projecting with UMAP…');
const umap = new UMAP({
  nComponents: 2,
  nNeighbors: 10,
  minDist: 0.55,
  spread: 1.4,
  random: mulberry32(7),
  distanceFn: (a, b) => 1 - dot(a, b),
});
let pos = umap.fit(vecs);

// Normalise into [-1, 1] keeping aspect, centred.
const xs = pos.map((p) => p[0]);
const ys = pos.map((p) => p[1]);
const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
const span = Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)) / 2;
pos = pos.map(([x, y]) => [(x - cx) / span, (y - cy) / span]);

// Gentle de-overlap so labels breathe, without leaving UMAP's neighbourhoods.
const anchor = pos.map((p) => [...p]);
const minGap = (a, b) => 0.07 + 0.05 * (nodes[a].weight + nodes[b].weight);
for (let iter = 0; iter < 240; iter++) {
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      const dx = pos[j][0] - pos[i][0];
      const dy = pos[j][1] - pos[i][1];
      const d = Math.hypot(dx, dy) || 1e-6;
      const g = minGap(i, j);
      if (d < g) {
        const push = ((g - d) / d) * 0.5;
        pos[i][0] -= dx * push;
        pos[i][1] -= dy * push;
        pos[j][0] += dx * push;
        pos[j][1] += dy * push;
      }
    }
    pos[i][0] += (anchor[i][0] - pos[i][0]) * 0.02;
    pos[i][1] += (anchor[i][1] - pos[i][1]) * 0.02;
  }
}

// Graph: k nearest semantic neighbours, plus a maximum-similarity spanning tree so every place is reachable.
const K = 3;
const edgeKey = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const edges = new Map();
nodes.forEach((_, i) => {
  sim[i]
    .map((s, j) => [j, s])
    .filter(([j]) => j !== i)
    .sort((a, b) => b[1] - a[1])
    .slice(0, K)
    .forEach(([j, s]) => edges.set(edgeKey(i, j), [Math.min(i, j), Math.max(i, j), s]));
});
const inTree = new Set([0]);
while (inTree.size < nodes.length) {
  let best = null;
  for (const i of inTree) {
    for (let j = 0; j < nodes.length; j++) {
      if (inTree.has(j)) continue;
      if (!best || sim[i][j] > best[2]) best = [i, j, sim[i][j]];
    }
  }
  inTree.add(best[1]);
  edges.set(edgeKey(best[0], best[1]), [Math.min(best[0], best[1]), Math.max(best[0], best[1]), best[2]]);
}

// Regions: k-means on the projected map, so each region is a contiguous area with room for a label.
const REGIONS = REGION_NAMES.length || 6;
const rand = mulberry32(11);
const weights = nodes.map((n) => n.weight);
let cents = [pos[Math.floor(rand() * pos.length)]];
while (cents.length < REGIONS) {
  const d2 = pos.map((p) => Math.min(...cents.map((c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2)));
  let r = rand() * d2.reduce((a, b) => a + b, 0);
  let k = 0;
  while ((r -= d2[k]) > 0) k++;
  cents.push(pos[k]);
}
let assign = [];
for (let iter = 0; iter < 60; iter++) {
  assign = pos.map((p) => cents.map((c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2).reduce((bi, d, i, arr) => (d < arr[bi] ? i : bi), 0));
  cents = cents.map((c, k) => {
    const members = pos.map((p, i) => [p, weights[i], i]).filter(([, , i]) => assign[i] === k);
    if (!members.length) return c;
    const w = members.reduce((s, [, wt]) => s + wt, 0);
    return [members.reduce((s, [p, wt]) => s + p[0] * wt, 0) / w, members.reduce((s, [p, wt]) => s + p[1] * wt, 0) / w];
  });
}

const regionName = (k) => {
  const members = new Set(nodes.filter((_, i) => assign[i] === k).map((n) => n.id));
  const match = REGION_NAMES.find((r) => r.anchors.some((a) => members.has(a)) && r.anchors.filter((a) => members.has(a)).length >= Math.ceil(r.anchors.length / 2));
  return match?.name ?? `Region ${k + 1}`;
};

// Region labels are wide, so place each in the emptiest horizontal band of its own territory.
const labelSpot = (k) => {
  const members = pos.filter((_, i) => assign[i] === k);
  const minX = Math.min(...members.map((p) => p[0])) + 0.05;
  const maxX = Math.max(...members.map((p) => p[0])) - 0.05;
  const minY = Math.min(...members.map((p) => p[1])) + 0.04;
  const maxY = Math.max(...members.map((p) => p[1])) - 0.04;
  let best = cents[k];
  let bestScore = -Infinity;
  for (let dy = -0.4; dy <= 0.4; dy += 0.02) {
    for (let dx = -0.4; dx <= 0.4; dx += 0.02) {
      const x = cents[k][0] + dx;
      const y = cents[k][1] + dy;
      const owner = cents.map((c) => (x - c[0]) ** 2 + (y - c[1]) ** 2).reduce((bi, d, i, arr) => (d < arr[bi] ? i : bi), 0);
      if (owner !== k || x < minX || x > maxX || y < minY || y > maxY) continue;
      const clear = Math.min(...pos.map((p) => Math.hypot((p[0] - x) * 0.32, p[1] - y)));
      const score = clear - 0.4 * Math.hypot(dx, dy);
      if (score > bestScore) {
        bestScore = score;
        best = [x, y];
      }
    }
  }
  return best;
};
const regions = cents.map((c, k) => {
  const [lx, ly] = labelSpot(k);
  return { id: k, name: regionName(k), x: +lx.toFixed(4), y: +ly.toFixed(4) };
});
for (let k = 0; k < REGIONS; k++) {
  console.log(`\n[${k}] ${regions[k].name}:`, nodes.filter((_, i) => assign[i] === k).map((n) => n.id).join(', '));
}

const atlas = {
  meta: { model: MODEL, dtype: DTYPE, dims, generated: new Date().toISOString().slice(0, 10), count: nodes.length },
  regions,
  nodes: nodes.map((n, i) => ({
    id: n.id,
    type: n.type,
    title: n.title,
    kicker: n.kicker ?? null,
    body: n.body ?? null,
    weight: n.weight,
    x: +pos[i][0].toFixed(4),
    y: +pos[i][1].toFixed(4),
    region: assign[i],
    usedIn: n.usedIn ?? [],
    caseId: n.caseId ?? null,
    url: n.url ?? null,
  })),
  edges: [...edges.values()].map(([a, b, s]) => [a, b, +s.toFixed(3)]),
  tour,
};

// Query-side vectors: int8 per-vector scale keeps the download ~30 KB.
const quantised = vecs.map((v) => {
  const scale = Math.max(...v.map(Math.abs)) / 127;
  return { s: +scale.toPrecision(6), q: Buffer.from(Int8Array.from(v.map((x) => Math.round(x / scale))).buffer).toString('base64') };
});

mkdirSync(resolve(root, 'src/lib/atlas'), { recursive: true });
mkdirSync(resolve(root, 'public/atlas'), { recursive: true });
writeFileSync(resolve(root, 'src/lib/atlas/atlas.json'), JSON.stringify(atlas));
writeFileSync(resolve(root, 'public/atlas/vectors.json'), JSON.stringify({ model: MODEL, dtype: DTYPE, dims, ids: nodes.map((n) => n.id), vectors: quantised }));
console.log(`\nWrote ${nodes.length} nodes, ${atlas.edges.length} edges, ${REGIONS} regions.`);

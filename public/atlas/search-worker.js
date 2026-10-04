// Module worker: embeds visitor queries on-device with the same model used to build the atlas.
const TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.0/dist/transformers.min.js';

let loading = null;
let extractor = null;
let index = null;

function decode(data) {
  return data.vectors.map(({ s, q }) => {
    const bytes = Uint8Array.from(atob(q), (c) => c.charCodeAt(0));
    const ints = new Int8Array(bytes.buffer);
    const v = new Float32Array(ints.length);
    let norm = 0;
    for (let i = 0; i < ints.length; i++) {
      v[i] = ints[i] * s;
      norm += v[i] * v[i];
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < v.length; i++) v[i] /= norm;
    return v;
  });
}

async function load() {
  const [{ pipeline, env }, data] = await Promise.all([import(TRANSFORMERS), fetch('/atlas/vectors.json').then((r) => r.json())]);
  env.allowLocalModels = false;
  index = { ids: data.ids, vectors: decode(data) };
  const seen = new Map();
  extractor = await pipeline('feature-extraction', data.model, {
    dtype: data.dtype,
    device: 'wasm',
    progress_callback: (p) => {
      if (p.status !== 'progress' || !p.total) return;
      seen.set(p.file, [p.loaded, p.total]);
      let loaded = 0;
      let total = 0;
      for (const [l, t] of seen.values()) {
        loaded += l;
        total += t;
      }
      self.postMessage({ type: 'progress', loaded, total });
    },
  });
  self.postMessage({ type: 'ready' });
}

function ensure() {
  if (!loading) {
    loading = load().catch((err) => {
      loading = null;
      self.postMessage({ type: 'error', message: String(err?.message ?? err) });
      throw err;
    });
  }
  return loading;
}

self.onmessage = async ({ data }) => {
  if (data.type === 'load') {
    ensure().catch(() => {});
    return;
  }
  if (data.type === 'query') {
    try {
      await ensure();
      const out = await extractor(data.text, { pooling: 'mean', normalize: true });
      const q = out.data;
      const scores = index.vectors.map((v, i) => {
        let s = 0;
        for (let d = 0; d < v.length; d++) s += v[d] * q[d];
        return { id: index.ids[i], score: s };
      });
      scores.sort((a, b) => b.score - a.score);
      self.postMessage({ type: 'results', id: data.id, results: scores });
    } catch {
      self.postMessage({ type: 'results', id: data.id, results: null });
    }
  }
};

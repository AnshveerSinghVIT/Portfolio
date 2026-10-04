// Atlas renderer: raw WebGL2, no scene graph. World space is the UMAP plane (~[-1, 1]); y points up.

const EXTENT_MIN = -1.6;
const EXTENT_SIZE = 3.2;
const GRID = 320;
const MAX_BUMPS = 12;
const TYPE_IDS = { project: 0, experience: 1, education: 2, place: 3, skill: 4, course: 5, life: 6 };
const BASE_SIZE = { project: 7.5, experience: 7.5, education: 6.5, place: 6, skill: 3.6, course: 3.8, life: 5.5 };
const LABEL_MIN_ZOOM = { project: 0, experience: 0, education: 0, place: 0.9, life: 0.9, skill: 1.0, course: 1.5 };

const terrainVS = `#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const terrainFS = `#version 300 es
precision highp float;
uniform sampler2D uH;
uniform vec2 uRes;
uniform vec3 uCam;
uniform vec2 uExtent;
uniform float uReveal;
uniform float uTime;
uniform vec4 uBumps[${MAX_BUMPS}];
uniform int uBumpCount;
uniform vec3 uCursor;
out vec4 o;

float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 w = uCam.xy + (frag - uRes * 0.5) / uCam.z;
  vec2 uv = (w - uExtent.x) / uExtent.y;
  float base = texture(uH, uv).r;
  float lift = 0.0;
  for (int i = 0; i < ${MAX_BUMPS}; i++) {
    if (i >= uBumpCount) break;
    vec4 b = uBumps[i];
    vec2 d = w - b.xy;
    lift += b.z * exp(-dot(d, d) / (2.0 * b.w * b.w));
  }
  vec2 dc = w - uCursor.xy;
  float h = base + lift + uCursor.z * exp(-dot(dc, dc) / 0.0072);

  vec3 paper = vec3(0.937, 0.925, 0.902);
  vec3 high = vec3(0.905, 0.874, 0.823);
  vec3 ink = vec3(0.071);
  vec3 accent = vec3(1.0, 0.353, 0.122);

  vec3 col = mix(paper, high, smoothstep(0.08, 1.0, h) * 0.75);

  vec2 g = vec2(dFdx(h), dFdy(h)) * uCam.z;
  vec3 n = normalize(vec3(-g * 0.55, 1.0));
  float shade = dot(n, normalize(vec3(-0.55, 0.6, 0.6)));
  col *= 0.94 + 0.08 * shade;

  float hot = clamp(lift * 2.2, 0.0, 1.0);
  col = mix(col, mix(col, accent, 0.16), hot);

  float levels = 18.0;
  float x = h * levels;
  float fw = max(fwidth(x), 1e-4);
  float density = 1.0 - smoothstep(0.22, 0.55, fw);
  float reveal = smoothstep(uReveal * levels * 1.15, uReveal * levels * 1.15 - 1.2, x);
  float d = abs(fract(x + 0.5) - 0.5);
  float minor = 1.0 - smoothstep(fw * 0.55, fw * 1.5, d);
  float xm = x / 4.0;
  float dm = abs(fract(xm + 0.5) - 0.5) * 4.0;
  float major = 1.0 - smoothstep(fw * 0.9, fw * 2.2, dm);
  float coastX = 0.06 * levels;
  float coast = 1.0 - smoothstep(fw * 1.0, fw * 2.4, abs(x - coastX));
  float land = step(0.06, h);
  float lineA = max(max(minor * 0.16, major * 0.34) * land, coast * 0.55) * density * reveal;
  vec3 lineCol = mix(ink, accent * 0.85, hot);
  col = mix(col, lineCol, lineA);

  float hatchK = 90.0;
  float hx = (w.x - w.y) * hatchK;
  float hd = abs(fract(hx + 0.5) - 0.5) / max(fwidth(hx), 1e-4);
  float hatch = (1.0 - smoothstep(0.4, 1.3, hd)) * (1.0 - land) * smoothstep(0.0, 0.06, h) * 0.18;
  col = mix(col, ink, hatch * reveal);

  float gs = 0.25;
  vec2 gp = abs(fract(w / gs + 0.5) - 0.5) * gs * uCam.z;
  float dash = step(0.5, fract((w.x + w.y) * 40.0));
  float grid = (1.0 - smoothstep(0.4, 1.2, min(gp.x, gp.y))) * 0.08 * dash;
  col = mix(col, ink, grid);

  vec2 q = frag / uRes - 0.5;
  col *= 1.0 - dot(q, q) * 0.18;
  col += (hash(frag + fract(uTime)) - 0.5) * 0.018;
  o = vec4(col, 1.0);
}`;

const edgeVS = `#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aSeg;
layout(location = 2) in vec4 aStyle;
uniform vec3 uCam;
uniform vec2 uRes;
uniform float uDpr;
out float vAlong;
out float vAcross;
out vec4 vStyle;
void main() {
  vec2 a = (aSeg.xy - uCam.xy) * uCam.z;
  vec2 b = (aSeg.zw - uCam.xy) * uCam.z;
  vec2 dir = normalize(b - a + vec2(1e-5));
  vec2 nrm = vec2(-dir.y, dir.x);
  float wpx = (aStyle.x + 1.5) * uDpr;
  vec2 p = mix(a, b, aCorner.x) + nrm * aCorner.y * wpx * 0.5;
  gl_Position = vec4(p / (uRes * 0.5), 0.0, 1.0);
  vAlong = aCorner.x * length(aSeg.zw - aSeg.xy);
  vAcross = aCorner.y * (aStyle.x + 1.5) / max(aStyle.x, 0.5);
  vStyle = aStyle;
}`;

const edgeFS = `#version 300 es
precision highp float;
in float vAlong;
in float vAcross;
in vec4 vStyle;
uniform float uTime;
out vec4 o;
void main() {
  float kind = vStyle.w;
  float dashLen = vStyle.z;
  float along = vAlong - (kind > 1.5 ? uTime * 0.12 : 0.0);
  if (dashLen > 0.0 && fract(along / dashLen) > 0.5) discard;
  float aa = 1.0 - smoothstep(0.75, 1.0, abs(vAcross));
  vec3 ink = vec3(0.071);
  vec3 accent = vec3(1.0, 0.353, 0.122);
  vec3 c = kind > 1.5 ? accent : ink;
  float a = vStyle.y * aa;
  o = vec4(c * a, a);
}`;

const nodeVS = `#version 300 es
layout(location = 0) in vec2 aCorner;
layout(location = 1) in vec4 aNode;
layout(location = 2) in vec4 aState;
uniform vec3 uCam;
uniform vec2 uRes;
uniform float uDpr;
out vec2 vUv;
out vec4 vState;
flat out float vType;
out float vPx;
void main() {
  float grow = 1.0 + 0.45 * aState.x + 0.35 * aState.y + 0.5 * aState.z;
  float s = aNode.z * grow * uDpr * aState.w;
  vec2 c = (aNode.xy - uCam.xy) * uCam.z;
  float pad = 2.4;
  gl_Position = vec4((c + aCorner * s * pad) / (uRes * 0.5), 0.0, 1.0);
  vUv = aCorner * pad;
  vState = aState;
  vType = aNode.w;
  vPx = s;
}`;

const nodeFS = `#version 300 es
precision highp float;
in vec2 vUv;
in vec4 vState;
flat in float vType;
in float vPx;
uniform float uTime;
uniform float uDim;
out vec4 o;

float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdTri(vec2 p) {
  const float k = 1.7320508;
  p.y += 0.25;
  p.x = abs(p.x) - 1.0;
  p.y = p.y + 1.0 / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0, 0.0);
  return -length(p) * sign(p.y);
}

void main() {
  vec2 p = vUv;
  float r = length(p);
  float px = 1.0 / max(vPx, 0.5);
  int t = int(vType + 0.5);
  float d;
  float ring = 1e3;
  if (t == 0) { d = r - 0.5; ring = abs(r - 1.0) - 0.16; }
  else if (t == 1) { d = sdTri(p * 1.15) / 1.15; }
  else if (t == 2) { d = sdBox(p, vec2(0.78)) - 0.06; }
  else if (t == 3) { d = sdBox(vec2(p.x + p.y, p.x - p.y) * 0.7071, vec2(0.72)); d = abs(d) - 0.14; d = min(d, r - 0.28); }
  else if (t == 4) { d = r - 1.0; }
  else if (t == 5) { d = abs(r - 0.82) - 0.2; }
  else { d = min(sdBox(p, vec2(1.0, 0.24)), sdBox(p, vec2(0.24, 1.0))); }

  float fill = 1.0 - smoothstep(-px, px, min(d, ring));
  float knock = 1.0 - smoothstep(-px, px, r - 1.45);

  float sel = vState.y;
  float match = vState.z;
  vec3 ink = vec3(0.071);
  vec3 paper = vec3(0.937, 0.925, 0.902);
  vec3 accent = vec3(1.0, 0.353, 0.122);
  vec3 c = mix(ink, accent, clamp(max(sel, match * 1.2), 0.0, 1.0));

  float pulse = fract(uTime * 0.6);
  float halo = (1.0 - smoothstep(px * 1.5, px * 3.0, abs(r - (1.5 + pulse * 0.8)))) * (1.0 - pulse) * sel;

  float dim = mix(1.0, 0.32, uDim * (1.0 - max(match, max(sel, vState.x))));
  vec3 col = mix(paper, c, fill);
  float a = max(knock * 0.82, fill) * dim;
  vec4 glyph = vec4(col * a, a);
  vec4 h = vec4(accent * halo * 0.9, halo * 0.9);
  o = glyph + h * (1.0 - glyph.a);
}`;

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  return sh;
}

// Compile without querying status, so drivers with KHR_parallel_shader_compile can work off the main thread.
function startProgram(gl, vs, fs) {
  const p = gl.createProgram();
  const shaders = [compile(gl, gl.VERTEX_SHADER, vs), compile(gl, gl.FRAGMENT_SHADER, fs)];
  shaders.forEach((sh) => gl.attachShader(p, sh));
  gl.linkProgram(p);
  return { p, shaders };
}

function finishProgram(gl, { p, shaders }) {
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const logs = shaders.map((sh) => gl.getShaderInfoLog(sh)).filter(Boolean).join('\n');
    throw new Error(logs || gl.getProgramInfoLog(p));
  }
  const uniforms = {};
  const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) {
    const name = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, '');
    uniforms[name] = gl.getUniformLocation(p, name);
  }
  return { p, u: uniforms };
}

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);
function toHalf(v) {
  f32[0] = v;
  const x = u32[0];
  const sign = (x >>> 16) & 0x8000;
  const e = ((x >>> 23) & 0xff) - 112;
  if (e <= 0) return sign;
  if (e >= 31) return sign | 0x7c00;
  return sign | (e << 10) | ((x & 0x7fffff) >>> 13);
}

export function buildHeightField(nodes) {
  const grid = new Float32Array(GRID * GRID);
  const cell = EXTENT_SIZE / GRID;
  for (const n of nodes) {
    const sigma = 0.052 + 0.07 * n.weight;
    const amp = 0.22 + 0.78 * n.weight;
    const inv = 1 / (2 * sigma * sigma);
    const r = sigma * 3.2;
    const i0 = Math.max(0, Math.floor((n.x - r - EXTENT_MIN) / cell));
    const i1 = Math.min(GRID - 1, Math.ceil((n.x + r - EXTENT_MIN) / cell));
    const j0 = Math.max(0, Math.floor((n.y - r - EXTENT_MIN) / cell));
    const j1 = Math.min(GRID - 1, Math.ceil((n.y + r - EXTENT_MIN) / cell));
    for (let j = j0; j <= j1; j++) {
      const wy = EXTENT_MIN + (j + 0.5) * cell - n.y;
      for (let i = i0; i <= i1; i++) {
        const wx = EXTENT_MIN + (i + 0.5) * cell - n.x;
        grid[j * GRID + i] += amp * Math.exp(-(wx * wx + wy * wy) * inv);
      }
    }
  }
  let max = 0;
  for (const v of grid) if (v > max) max = v;
  for (let i = 0; i < grid.length; i++) grid[i] = Math.pow(grid[i] / max, 0.72);
  return grid;
}

export function sampleHeight(grid, x, y) {
  const i = Math.round(((x - EXTENT_MIN) / EXTENT_SIZE) * GRID - 0.5);
  const j = Math.round(((y - EXTENT_MIN) / EXTENT_SIZE) * GRID - 0.5);
  if (i < 0 || j < 0 || i >= GRID || j >= GRID) return 0;
  return grid[j * GRID + i];
}

export function minimapImage(grid, size) {
  const img = new ImageData(size, size);
  const levels = 18;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const gi = Math.floor((x / size) * GRID);
      const gj = GRID - 1 - Math.floor((y / size) * GRID);
      const h = grid[gj * GRID + gi];
      const hr = grid[gj * GRID + Math.min(GRID - 1, gi + 2)];
      const hd = grid[Math.max(0, gj - 2) * GRID + gi];
      const line = Math.floor(h * levels) !== Math.floor(hr * levels) || Math.floor(h * levels) !== Math.floor(hd * levels);
      const land = h > 0.06;
      const t = Math.min(1, h);
      let r = 239 - t * 14;
      let g = 236 - t * 20;
      let b = 230 - t * 30;
      if (line && land) {
        r -= 70;
        g -= 70;
        b -= 70;
      }
      const k = (y * size + x) * 4;
      img.data[k] = r;
      img.data[k + 1] = g;
      img.data[k + 2] = b;
      img.data[k + 3] = 255;
    }
  }
  return img;
}

// Van Wijk & Nuij smooth zoom-pan path, as used by d3-zoom.
function interpolateZoom(p0, p1, rho = 1.4) {
  const rho2 = rho * rho;
  const rho4 = rho2 * rho2;
  const [ux0, uy0, w0] = p0;
  const [ux1, uy1, w1] = p1;
  const dx = ux1 - ux0;
  const dy = uy1 - uy0;
  const d2 = dx * dx + dy * dy;
  const cosh = (x) => ((x = Math.exp(x)) + 1 / x) / 2;
  const sinh = (x) => ((x = Math.exp(x)) - 1 / x) / 2;
  const tanh = (x) => ((x = Math.exp(2 * x)) - 1) / (x + 1);
  let S;
  let fn;
  if (d2 < 1e-12) {
    S = Math.log(w1 / w0) / rho;
    fn = (t) => [ux0 + t * dx, uy0 + t * dy, w0 * Math.exp(rho * t * S)];
  } else {
    const d1 = Math.sqrt(d2);
    const b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1);
    const b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    S = (r1 - r0) / rho;
    fn = (t) => {
      const s = t * S;
      const c0 = cosh(r0);
      const u = (w0 / (rho2 * d1)) * (c0 * tanh(rho * s + r0) - sinh(r0));
      return [ux0 + u * dx, uy0 + u * dy, (w0 * c0) / cosh(rho * s + r0)];
    };
  }
  fn.duration = Math.abs(S) * 1000 * (rho / Math.SQRT2);
  return fn;
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

export class AtlasEngine {
  constructor({ canvas, overlay, data, onHover, onSelect, onCamera, onPointer, onError, reducedMotion }) {
    this.canvas = canvas;
    this.overlay = overlay;
    this.data = data;
    this.nodes = data.nodes;
    this.cb = { onHover, onSelect, onCamera, onPointer, onError };
    this.reduced = reducedMotion;
    this.insets = { top: 0, right: 0, bottom: 0, left: 0 };
    this.exclusions = [];
    this.hoverId = null;
    this.selectedId = null;
    this.matches = new Map();
    this.route = [];
    this.anim = this.nodes.map(() => ({ hover: 0, sel: 0, match: 0, pop: 0 }));
    this.bumps = new Map();
    this.cursor = { x: 0, y: 0, amp: 0, target: 0 };
    this.reveal = this.reduced ? 1.2 : 0;
    this.time = 0;
    this.fly = null;
    this.zoomAnim = null;
    this.velocity = null;
    this.dim = 0;
    this.labelsDirty = true;
    this.raf = 0;
    this.destroyed = false;

    const gl = canvas.getContext('webgl2', { antialias: true, alpha: false, premultipliedAlpha: true, powerPreference: 'high-performance' });
    if (!gl) throw new Error('WebGL2 unavailable');
    this.gl = gl;

    this.grid = buildHeightField(this.nodes);
    this.heights = this.nodes.map((n) => sampleHeight(this.grid, n.x, n.y));

    gl.clearColor(0.937, 0.925, 0.902, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.parallel = gl.getExtension('KHR_parallel_shader_compile');
    this.pending = [startProgram(gl, terrainVS, terrainFS), startProgram(gl, edgeVS, edgeFS), startProgram(gl, nodeVS, nodeFS)];
    if (!this.parallel) this.finishPrograms();

    const half = new Uint16Array(this.grid.length);
    for (let i = 0; i < half.length; i++) half[i] = toHalf(this.grid[i]);
    this.heightTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.heightTex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R16F, GRID, GRID, 0, gl.RED, gl.HALF_FLOAT, half);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    this.emptyVao = gl.createVertexArray();
    this.edgeVao = this.makeInstanced([0, -1, 1, -1, 0, 1, 1, -1, 1, 1, 0, 1]);
    this.edgeBuf = this.edgeVao.instanceBuf;
    this.nodeVao = this.makeInstanced([-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1]);
    this.nodeBuf = this.nodeVao.instanceBuf;
    this.nodeData = new Float32Array(this.nodes.length * 8);

    this.neighbours = this.nodes.map(() => []);
    for (const [a, b, s] of data.edges) {
      this.neighbours[a].push([b, s]);
      this.neighbours[b].push([a, s]);
    }
    this.index = new Map(this.nodes.map((n, i) => [n.id, i]));

    this.buildLabels();
    this.resize();
    this.fit(false, this.homeZoom);
    this.bind();
    this.ro = new ResizeObserver(() => {
      this.resize();
      this.requestFrame();
    });
    this.ro.observe(canvas);
    this.requestFrame();
  }

  finishPrograms() {
    const gl = this.gl;
    [this.terrain, this.edgeProg, this.nodeProg] = this.pending.map((pr) => finishProgram(gl, pr));
    this.pending = null;
  }

  programsReady() {
    if (!this.pending) return true;
    const done = this.pending.every((pr) => this.gl.getProgramParameter(pr.p, this.parallel.COMPLETION_STATUS_KHR));
    if (!done) return false;
    try {
      this.finishPrograms();
      return true;
    } catch (err) {
      this.failed = true;
      this.cb.onError?.(err);
      return false;
    }
  }

  makeInstanced(corners) {
    const gl = this.gl;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const cb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(corners), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const ib = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, ib);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 32, 0);
    gl.vertexAttribDivisor(1, 1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 32, 16);
    gl.vertexAttribDivisor(2, 1);
    gl.bindVertexArray(null);
    vao.instanceBuf = ib;
    return vao;
  }

  // ---------- Camera ----------
  resize() {
    const r = this.canvas.getBoundingClientRect();
    this.W = Math.max(1, r.width);
    this.H = Math.max(1, r.height);
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = Math.round(this.W * this.dpr);
    this.canvas.height = Math.round(this.H * this.dpr);
    this.fitK = this.computeFitK();
    if (!this.cam) this.cam = { x: 0, y: 0, k: this.fitK };
    this.labelsDirty = true;
  }

  computeFitK() {
    const xs = this.nodes.map((n) => n.x);
    const ys = this.nodes.map((n) => n.y);
    const bw = Math.max(...xs) - Math.min(...xs) + 0.35;
    const bh = Math.max(...ys) - Math.min(...ys) + 0.35;
    const { top, right, bottom, left } = this.insets;
    return Math.min((this.W - left - right) / bw, (this.H - top - bottom) / bh);
  }

  setInsets(insets) {
    this.insets = { ...this.insets, ...insets };
    this.fitK = this.computeFitK();
  }

  setExclusions(rects) {
    this.exclusions = rects;
    this.labelsDirty = true;
    this.requestFrame();
  }

  get kMin() {
    return this.fitK * 0.55;
  }
  get kMax() {
    return this.fitK * 12;
  }

  toWorld(sx, sy) {
    return [this.cam.x + (sx - this.W / 2) / this.cam.k, this.cam.y - (sy - this.H / 2) / this.cam.k];
  }
  toScreen(wx, wy) {
    return [(wx - this.cam.x) * this.cam.k + this.W / 2, -(wy - this.cam.y) * this.cam.k + this.H / 2];
  }

  // Shift a world target so it lands in the middle of the area not covered by UI panels.
  framed(x, y, k) {
    const { top, right, bottom, left } = this.insets;
    return [x + (right - left) / 2 / k, y - (bottom - top) / 2 / k, k];
  }

  setCamera(x, y, k) {
    this.cam.k = clamp(k, this.kMin, this.kMax);
    this.cam.x = clamp(x, EXTENT_MIN + 0.2, EXTENT_MIN + EXTENT_SIZE - 0.2);
    this.cam.y = clamp(y, EXTENT_MIN + 0.2, EXTENT_MIN + EXTENT_SIZE - 0.2);
    this.labelsDirty = true;
    this.cb.onCamera?.(this.cam, this.fitK);
  }

  flyTo(x, y, k, { duration } = {}) {
    this.velocity = null;
    this.zoomAnim = null;
    const [tx, ty, tk] = this.framed(x, y, clamp(k, this.kMin, this.kMax));
    const minDim = Math.min(this.W, this.H);
    if (this.reduced) {
      this.setCamera(tx, ty, tk);
      this.requestFrame();
      return;
    }
    const path = interpolateZoom([this.cam.x, this.cam.y, minDim / this.cam.k], [tx, ty, minDim / tk]);
    this.fly = { path, start: performance.now(), duration: duration ?? clamp(path.duration * 1.1, 650, 2200), minDim };
    this.requestFrame();
  }

  // Phones open closer in: the whole map at once is too dense to label on a narrow screen.
  get homeZoom() {
    return this.W < 760 ? 1.55 : 1;
  }

  fit(animate = true, zoom = 1) {
    const xs = this.nodes.map((n) => n.x);
    const ys = this.nodes.map((n) => n.y);
    const cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    const cy = (Math.min(...ys) + Math.max(...ys)) / 2;
    if (animate) this.flyTo(cx, cy, this.fitK * zoom);
    else {
      const [x, y, k] = this.framed(cx, cy, this.fitK * zoom);
      this.setCamera(x, y, k);
    }
  }

  home(animate = true) {
    this.fit(animate, this.homeZoom);
  }

  flyToNode(id, zoom = 3.2) {
    const i = this.index.get(id);
    if (i === undefined) return;
    const n = this.nodes[i];
    this.flyTo(n.x, n.y, Math.max(this.cam.k, this.fitK * zoom));
  }

  flyToNodes(ids) {
    const pts = ids.map((id) => this.nodes[this.index.get(id)]).filter(Boolean);
    if (!pts.length) return;
    if (pts.length === 1) return this.flyToNode(pts[0].id);
    const xs = pts.map((n) => n.x);
    const ys = pts.map((n) => n.y);
    const bw = Math.max(...xs) - Math.min(...xs) + 0.45;
    const bh = Math.max(...ys) - Math.min(...ys) + 0.45;
    const { top, right, bottom, left } = this.insets;
    const k = Math.min((this.W - left - right) / bw, (this.H - top - bottom) / bh);
    this.flyTo((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, k);
  }

  zoomBy(factor, sx, sy) {
    this.fly = null;
    const { top, right, bottom, left } = this.insets;
    sx ??= left + (this.W - left - right) / 2;
    sy ??= top + (this.H - top - bottom) / 2;
    const base = this.zoomAnim?.target ?? this.cam.k;
    const target = clamp(base * factor, this.kMin, this.kMax);
    this.zoomAnim = { target, sx, sy, anchor: this.toWorld(sx, sy) };
    this.requestFrame();
  }

  // ---------- State from React ----------
  setSelected(id) {
    this.selectedId = id;
    this.labelsDirty = true;
    this.requestFrame();
  }

  setMatches(list) {
    this.matches = new Map(list.map((m) => [m.id, m.score]));
    const top = list.slice(0, MAX_BUMPS);
    const max = Math.max(...top.map((m) => m.score), 1e-6);
    const next = new Map();
    for (const m of top) {
      const i = this.index.get(m.id);
      if (i === undefined) continue;
      const prev = this.bumps.get(m.id);
      next.set(m.id, { i, amp: prev?.amp ?? 0, target: 0.42 * Math.pow(m.score / max, 2) });
    }
    for (const [id, b] of this.bumps) if (!next.has(id) && b.amp > 0.002) next.set(id, { ...b, target: 0 });
    this.bumps = next;
    this.labelsDirty = true;
    this.requestFrame();
  }

  setRoute(ids) {
    this.route = ids.map((id) => this.index.get(id)).filter((i) => i !== undefined);
    this.labelsDirty = true;
    this.requestFrame();
  }

  neighboursOf(id) {
    const i = this.index.get(id);
    if (i === undefined) return [];
    return this.neighbours[i]
      .slice()
      .sort((a, b) => b[1] - a[1])
      .map(([j, s]) => ({ node: this.nodes[j], similarity: s }));
  }

  shortestPath(fromId, toId) {
    const s = this.index.get(fromId);
    const t = this.index.get(toId);
    if (s === undefined || t === undefined) return [];
    const dist = new Array(this.nodes.length).fill(Infinity);
    const prev = new Array(this.nodes.length).fill(-1);
    const done = new Array(this.nodes.length).fill(false);
    dist[s] = 0;
    for (;;) {
      let u = -1;
      for (let i = 0; i < dist.length; i++) if (!done[i] && dist[i] < Infinity && (u === -1 || dist[i] < dist[u])) u = i;
      if (u === -1 || u === t) break;
      done[u] = true;
      for (const [v, sim] of this.neighbours[u]) {
        const d = dist[u] + (1 - sim) + 0.05;
        if (d < dist[v]) {
          dist[v] = d;
          prev[v] = u;
        }
      }
    }
    if (dist[t] === Infinity) return [];
    const path = [];
    for (let v = t; v !== -1; v = prev[v]) path.unshift(v);
    return path.map((i) => this.nodes[i].id);
  }

  // ---------- Labels ----------
  buildLabels() {
    const layer = document.createElement('div');
    layer.className = 'atlas-labels';
    this.regionEls = this.data.regions.map((r) => {
      const el = document.createElement('div');
      el.className = 'atlas-region';
      el.textContent = r.name;
      layer.appendChild(el);
      return el;
    });
    this.labelEls = this.nodes.map((n) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'atlas-label';
      el.dataset.type = n.type;
      el.dataset.id = n.id;
      el.tabIndex = -1;
      el.textContent = n.title;
      layer.appendChild(el);
      return el;
    });
    this.overlay.appendChild(layer);
    this.labelLayer = layer;
    this.measureLabels();
    document.fonts?.ready.then(() => {
      if (this.destroyed) return;
      this.measureLabels();
      this.labelsDirty = true;
      this.requestFrame();
    });
  }

  measureLabels() {
    this.labelSize = this.labelEls.map((el) => [el.offsetWidth, el.offsetHeight]);
    this.regionBase = this.regionEls.map((el) => {
      el.style.fontSize = '20px';
      return [el.offsetWidth / 20, el.offsetHeight / 20];
    });
  }

  layoutLabels() {
    const z = this.cam.k / this.fitK;
    const placed = this.exclusions.map((r) => [...r]);
    const overlaps = (r) => placed.some((p) => r[0] < p[2] && r[2] > p[0] && r[1] < p[3] && r[3] > p[1]);
    const routeSet = new Set(this.route);
    const order = this.nodes
      .map((n, i) => {
        const forced = n.id === this.selectedId || n.id === this.hoverId || this.matches.has(n.id) || routeSet.has(i);
        return { n, i, forced, pri: (forced ? 100 : 0) + n.weight * 10 + (this.matches.get(n.id) ?? 0) * 20 };
      })
      .sort((a, b) => b.pri - a.pri);

    const reveal = this.reveal;
    for (const [i, n] of this.nodes.entries()) {
      if (this.heights[i] >= reveal * 1.15 || n.type === 'skill' || n.type === 'course') continue;
      const [sx, sy] = this.toScreen(n.x, n.y);
      const r = BASE_SIZE[n.type] + 3;
      placed.push([sx - r, sy - r, sx + r, sy + r]);
    }
    for (const { n, i, forced } of order) {
      const el = this.labelEls[i];
      const visibleByZoom = forced || z >= LABEL_MIN_ZOOM[n.type];
      const popped = this.heights[i] * 1.0 < reveal * 1.15;
      if (!visibleByZoom || !popped) {
        el.classList.remove('is-on');
        continue;
      }
      const [sx, sy] = this.toScreen(n.x, n.y);
      const [w, h] = this.labelSize[i];
      const r = BASE_SIZE[n.type] + 7;
      const candidates = [
        [sx + r, sy - h / 2],
        [sx - r - w, sy - h / 2],
        [sx - w / 2, sy - r - h],
        [sx - w / 2, sy + r - 2],
      ];
      let spot = null;
      for (const [x, y] of candidates) {
        const rect = [x - 3, y - 2, x + w + 3, y + h + 2];
        if (rect[0] < 4 || rect[2] > this.W - 4 || rect[1] < 4 || rect[3] > this.H - 4) continue;
        if (forced || !overlaps(rect)) {
          spot = [x, y, rect];
          break;
        }
      }
      if (!spot) {
        el.classList.remove('is-on');
        continue;
      }
      placed.push(spot[2]);
      el.style.transform = `translate3d(${spot[0].toFixed(1)}px, ${spot[1].toFixed(1)}px, 0)`;
      el.classList.add('is-on');
      el.classList.toggle('is-hot', n.id === this.selectedId || n.id === this.hoverId);
      el.classList.toggle('is-match', this.matches.has(n.id) || routeSet.has(i));
    }

    const regionAlpha = clamp(1.25 - (z - 1) * 0.55, 0, 1) * clamp(reveal * 1.4 - 0.4, 0, 1);
    const fontPx = clamp(13 + z * 4, 14, 26);
    const offsets = [[0, 0], [0, -34], [0, 34], [-70, 0], [70, 0], [0, -68], [0, 68], [-70, -34], [70, 34], [-70, 34], [70, -34]];
    this.data.regions.forEach((r, k) => {
      const el = this.regionEls[k];
      const [ax, ay] = this.toScreen(r.x, r.y);
      const w = this.regionBase[k][0] * fontPx;
      const h = this.regionBase[k][1] * fontPx;
      let spot = null;
      for (const [dx, dy] of offsets) {
        const x = ax + dx;
        const y = ay + dy;
        const rect = [x - w / 2, y - h / 2, x + w / 2, y + h / 2];
        if (rect[0] < 8 || rect[2] > this.W - 8 || rect[1] < 8 || rect[3] > this.H - 8) continue;
        if (!overlaps(rect)) {
          spot = [x, y, rect];
          break;
        }
      }
      if (!spot || regionAlpha < 0.02) {
        el.style.opacity = '0';
        return;
      }
      placed.push(spot[2]);
      el.style.transform = `translate3d(${spot[0].toFixed(1)}px, ${spot[1].toFixed(1)}px, 0) translate(-50%, -50%)`;
      el.style.opacity = regionAlpha.toFixed(3);
      el.style.fontSize = `${fontPx.toFixed(1)}px`;
    });
  }

  // ---------- Interaction ----------
  bind() {
    const el = this.overlay;
    const pointers = new Map();
    let drag = null;
    let pinch = null;

    const pick = (sx, sy, radius = 16) => {
      let best = -1;
      let bestD = radius * radius;
      this.nodes.forEach((n, i) => {
        const [x, y] = this.toScreen(n.x, n.y);
        const d = (x - sx) ** 2 + (y - sy) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      return best;
    };
    const local = (e) => {
      const r = el.getBoundingClientRect();
      return [e.clientX - r.left, e.clientY - r.top];
    };

    this.onPointerDown = (e) => {
      if (e.target.closest('[data-atlas-ui]')) return;
      el.setPointerCapture?.(e.pointerId);
      const p = local(e);
      pointers.set(e.pointerId, p);
      this.fly = null;
      this.velocity = null;
      if (pointers.size === 1) {
        drag = { start: p, last: p, t: performance.now(), moved: false, vx: 0, vy: 0, target: e.target };
      } else if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), k: this.cam.k, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] };
        pinch.anchor = this.toWorld(...pinch.mid);
        drag = null;
      }
    };

    this.onPointerMove = (e) => {
      const p = local(e);
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, p);
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
        const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const k = clamp((pinch.k * d) / pinch.d, this.kMin, this.kMax);
        this.setCamera(pinch.anchor[0] - (mid[0] - this.W / 2) / k, pinch.anchor[1] + (mid[1] - this.H / 2) / k, k);
        this.requestFrame();
        return;
      }
      if (drag) {
        const dx = p[0] - drag.last[0];
        const dy = p[1] - drag.last[1];
        if (!drag.moved && Math.hypot(p[0] - drag.start[0], p[1] - drag.start[1]) > 4) {
          drag.moved = true;
          el.classList.add('is-dragging');
        }
        if (drag.moved) {
          const now = performance.now();
          const dt = Math.max(1, now - drag.t);
          drag.vx = (dx / dt) * 0.8 + drag.vx * 0.2;
          drag.vy = (dy / dt) * 0.8 + drag.vy * 0.2;
          drag.t = now;
          this.setCamera(this.cam.x - dx / this.cam.k, this.cam.y + dy / this.cam.k, this.cam.k);
          this.requestFrame();
        }
        drag.last = p;
        return;
      }
      const [wx, wy] = this.toWorld(...p);
      this.cursor.x = wx;
      this.cursor.y = wy;
      this.cursor.target = e.pointerType === 'mouse' ? 0.055 : 0;
      this.cb.onPointer?.(wx, wy);
      const i = pick(...p);
      const labelId = e.target.closest?.('.atlas-label')?.dataset.id;
      const id = labelId ?? (i >= 0 ? this.nodes[i].id : null);
      if (id !== this.hoverId) {
        this.hoverId = id;
        el.classList.toggle('is-pointing', !!id);
        this.labelsDirty = true;
        this.cb.onHover?.(id ? this.nodes[this.index.get(id)] : null);
      }
      this.requestFrame();
    };

    this.onPointerUp = (e) => {
      const p = local(e);
      pointers.delete(e.pointerId);
      if (pinch) {
        if (pointers.size < 2) pinch = null;
        return;
      }
      if (!drag) return;
      el.classList.remove('is-dragging');
      if (!drag.moved) {
        const labelId = drag.target.closest?.('.atlas-label')?.dataset.id;
        const i = labelId ? this.index.get(labelId) : pick(...p, e.pointerType === 'touch' ? 26 : 16);
        this.cb.onSelect?.(i >= 0 && i !== undefined ? this.nodes[i] : null);
      } else if (!this.reduced && performance.now() - drag.t < 80) {
        this.velocity = { vx: drag.vx, vy: drag.vy };
        this.requestFrame();
      }
      drag = null;
    };

    this.onLeave = () => {
      this.cursor.target = 0;
      if (this.hoverId) {
        this.hoverId = null;
        el.classList.remove('is-pointing');
        this.labelsDirty = true;
        this.cb.onHover?.(null);
      }
      this.requestFrame();
    };

    this.onWheel = (e) => {
      if (e.target.closest('[data-atlas-ui]')) return;
      e.preventDefault();
      const [sx, sy] = local(e);
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1;
      const factor = Math.exp(-e.deltaY * unit * (e.ctrlKey ? 0.01 : 0.0018));
      this.zoomBy(factor, sx, sy);
    };

    this.onDblClick = (e) => {
      if (e.target.closest('[data-atlas-ui]')) return;
      const [sx, sy] = local(e);
      this.zoomBy(e.shiftKey ? 0.5 : 2, sx, sy);
    };

    this.onKey = (e) => {
      if (e.target !== el) return;
      const step = 80 / this.cam.k;
      const keys = {
        ArrowLeft: () => this.setCamera(this.cam.x - step, this.cam.y, this.cam.k),
        ArrowRight: () => this.setCamera(this.cam.x + step, this.cam.y, this.cam.k),
        ArrowUp: () => this.setCamera(this.cam.x, this.cam.y + step, this.cam.k),
        ArrowDown: () => this.setCamera(this.cam.x, this.cam.y - step, this.cam.k),
        '+': () => this.zoomBy(1.5),
        '=': () => this.zoomBy(1.5),
        '-': () => this.zoomBy(1 / 1.5),
        0: () => this.fit(),
      };
      if (keys[e.key]) {
        e.preventDefault();
        this.fly = null;
        keys[e.key]();
        this.requestFrame();
      }
    };

    this.onVisibility = () => !document.hidden && this.requestFrame();

    el.addEventListener('pointerdown', this.onPointerDown);
    el.addEventListener('pointermove', this.onPointerMove);
    el.addEventListener('pointerup', this.onPointerUp);
    el.addEventListener('pointercancel', this.onPointerUp);
    el.addEventListener('pointerleave', this.onLeave);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('dblclick', this.onDblClick);
    el.addEventListener('keydown', this.onKey);
    document.addEventListener('visibilitychange', this.onVisibility);
  }

  // ---------- Frame ----------
  requestFrame() {
    if (!this.raf && !this.destroyed && !document.hidden) this.raf = requestAnimationFrame((t) => this.frame(t));
  }

  frame(now) {
    this.raf = 0;
    if (this.failed) return;
    if (!this.programsReady()) {
      this.requestFrame();
      return;
    }
    const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
    this.last = now;
    this.time += dt;
    let active = false;

    if (this.reveal < 1.2) {
      this.reveal = Math.min(1.2, this.reveal + dt / 2.6);
      this.labelsDirty = true;
      active = true;
    }

    if (this.fly) {
      const t = Math.min(1, (now - this.fly.start) / this.fly.duration);
      const [x, y, w] = this.fly.path(easeInOut(t));
      this.setCamera(x, y, this.fly.minDim / w);
      if (t >= 1) this.fly = null;
      active = true;
    } else if (this.zoomAnim) {
      const z = this.zoomAnim;
      const k = this.cam.k + (z.target - this.cam.k) * 0.22;
      const done = Math.abs(z.target - k) / z.target < 0.002;
      const kk = done ? z.target : k;
      this.setCamera(z.anchor[0] - (z.sx - this.W / 2) / kk, z.anchor[1] + (z.sy - this.H / 2) / kk, kk);
      if (done) this.zoomAnim = null;
      active = true;
    } else if (this.velocity) {
      const v = this.velocity;
      this.setCamera(this.cam.x - (v.vx * 16) / this.cam.k, this.cam.y + (v.vy * 16) / this.cam.k, this.cam.k);
      v.vx *= 0.92;
      v.vy *= 0.92;
      if (Math.hypot(v.vx, v.vy) < 0.01) this.velocity = null;
      active = true;
    }

    this.cursor.amp += (this.cursor.target - this.cursor.amp) * 0.08;
    if (Math.abs(this.cursor.target - this.cursor.amp) > 0.001) active = true;

    for (const [id, b] of this.bumps) {
      b.amp += (b.target - b.amp) * 0.07;
      if (Math.abs(b.target - b.amp) > 0.002) active = true;
      else if (b.target === 0) this.bumps.delete(id);
    }

    const dimTarget = this.matches.size || this.route.length ? 1 : 0;
    this.dim += (dimTarget - this.dim) * 0.1;
    if (Math.abs(dimTarget - this.dim) > 0.005) active = true;

    const routeSet = new Set(this.route);
    this.nodes.forEach((n, i) => {
      const a = this.anim[i];
      const tHover = n.id === this.hoverId ? 1 : 0;
      const tSel = n.id === this.selectedId ? 1 : routeSet.has(i) ? 0.6 : 0;
      const tMatch = this.matches.has(n.id) ? Math.min(1, 0.45 + this.matches.get(n.id)) : 0;
      const tPop = this.heights[i] < this.reveal * 1.15 ? 1 : 0;
      a.hover += (tHover - a.hover) * 0.25;
      a.sel += (tSel - a.sel) * 0.18;
      a.match += (tMatch - a.match) * 0.12;
      a.pop += (tPop - a.pop) * (this.reduced ? 1 : 0.16);
      if (Math.abs(tHover - a.hover) + Math.abs(tSel - a.sel) + Math.abs(tMatch - a.match) + Math.abs(tPop - a.pop) > 0.004) active = true;
    });

    if (this.selectedId || this.route.length) active = true;

    this.draw();
    if (this.labelsDirty) {
      this.layoutLabels();
      this.labelsDirty = false;
    }
    if (active) this.requestFrame();
  }

  draw() {
    const gl = this.gl;
    const { x, y, k } = this.cam;
    const kd = k * this.dpr;
    const res = [this.canvas.width, this.canvas.height];
    gl.viewport(0, 0, res[0], res[1]);
    gl.disable(gl.BLEND);

    const t = this.terrain;
    gl.useProgram(t.p);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.heightTex);
    gl.uniform1i(t.u.uH, 0);
    gl.uniform2f(t.u.uRes, res[0], res[1]);
    gl.uniform3f(t.u.uCam, x, y, kd);
    gl.uniform2f(t.u.uExtent, EXTENT_MIN, EXTENT_SIZE);
    gl.uniform1f(t.u.uReveal, this.reveal);
    gl.uniform1f(t.u.uTime, this.time);
    const bumps = new Float32Array(MAX_BUMPS * 4);
    let count = 0;
    for (const b of this.bumps.values()) {
      if (count >= MAX_BUMPS) break;
      const n = this.nodes[b.i];
      bumps.set([n.x, n.y, b.amp, 0.13], count * 4);
      count++;
    }
    gl.uniform4fv(t.u.uBumps, bumps);
    gl.uniform1i(t.u.uBumpCount, count);
    gl.uniform3f(t.u.uCursor, this.cursor.x, this.cursor.y, this.cursor.amp);
    gl.bindVertexArray(this.emptyVao);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const z = k / this.fitK;
    const hotIdx = new Set([this.index.get(this.hoverId), this.index.get(this.selectedId)].filter((v) => v !== undefined));
    const edgeRows = [];
    const baseAlpha = clamp(0.05 + (z - 1) * 0.05, 0.05, 0.16) * Math.min(1, this.reveal);
    for (const [a, b] of this.data.edges) {
      const hot = hotIdx.has(a) || hotIdx.has(b);
      const na = this.nodes[a];
      const nb = this.nodes[b];
      edgeRows.push(na.x, na.y, nb.x, nb.y, hot ? 1.4 : 1, hot ? 0.55 : baseAlpha, hot ? 0 : 0.014, hot ? 1 : 0);
    }
    for (let r = 0; r + 1 < this.route.length; r++) {
      const na = this.nodes[this.route[r]];
      const nb = this.nodes[this.route[r + 1]];
      edgeRows.push(na.x, na.y, nb.x, nb.y, 3, 0.95, 0.03, 2);
    }
    const ep = this.edgeProg;
    gl.useProgram(ep.p);
    gl.uniform3f(ep.u.uCam, x, y, kd);
    gl.uniform2f(ep.u.uRes, res[0], res[1]);
    gl.uniform1f(ep.u.uDpr, this.dpr);
    gl.uniform1f(ep.u.uTime, this.time);
    gl.bindVertexArray(this.edgeVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.edgeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(edgeRows), gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, edgeRows.length / 8);

    const nd = this.nodeData;
    const zoomScale = clamp(0.85 + (z - 1) * 0.12, 0.85, 1.5);
    this.nodes.forEach((n, i) => {
      const a = this.anim[i];
      nd.set([n.x, n.y, BASE_SIZE[n.type] * zoomScale, TYPE_IDS[n.type], a.hover, a.sel, a.match, a.pop], i * 8);
    });
    const np = this.nodeProg;
    gl.useProgram(np.p);
    gl.uniform3f(np.u.uCam, x, y, kd);
    gl.uniform2f(np.u.uRes, res[0], res[1]);
    gl.uniform1f(np.u.uDpr, this.dpr);
    gl.uniform1f(np.u.uTime, this.time);
    gl.uniform1f(np.u.uDim, this.dim);
    gl.bindVertexArray(this.nodeVao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.nodeBuf);
    gl.bufferData(gl.ARRAY_BUFFER, nd, gl.DYNAMIC_DRAW);
    gl.drawArraysInstanced(gl.TRIANGLES, 0, 6, this.nodes.length);
    gl.bindVertexArray(null);
  }

  viewRect() {
    const [x0, y0] = this.toWorld(0, this.H);
    const [x1, y1] = this.toWorld(this.W, 0);
    return { x0, y0, x1, y1, extentMin: EXTENT_MIN, extentSize: EXTENT_SIZE };
  }

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    const el = this.overlay;
    el.removeEventListener('pointerdown', this.onPointerDown);
    el.removeEventListener('pointermove', this.onPointerMove);
    el.removeEventListener('pointerup', this.onPointerUp);
    el.removeEventListener('pointercancel', this.onPointerUp);
    el.removeEventListener('pointerleave', this.onLeave);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('dblclick', this.onDblClick);
    el.removeEventListener('keydown', this.onKey);
    document.removeEventListener('visibilitychange', this.onVisibility);
    this.labelLayer.remove();
    const gl = this.gl;
    gl.deleteTexture(this.heightTex);
    for (const pr of this.pending ?? [this.terrain, this.edgeProg, this.nodeProg]) if (pr) gl.deleteProgram(pr.p);
  }
}

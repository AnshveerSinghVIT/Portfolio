'use client';

import { useEffect, useRef } from 'react';

const noise = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0);const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy));vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz);vec3 l=1.0-g;vec3 i1=min(g.xyz,l.zxy);vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx;vec3 x2=x0-i2+C.yyy;vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857;vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z);vec4 x_=floor(j*ns.z);vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy;vec4 y=y_*ns.x+ns.yyyy;vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy);vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0;vec4 s1=floor(b1)*2.0+1.0;vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x);vec3 p1=vec3(a0.zw,h.y);vec3 p2=vec3(a1.xy,h.z);vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}`;

const vertexShader = /* glsl */ `
precision highp float;
attribute vec3 position;
uniform mat4 uProjection;
uniform mat4 uModelView;
uniform float uTime;
uniform float uEnergy;
uniform vec2 uMouse;
uniform float uPulse;
uniform float uPulseTime;
uniform vec2 uPulseDir;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${noise}

float field(vec3 p){
  vec3 q = p + vec3(uMouse * 0.6, 0.0);
  float slow = snoise(q * 0.9 + vec3(0.0, uTime * 0.18, uTime * 0.1));
  float fine = snoise(q * 2.6 - vec3(uTime * 0.35));
  float wave = sin(dot(normalize(p), normalize(vec3(uPulseDir, 0.7))) * 9.0 - uPulseTime * 11.0) * uPulse;
  return slow * (0.28 + uEnergy * 0.22) + fine * (0.05 + uEnergy * 0.08) + wave * 0.16;
}

vec3 orthogonal(vec3 v){
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

void main(){
  vec3 n = normalize(position);
  float d = field(position);
  vec3 p = position + n * d;
  vec3 t = orthogonal(n);
  vec3 b = normalize(cross(n, t));
  float e = 0.012;
  vec3 qt = position + t * e;
  vec3 qb = position + b * e;
  vec3 pt = qt + normalize(qt) * field(qt);
  vec3 pb = qb + normalize(qb) * field(qb);
  vec3 dn = normalize(cross(pt - p, pb - p));
  vDisp = d;
  vNormal = normalize(mat3(uModelView) * dn);
  vec4 mv = uModelView * vec4(p, 1.0);
  vView = -mv.xyz;
  gl_Position = uProjection * mv;
}`;

const fragmentShader = /* glsl */ `
precision highp float;
uniform float uTime;
uniform float uHue;
uniform vec3 uRim;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;

vec3 palette(float t){
  vec3 a = vec3(0.86, 0.84, 0.86);
  vec3 b = vec3(0.14, 0.13, 0.16);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.02, 0.18, 0.38);
  return a + b * cos(6.28318 * (c * t + d));
}

void main(){
  vec3 N = normalize(vNormal);
  vec3 V = normalize(vView);
  float facing = max(dot(N, V), 0.0);
  float fres = pow(1.0 - facing, 2.4);

  vec3 col = palette(vDisp * 1.8 + N.y * 0.35 + N.x * 0.2 + uTime * 0.025 + uHue);

  vec3 L1 = normalize(vec3(0.4, 0.9, 0.7));
  vec3 L2 = normalize(vec3(-0.8, -0.3, 0.4));
  float diff = max(dot(N, L1), 0.0) * 0.55 + max(dot(N, L2), 0.0) * 0.18;
  float spec = pow(max(dot(reflect(-L1, N), V), 0.0), 48.0);
  float sheen = pow(max(dot(reflect(-L2, N), V), 0.0), 12.0);

  col *= 0.62 + diff;
  col += spec * 0.55;
  col += sheen * vec3(0.55, 0.62, 1.0) * 0.18;
  col = mix(col, uRim, fres * 0.85);
  col += fres * fres * 0.25;

  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.025;

  gl_FragColor = vec4(col, 1.0);
}`;

function icosphere(radius, levels) {
  const t = (1 + Math.sqrt(5)) / 2;
  const verts = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map((v) => {
    const l = Math.hypot(...v);
    return v.map((c) => c / l);
  });
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];
  for (let l = 0; l < levels; l++) {
    const cache = new Map();
    const mid = (a, b) => {
      const key = a < b ? a * 1e6 + b : b * 1e6 + a;
      let i = cache.get(key);
      if (i === undefined) {
        const m = [0, 1, 2].map((k) => (verts[a][k] + verts[b][k]) / 2);
        const len = Math.hypot(...m);
        i = verts.push(m.map((c) => c / len)) - 1;
        cache.set(key, i);
      }
      return i;
    };
    faces = faces.flatMap(([a, b, c]) => {
      const ab = mid(a, b);
      const bc = mid(b, c);
      const ca = mid(c, a);
      return [[a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]];
    });
  }
  const positions = new Float32Array(verts.length * 3);
  verts.forEach((v, i) => positions.set([v[0] * radius, v[1] * radius, v[2] * radius], i * 3));
  const Index = verts.length > 65535 ? Uint32Array : Uint16Array;
  return { positions, indices: new Index(faces.flat()) };
}

function perspective(fovY, aspect, near, far) {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}

// Column-major T(x, y, z - camZ) · Rx · Ry · S, matching the previous three.js Euler XYZ setup.
function modelView(x, y, camZ, rx, ry, s) {
  const cx = Math.cos(rx);
  const sx = Math.sin(rx);
  const cy = Math.cos(ry);
  const sy = Math.sin(ry);
  return new Float32Array([
    cy * s, sx * sy * s, -cx * sy * s, 0,
    0, cx * s, sx * s, 0,
    sy * s, -sx * cy * s, cx * cy * s, 0,
    x, y, -camZ, 1,
  ]);
}

function compile(gl, type, src) {
  const sh = gl.createShader(type);
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
  return sh;
}

const CAM_Z = 4.2;
const FOV = (45 * Math.PI) / 180;

export default function HeroBlob() {
  const wrap = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' }) || canvas.getContext('webgl', { antialias: true, alpha: true });
    if (!gl) return;
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const uintOk = webgl2 || !!gl.getExtension('OES_element_index_uint');

    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (err) {
      console.warn('Hero shader failed', err);
      return;
    }
    gl.useProgram(program);

    const { positions, indices } = icosphere(1.25, coarse || !uintOk ? 5 : 6);
    const pos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pos);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
    const idx = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idx);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    const indexType = indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;

    const U = Object.fromEntries(
      ['uProjection', 'uModelView', 'uTime', 'uEnergy', 'uMouse', 'uPulse', 'uPulseTime', 'uPulseDir', 'uHue', 'uRim'].map((n) => [n, gl.getUniformLocation(program, n)])
    );
    gl.uniform3f(U.uRim, 1, 90 / 255, 31 / 255);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0, 0, 0, 0);

    const state = { time: 0, energy: 0, mx: 0, my: 0, hue: 0, x: 0, y: 0, rx: 0, ry: 0, s: 0.001, pulseAt: -1e9, partyUntil: 0, pdx: 0, pdy: 0 };
    const pointer = { x: 0, y: 0, vx: 0, vy: 0, lx: 0, ly: 0 };
    let aspect = 1;
    let mobile = false;
    // On small screens the blob centres on, and sizes to, the free "stage" between the hero's top row and intro text.
    const fit = { x: 0, y: 0, scale: 0.98 };
    const stage = canvas.closest('.hero')?.querySelector('[data-blob-fit]');
    let placed = false;

    const resize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 1.75);
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = w / Math.max(1, h);
      mobile = w < 760;
      gl.uniformMatrix4fv(U.uProjection, false, perspective(FOV, aspect, 0.1, 100));
      const sr = mobile && stage ? stage.getBoundingClientRect() : null;
      if (sr && sr.height > 0) {
        const cr = canvas.getBoundingClientRect();
        const worldPerPx = (2 * CAM_Z * Math.tan(FOV / 2)) / Math.max(1, h);
        fit.x = (sr.left + sr.width / 2 - (cr.left + cr.width / 2)) * worldPerPx;
        fit.y = -(sr.top + sr.height / 2 - (cr.top + cr.height / 2)) * worldPerPx;
        fit.scale = (0.74 * Math.min(sr.width, sr.height) * worldPerPx) / 2.5;
      } else {
        fit.x = 0;
        fit.y = 0;
        fit.scale = 0.98;
      }
      if (!placed) {
        state.x = fit.x;
        state.y = fit.y;
        placed = true;
      }
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    if (stage) ro.observe(stage);
    resize();

    const move = (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = -((e.clientY / innerHeight) * 2 - 1);
      pointer.vx = x - pointer.lx;
      pointer.vy = y - pointer.ly;
      pointer.x = pointer.lx = x;
      pointer.y = pointer.ly = y;
    };
    const pulse = (e) => {
      state.pulseAt = performance.now();
      state.pdx = e.detail?.x ?? 0;
      state.pdy = e.detail?.y ?? 0;
    };
    const party = () => (state.partyUntil = performance.now() + 5000);
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('blob:pulse', pulse);
    window.addEventListener('blob:party', party);

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const lerp = (a, b, t) => a + (b - a) * t;

    const frame = (now) => {
      raf = 0;
      const delta = Math.min(0.05, (now - last) / 1000);
      last = now;
      const p = pointer;
      const speed = Math.min(1, Math.hypot(p.vx, p.vy) * 18);
      p.vx *= 0.9;
      p.vy *= 0.9;

      state.time += delta * (reduced ? 0.25 : 1);
      const since = (now - state.pulseAt) / 1000;
      const pulseAmt = since < 4 ? Math.exp(-since * 1.4) : 0;
      if (now < state.partyUntil) state.hue += delta * 1.2;
      state.energy = lerp(state.energy, speed, speed > state.energy ? 0.12 : 0.02);
      state.mx += (p.x - state.mx) * 0.04;
      state.my += (p.y - state.my) * 0.04;

      const scrollT = Math.min(1, window.scrollY / innerHeight);
      state.x = lerp(state.x, fit.x + p.x * 0.14, 0.05);
      state.y = lerp(state.y, fit.y + p.y * 0.1 + scrollT * 0.9, 0.05);
      state.ry += delta * 0.08 + p.vx * 0.4;
      state.rx = lerp(state.rx, -p.y * 0.3, 0.05);
      const target = fit.scale * (1 - scrollT * 0.3) * (1 + pulseAmt * 0.06);
      state.s = lerp(state.s, target, 0.08);

      gl.uniform1f(U.uTime, state.time);
      gl.uniform1f(U.uEnergy, state.energy);
      gl.uniform2f(U.uMouse, state.mx, state.my);
      gl.uniform1f(U.uPulse, pulseAmt);
      gl.uniform1f(U.uPulseTime, since);
      gl.uniform2f(U.uPulseDir, state.pdx, state.pdy);
      gl.uniform1f(U.uHue, state.hue);
      gl.uniformMatrix4fv(U.uModelView, false, modelView(state.x, state.y, CAM_Z, state.rx, state.ry, state.s));

      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.drawElements(gl.TRIANGLES, indices.length, indexType, 0);
      if (visible && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      start();
    });
    io.observe(wrap.current);
    document.addEventListener('visibilitychange', start);
    start();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', start);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blob:pulse', pulse);
      window.removeEventListener('blob:party', party);
      gl.deleteBuffer(pos);
      gl.deleteBuffer(idx);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div ref={wrap} className="hero__gl" aria-hidden="true">
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}

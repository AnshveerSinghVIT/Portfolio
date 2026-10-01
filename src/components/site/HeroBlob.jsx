'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

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
uniform float uTime;
uniform float uEnergy;
uniform vec2 uMouse;
varying vec3 vNormal;
varying vec3 vView;
varying float vDisp;
${noise}

float field(vec3 p){
  vec3 q = p + vec3(uMouse * 0.6, 0.0);
  float slow = snoise(q * 0.9 + vec3(0.0, uTime * 0.18, uTime * 0.1));
  float fine = snoise(q * 2.6 - vec3(uTime * 0.35));
  return slow * (0.28 + uEnergy * 0.22) + fine * (0.05 + uEnergy * 0.08);
}

vec3 orthogonal(vec3 v){
  return normalize(abs(v.x) > abs(v.z) ? vec3(-v.y, v.x, 0.0) : vec3(0.0, -v.z, v.y));
}

vec3 displaced(vec3 p){
  return p + normalize(p) * field(p);
}

void main(){
  vec3 n = normalize(position);
  vec3 p = displaced(position);
  vec3 t = orthogonal(n);
  vec3 b = normalize(cross(n, t));
  float e = 0.012;
  vec3 pt = displaced(position + t * e);
  vec3 pb = displaced(position + b * e);
  vec3 dn = normalize(cross(pt - p, pb - p));
  vDisp = field(position);
  vNormal = normalize(normalMatrix * dn);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vView = -mv.xyz;
  gl_Position = projectionMatrix * mv;
}`;

const fragmentShader = /* glsl */ `
uniform float uTime;
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

  vec3 col = palette(vDisp * 1.8 + N.y * 0.35 + N.x * 0.2 + uTime * 0.025);

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

function Blob({ reduced }) {
  const mesh = useRef();
  const material = useRef();
  const { viewport, size } = useThree();
  const pointer = useRef({ x: 0, y: 0, vx: 0, vy: 0 });
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uEnergy: { value: 0 },
      uMouse: { value: new THREE.Vector2() },
      uRim: { value: new THREE.Color('#ff5a1f') },
    }),
    []
  );

  useEffect(() => {
    let last = { x: 0, y: 0 };
    const move = (e) => {
      const x = (e.clientX / innerWidth) * 2 - 1;
      const y = -((e.clientY / innerHeight) * 2 - 1);
      pointer.current.vx = x - last.x;
      pointer.current.vy = y - last.y;
      pointer.current.x = x;
      pointer.current.y = y;
      last = { x, y };
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  const mobile = size.width < 760;
  const baseX = mobile ? 0 : viewport.width * 0.22;
  const baseY = mobile ? viewport.height * 0.12 : 0;
  const baseScale = mobile ? 0.7 : 1.02;

  useFrame((state, delta) => {
    const m = mesh.current;
    if (!m) return;
    const p = pointer.current;
    const speed = Math.min(1, Math.hypot(p.vx, p.vy) * 18);
    p.vx *= 0.9;
    p.vy *= 0.9;

    if (!material.current) return;
    const u = material.current.uniforms;
    u.uTime.value += delta * (reduced.current ? 0.25 : 1);
    u.uEnergy.value = THREE.MathUtils.lerp(u.uEnergy.value, speed, speed > u.uEnergy.value ? 0.12 : 0.02);
    u.uMouse.value.x += (p.x - u.uMouse.value.x) * 0.04;
    u.uMouse.value.y += (p.y - u.uMouse.value.y) * 0.04;

    const scrollT = Math.min(1, window.scrollY / innerHeight);
    const targetX = baseX + p.x * 0.35;
    const targetY = baseY + p.y * 0.25 + scrollT * 1.2;
    m.position.x = THREE.MathUtils.lerp(m.position.x, targetX, 0.05);
    m.position.y = THREE.MathUtils.lerp(m.position.y, targetY, 0.05);
    m.rotation.y += delta * 0.08 + p.vx * 0.4;
    m.rotation.x = THREE.MathUtils.lerp(m.rotation.x, -p.y * 0.3, 0.05);
    const s = baseScale * (1 - scrollT * 0.35);
    m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, s, 0.08));
  });

  return (
    <mesh ref={mesh} position={[baseX, baseY, 0]} scale={0.001}>
      <icosahedronGeometry args={[1.25, mobile ? 32 : 64]} />
      <shaderMaterial ref={material} vertexShader={vertexShader} fragmentShader={fragmentShader} uniforms={uniforms} />
    </mesh>
  );
}

export default function HeroBlob() {
  const wrap = useRef(null);
  const [visible, setVisible] = useState(true);
  const reduced = useRef(false);

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrap} className="hero__gl" aria-hidden="true">
      <Canvas
        frameloop={visible ? 'always' : 'never'}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      >
        <Blob reduced={reduced} />
      </Canvas>
    </div>
  );
}

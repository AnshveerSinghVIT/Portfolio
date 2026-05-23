'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useScroll, ScrollControls, Image as DreiImage, Text, ContactShadows, Stars, Float, RoundedBox, Instance, Instances, Html, useTexture, Loader } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState, useMemo, useEffect, Suspense } from 'react';

// --- 1. RESPONSIVE HOOK ---
const useMobile = () => {
  const { viewport } = useThree();
  return viewport.width < 5;
};

// --- 2. NAVIGATION BUTTON ---
function SkipButton() {
  const scroll = useScroll();
  const handleSkip = () => {
    scroll.el.scrollTo({ top: scroll.el.scrollHeight, behavior: 'smooth' });
  };
  return (
    <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', pointerEvents: 'auto' }}>
        <button
          onClick={handleSkip}
          className="bg-slate-800/80 hover:bg-orange-500 text-white font-bold py-2 px-4 rounded-full text-xs tracking-widest backdrop-blur-md transition-all duration-300 shadow-lg border border-slate-600/50"
        >
          RESUME ⇩
        </button>
      </div>
    </Html>
  );
}

// --- 3. BACKGROUND EFFECTS (Now floating OVER the hands) ---
function WarpStars() {
  const scroll = useScroll();
  const ref = useRef();
  useFrame((state, delta) => {
    if (!ref.current) return;
    const speed = Math.abs(scroll.delta * 50);
    ref.current.factor = THREE.MathUtils.lerp(ref.current.factor, 4 + speed * 20, 0.1);
    ref.current.rotation.z += delta * 0.05;
  });
  return <Stars ref={ref} radius={100} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />;
}

function DarkWarpParticles({ count = 1000 }) {
  const scroll = useScroll();
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 100;
      const speed = 0.01 + Math.random() / 200;
      const xFactor = -50 + Math.random() * 100;
      const yFactor = -50 + Math.random() * 100;
      const zFactor = -50 + Math.random() * 100;
      temp.push({ t, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    const scrollSpeed = Math.abs(scroll.delta * 100);
    const stretch = 1 + scrollSpeed * 2;
    particles.forEach((data, i) => {
      let z = (data.zFactor + state.clock.elapsedTime * (data.speed + scrollSpeed * 0.05) * data.factor) % 100;
      if (z > 50) z -= 100;
      dummy.position.set(data.xFactor, data.yFactor, z);
      dummy.scale.set(1, 1, stretch);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <Instances range={count} ref={meshRef}>
      <boxGeometry args={[0.05, 0.05, 0.05]} />
      <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
      {particles.map((data, i) => <Instance key={i} />)}
    </Instances>
  );
}

function ConfettiParticles({ count = 150 }) {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    const colors = ["#ff6b6b", "#4ecdc4", "#ffe66d", "#1a535c", "#ff9f43"];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 5;
      const speed = 0.2 + Math.random() * 0.5;
      const rotSpeed = (Math.random() - 0.5) * 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      temp.push({ x, y, z, speed, rotSpeed, color });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      const t = state.clock.elapsedTime;
      p.y += Math.sin(t * p.speed + p.x) * 0.01;
      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(t * p.rotSpeed, t * p.rotSpeed, t * p.rotSpeed);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      meshRef.current.setColorAt(i, new THREE.Color(p.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <Instances range={count} ref={meshRef}>
      <boxGeometry args={[0.1, 0.1, 0.01]} />
      <meshStandardMaterial roughness={0.5} />
      {particles.map((data, i) => <Instance key={i} />)}
    </Instances>
  );
}

// --- 4. UI HELPERS ---

function GlassPanel({ width, height, position }) {
  return (
    <group position={position}>
      <RoundedBox args={[width, height, 0.1]} radius={0.2} bevelSegments={4}>
        <meshPhysicalMaterial color="#ffffff" transmission={0.5} roughness={0.0} thickness={2} transparent opacity={0.5} />
      </RoundedBox>
      <RoundedBox args={[width + 0.05, height + 0.05, 0.05]} radius={0.2}>
        <meshBasicMaterial color="#cbd5e1" wireframe />
      </RoundedBox>
    </group>
  )
}

const Button3D = ({ text, subtext, icon, url, position, color, width = 3 }) => {
  const [hovered, setHover] = useState(false);
  return (
    <group position={position}>
      <group
        onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
        onClick={() => window.open(url, '_blank')}
      >
        <RoundedBox args={[width, 0.8, 0.1]} radius={0.4} bevelSegments={4}>
          <meshStandardMaterial color={hovered ? color : "#f1f5f9"} />
        </RoundedBox>
        {icon && <Text font="/font.ttf" position={[-width / 2 + 0.6, 0.05, 0.06]} fontSize={0.3} color={hovered ? "#ffffff" : color}>{icon}</Text>}
        <Text font="/font.ttf" position={[icon ? 0.1 : 0, 0.08, 0.06]} fontSize={0.25} color={hovered ? "#ffffff" : "#334155"} fontWeight={800} anchorX="center">
          {text}
        </Text>
        {subtext && <Text font="/font.ttf" position={[0, -0.6, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">{subtext}</Text>}
      </group>
    </group>
  );
};

function BadgeLink({ text, url, position, color }) {
  const [hovered, setHover] = useState(false);
  return (
    <Text font="/font.ttf" position={position} fontSize={0.2} color={hovered ? "#3b82f6" : color} fontWeight={700} anchorX="center"
      onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
      onClick={() => window.open(url, '_blank')}
    >
      {text} {hovered ? "->" : ""}
    </Text>
  );
}

function InteractiveImage({ url, position, scale }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, -state.mouse.y * 0.1, 0.1);
    ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, state.mouse.x * 0.1, 0.1);
  });
  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <group ref={ref}>
          <DreiImage url={url} scale={scale} transparent />
          <mesh position={[0, 0.01, -0.05]} scale={[scale[0] + 0.3, scale[1] + 0.3, 0.05]}><boxGeometry /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      </Float>
    </group>
  );
}

function LenticularProfile({ position, scale }) {
  const groupRef = useRef();
  const img1 = useRef();
  const img2 = useRef();
  const img3 = useRef();
  const img4 = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    // Smooth physical card tilt
    groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -state.mouse.y * 0.15, 0.1);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, state.mouse.x * 0.2, 0.1);

    // Calculate which image to show based on X rotation/mouse
    const x = state.mouse.x;
    const t1 = x < -0.3 ? 1 : 0;
    const t2 = (x >= -0.3 && x < 0) ? 1 : 0;
    const t3 = (x >= 0 && x < 0.3) ? 1 : 0;
    const t4 = x >= 0.3 ? 1 : 0;

    // Smooth fade between lenticular frames
    if (img1.current?.material) img1.current.material.opacity = THREE.MathUtils.lerp(img1.current.material.opacity, t1, 0.2);
    if (img2.current?.material) img2.current.material.opacity = THREE.MathUtils.lerp(img2.current.material.opacity, t2, 0.2);
    if (img3.current?.material) img3.current.material.opacity = THREE.MathUtils.lerp(img3.current.material.opacity, t3, 0.2);
    if (img4.current?.material) img4.current.material.opacity = THREE.MathUtils.lerp(img4.current.material.opacity, t4, 0.2);
  });

  return (
    <group position={position}>
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.5}>
        <group ref={groupRef}>
          <DreiImage ref={img1} url="/profile1.jpg" scale={scale} transparent />
          <DreiImage ref={img2} url="/profile2.jpg" scale={scale} transparent position={[0, 0, 0.001]} />
          <DreiImage ref={img3} url="/profile3.jpg" scale={scale} transparent position={[0, 0, 0.002]} />
          <DreiImage ref={img4} url="/profile4.jpg" scale={scale} transparent position={[0, 0, 0.003]} />
          <mesh position={[0, 0.01, -0.05]} scale={[scale[0] + 0.3, scale[1] + 0.3, 0.05]}><boxGeometry /><meshStandardMaterial color="#ffffff" /></mesh>
        </group>
      </Float>
    </group>
  );
}

function IntroTextGroup({ isMobile, align }) {
  return (
    <group>
      <Text font="/font.ttf" position={isMobile ? [0, 0.5, 0] : [-0.3, -0.2, 0]} fontSize={isMobile ? 0.1 : 0.25} color="#36454F" anchorX={align} anchorY="bottom" fontWeight={600}>Hi, I am</Text>
      <Text font="/font.ttf" position={isMobile ? [0, 0.3, 0] : [-0.4, -0.5, 0]} fontSize={isMobile ? 0.225 : 0.7} color="#1e293b" anchorX={align} anchorY="middle" letterSpacing={-0.05} fontWeight={900} maxWidth={isMobile ? 0.220 : 8} textAlign={align} lineHeight={1}>ANSHVEER SINGH</Text>
      <Text font="/font.ttf" position={isMobile ? [0, 0.1, 0] : [-0.4, -0.8, 0]} fontSize={isMobile ? 0.09 : 0.18} color="#64748b" anchorX={align} anchorY="top" letterSpacing={0.05} fontWeight={600} maxWidth={isMobile ? 1 : 6} textAlign={align}>COMPUTER SCIENCE & ENGINEERING @VIT,Vellore</Text>
    </group>
  );
}

function CloudTag({ text, color, position, isMobile }) {
  const ref = useRef();
  const [hovered, setHover] = useState(false);

  const width = text.length * 0.12 + 0.4;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.lookAt(state.camera.position);
    const targetScale = hovered ? 1.2 : 1;
    ref.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
  });

  // COLOR LOGIC:
  // Mobile? Always colorful. 
  // Desktop? White by default, color on hover.
  const activeColor = isMobile ? color : (hovered ? color : "#ffffff");
  const textColor = isMobile ? "#ffffff" : (hovered ? "#ffffff" : "#0f172a");

  return (
    <group position={position} ref={ref}>
      <RoundedBox args={[width * 3.5, 1, 0.05]} radius={0.2} bevelSegments={2}>
        <meshPhysicalMaterial
          color={activeColor}
          transparent
          opacity={0.95}
          roughness={0.1}
          clearcoat={1}
        />
      </RoundedBox>

      <Text
        font="/font.ttf"
        position={[0, 0, 0.06]}
        fontSize={0.9}
        color={textColor}
        anchorX="center"
        anchorY="middle"
        fontWeight={700}
        onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
      >
        {text}
      </Text>
    </group>
  );
}

// --- 5. ZONES ---

function IntroZone() {
  const isMobile = useMobile();
  const layout = isMobile ? { photoPos: [0, 0.3, -2.5], photoScale: [2.35, 2.35], textPos: [0, -0.9, 0], textAlign: "center" }
    : { photoPos: [1.0, 0.37, -1.5], photoScale: [3.2, 3.2], textPos: [-2.5, -0.5, 0], textAlign: "left" };
  return (
    <group position={[0, 0.2, 0]}>
      <group position={layout.textPos}>
        <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}><IntroTextGroup isMobile={isMobile} align={layout.textAlign} /></Float>
      </group>
      <LenticularProfile position={layout.photoPos} scale={layout.photoScale} />
    </group>
  );
}

function TechZone() {
  const isMobile = useMobile();
  const zoneZ = -80;

  // ... (Keep your skills array and colors object exactly as they are) ...
  const skills = [
    { name: "Python", type: "lang" }, { name: "TypeScript", type: "lang" }, { name: "C++", type: "lang" }, { name: "Java", type: "lang" }, { name: "SQL", type: "lang" },
    { name: "Next.js 14", type: "frame" }, { name: "React", type: "frame" }, { name: "Node.js", type: "frame" }, { name: "Tailwind", type: "frame" }, { name: "Prisma", type: "frame" },
    { name: "Supabase", type: "cloud" }, { name: "AWS EC2", type: "cloud" }, { name: "Vertex AI", type: "cloud" }, { name: "PostgreSQL", type: "cloud" }, { name: "Vercel", type: "cloud" },
    { name: "Git", type: "tool" }, { name: "Docker", type: "tool" }, { name: "REST APIs", type: "tool" }, { name: "Leadership", type: "soft" }, { name: "Adaptability", type: "soft" }
  ];

  const colors = { lang: "#3b82f6", frame: "#a855f7", cloud: "#10b981", tool: "#f97316", soft: "#ec4899" };

  const cloudData = useMemo(() => {
    const phi = Math.PI * (3 - Math.sqrt(5));
    const n = skills.length;

    // SPREAD FIX: Significantly larger radius
    const radius = isMobile ? 5.5 : 7.5;
    // VERTICAL STRETCH: Multiplier to make it a tall cylinder instead of a ball
    const verticalStretch = isMobile ? 1.6 : 1.2;

    return skills.map((skill, i) => {
      const y = 1 - (i / (n - 1)) * 2;
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY * radius;
      // Stretch the Y axis to separate rows
      const finalY = y * radius * verticalStretch;
      const z = Math.sin(theta) * radiusAtY * radius;

      return { ...skill, pos: [x, finalY, z] };
    });
  }, [isMobile]);

  const groupRef = useRef();
  useFrame((state) => { if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.05; });

  return (
    <group position={[0, 0, zoneZ]}>
      <Text
        font="/font.ttf"
        text="TECHNICAL ARSENAL"
        position={[0, isMobile ? 10 : 6.5, 0]} /* Moved Title Up */
        fontSize={0.6}
        color="#334155"
        fontWeight={900}
        anchorX="center"
        textAlign="center"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        TECHNICAL ARSENAL
      </Text>

      <group ref={groupRef} position={[0, -1, 0]}>
        {cloudData.map((item, i) => (
          <CloudTag
            key={i}
            text={item.name}
            color={colors[item.type]}
            position={item.pos}
            isMobile={isMobile} /* Pass this prop down */
          />
        ))}
      </group>
    </group>
  );
}

function ProjectsZone() {
  const isMobile = useMobile();
  const zoneZ = -130;
  const ProjectCard = ({ title, subTitle, tech, url, imgUrl, position, scale, color }) => {
    const [hovered, setHover] = useState(false);
    const meshRef = useRef();

    useFrame((state) => {
      if (!meshRef.current) return;
      const targetScale = hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // BOOSTED TILT: Increased multiplier from 0.1 to 0.3 for visible 3D movement
      meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, (state.mouse.y * 0.3), 0.1);
      meshRef.current.rotation.y = THREE.MathUtils.lerp(meshRef.current.rotation.y, (state.mouse.x * 0.3), 0.1);
    });
    return (
      <group position={position}>
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
          <group
            ref={meshRef}
            onPointerOver={() => { setHover(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { setHover(false); document.body.style.cursor = 'auto'; }}
            onClick={() => window.open(url, '_blank')}
          >
            {/* --- NEW: THE GLASS CARD BACKGROUND --- */}
            {/* This creates a semi-transparent pane behind the text so it's always readable */}
            <mesh position={[0, 0, -0.05]}>
              <planeGeometry args={[scale[0] || 4, scale[1] || 2.5]} />
              <meshPhysicalMaterial
                color="#ffffff"
                transparent
                opacity={0.8}     /* High opacity to block the messy background lines */
                transmission={0.5} /* Glass effect */
                roughness={0}
                thickness={1}
              />
            </mesh>

            {/* BORDER for the card */}
            <mesh position={[0, 0, -0.06]}>
              <planeGeometry args={[(scale[0] || 4) + 0.1, (scale[1] || 2.5) + 0.1]} />
              <meshBasicMaterial color={hovered ? color : "#cbd5e1"} />
            </mesh>

            {/* IMAGE: Now sits cleanly on top of the glass */}
            {imgUrl && (
              <group position={[0, 1.0, 0.1]}>
                <DreiImage url={imgUrl} scale={[scale[0] * 0.8, scale[1] * 0.8]} transparent />
              </group>
            )}

            {/* TEXT: Added outlineWidth to make it pop even more */}
            <Text
              font="/font.ttf"
              position={[0, imgUrl ? -0.3 : 0.4, 0.1]}
              fontSize={isMobile ? 0.25 : 0.35}
              color={hovered ? color : "#1e293b"}
              fontWeight={800}
              anchorX="center"
              maxWidth={isMobile ? 2.5 : 3.8}
              textAlign="center"
              outlineWidth={0.01}
              outlineColor="#ffffff"
            >
              {title}
            </Text>

            <Text font="/font.ttf" position={[0, imgUrl ? -0.7 : 0, 0.1]} fontSize={isMobile ? 0.15 : 0.18} color="#475569" fontWeight={600} anchorX="center">
              {subTitle}
            </Text>

            <Text font="/font.ttf" position={[0, imgUrl ? -1.0 : -0.3, 0.1]} fontSize={0.14} color={color} fontWeight={700} anchorX="center" letterSpacing={0.05}>
              {tech}
            </Text>
          </group>
        </Float>
      </group>
    );
  };
  return (
    <group position={[0, 0, zoneZ]}>
      <Text font="/font.ttf" position={[0, isMobile ? 5.5 : 4, 0]} fontSize={isMobile ? 0.45 : 0.6} color="#334155" fontWeight={900} anchorX="center">ENGINEERING PROJECTS</Text>
      <ProjectCard title="MENTAL HEALTH" subTitle="Diagnostic Classifier" tech="MACHINE LEARNING | FLASK" url="https://github.com/AnshveerSinghVIT/Mental_Health_Prediction_ML_Project" color="#7c3aed" position={[0, isMobile ? 3.0 : 2, 0]} scale={[0, 0]} />
      <ProjectCard title="REALPRO NEXUS" subTitle="E-commerce" tech="NEXT.JS | SUPABASE" url="https://lemon-iota.vercel.app" imgUrl="/lemon.png" color="#eab308" position={isMobile ? [0, -0.5, 0] : [-4, -2, 0]} scale={isMobile ? [2.5, 1.4] : [3.5, 2]} />
      <ProjectCard title="VALL SOCIAL" subTitle="Campus Social" tech="REACT | MONGODB" url="https://vmedia.onrender.com/" imgUrl="/vall.png" color="#3b82f6" scale={isMobile ? [2.5, 1.4] : [3.5, 2]} position={isMobile ? [0, -4.5, 0] : [4, -2, 0]} />
    </group>
  );
}

function ExperienceZone() {
  const isMobile = useMobile();
  const zoneZ = -165;
  return (
    <group position={[0, 0, zoneZ]}>
      <Text font="/font.ttf" position={[0, isMobile ? 6.5 : 4.5, 0]} fontSize={isMobile ? 0.5 : 0.6} color="#334155" fontWeight={900} anchorX="center">EXPERIENCE</Text>
      <GlassPanel width={isMobile ? 3.8 : 10.5} height={isMobile ? 9.5 : 8.5} position={[0, 0, -0.1]} />

      {/* DELL EXPERIENCE */}
      <Float speed={1.2} rotationIntensity={0.05} floatIntensity={0.1}>
        <group position={isMobile ? [-0.01, 1.5, 0] : [0, 2.0, 0]}>
          <InteractiveImage url="/dell.jpg" position={isMobile ? [0, 1.5, 0] : [-2.5, 0, 0]} scale={isMobile ? [2.5, 1.5] : [3.5, 2.1]} />

          <group position={isMobile ? [1.2, -0.8, 0] : [1, -0.5, 0]}>
            <Text font="/font.ttf" position={isMobile?[-1.2, 1, 0.7]:[-1.2, 1, 0.7]} fontSize={isMobile ?0.4 : 0.6} color="#0672cb" fontWeight={800} anchorX={isMobile ? "center" : "left"} maxWidth={isMobile ? 3.5 : 5} textAlign={isMobile ? "center" : "left"}>Dell Technologies</Text>
            <Text font="/font.ttf" position={isMobile?[-1.2, 0.2, 0.5]:[-1.2, 0, 0.5]} fontSize={isMobile ? 0.16 : 0.2} color="#475569" fontWeight={600} anchorX={isMobile ? "center" : "left"} maxWidth={isMobile ? 3 : 5} textAlign={isMobile ? "center" : "left"}>Undergraduate Intern | Starts June 2025</Text>
            <Text font="/font.ttf" position={isMobile?[-1.2, -0.1, 0.5]:[-1.2, -0.4, 0.5]} fontSize={isMobile ? 0.14 : 0.2} color="#64748b" anchorX={isMobile ? "center" : "left"} maxWidth={isMobile ? 3.5 : 5} textAlign={isMobile ? "center" : "left"} lineHeight={1.4}>Secured from on-campus testing and interviews</Text>
          </group>
        </group>
      </Float>

      {/* SMARTBRIDGE EXPERIENCE */}
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <group position={isMobile ? [0, -2, 0] : [0, -1.8, 0]}>
          <Text font="/font.ttf" position={[0, 1.5, 0]} fontSize={isMobile ? 0.3 : 0.45} color="#0f172a" fontWeight={800} anchorX="center" maxWidth={isMobile ? 3.5 : 6} textAlign="center">Smartbridge in partnership with Google</Text>
          <Text font="/font.ttf" position={isMobile ? [0, 0.3, 0] : [0, 0.6, 0]} fontSize={0.2} color="#475569" fontWeight={600} maxWidth={isMobile ? 3.5 : 5} textAlign="center">Machine Learning Development | May - June 2025</Text>
          <Text font="/font.ttf" position={isMobile ? [0, -0.3, 0] : [0, -0.2, 0]} fontSize={isMobile ? 0.18 : 0.3} color="#64748b" maxWidth={isMobile ? 3.5 : 5} textAlign="center" lineHeight={1.4}>Developed Mental Health Prediction Models using Vertex AI</Text>
          <group position={isMobile ? [0, -1.2, 0] : [0, -1.5, 0]}>
            <BadgeLink text="View Internship Cert" url="https://skillwallet.smartinternz.com/internships/google_developers/d0e7b521c18b09876cb7693e42880dba" color="#2563eb" position={isMobile ? [0, 0.3, 0] : [-2, 0, 0]} />
            <BadgeLink text="Credly Badges" url="https://www.credly.com/users/anshveer-singh-23bce0703/badges#credly" color="#ca8a04" position={isMobile ? [0, -0.3, 0] : [0, 0, 0]} />
            <BadgeLink text="Google Skills" url="https://www.skills.google/public_profiles/a0bfdad5-777c-4017-8384-8199118381ff" color="#16a34a" position={isMobile ? [0, -0.0, 0] : [2, 0, 0]} />
          </group>
        </group>
      </Float>
    </group>
  );
}

function ContactZone() {
  const isMobile = useMobile();
  const zoneZ = -220;
  return (
    <group position={[0, 0, zoneZ]}>
      <group position={[0, 0, -2]}><ConfettiParticles count={150} /></group>
      <Text font="/font.ttf" position={[0, isMobile ? 5.5 : 4.5, 0]} fontSize={0.6} color="#334155" fontWeight={900} anchorX="center">GET IN TOUCH</Text>
      <Float speed={3} rotationIntensity={0.1} floatIntensity={0.5}>
        <Button3D text="DOWNLOAD RESUME" subtext="PDF Format" url="https://drive.google.com/file/d/17Pp8wXhmL6BGtctHEXfqwqHOK5MEcSo4/view" color="#ea580c" position={[0, isMobile ? 2.5 : 1.5, 0]} width={isMobile ? 3.5 : 4.2} />
      </Float>
      <group position={[0, -1.0, 0]}>
        {/* --- ROW 1: SOCIALS & EMAIL --- */}
        <Button3D
          text="LinkedIn"
          url="https://www.linkedin.com/in/anshveer-singh/"
          color="#0a66c2"
          // Desktop: Left | Mobile: Top
          position={isMobile ? [0, 1.5, 0] : [-3.8, 0.5, 0]}
          width={2.8}
        />

        <Button3D
          text="Email"
          url="mailto:singhanshveer73@gmail.com"
          color="#ef4444"
          // Desktop: Center | Mobile: 2nd
          position={isMobile ? [0, 0, 0] : [0, 0.5, 0]}
          width={2.8}
        />

        <Button3D
          text="Github"
          url="https://github.com/AnshveerSinghVIT/"
          color="#171515" /* GitHub Black */
          // Desktop: Right | Mobile: 3rd
          position={isMobile ? [0, -1.5, 0] : [3.8, 0.5, 0]}
          width={2.8}
        />

        {/* --- ROW 2: PERSONAL INFO --- */}
        <Button3D
          text="Phone"
          url="tel:+917795478003"
          color="#22c55e"
          // Desktop: Bottom Left-ish | Mobile: 4th
          position={isMobile ? [0, -3.0, 0] : [-2.0, -1.2, 0]}
          width={2.8}
        />

        <Button3D
          text="Bengaluru"
          subtext="Location"
          color="#db2777"
          url="https://www.google.com/maps/place/Bengaluru,+Karnataka"
          // Desktop: Bottom Right-ish | Mobile: Bottom
          position={isMobile ? [0, -4.5, 0] : [2.0, -1.2, 0]}
          width={2.8}
        />
      </group>
      <Float speed={2} rotationIntensity={0.1}>
        <Text font="/font.ttf" position={[0, isMobile ? -5.5 : -4.5, 0]} fontSize={0.4} color="#3b82f6" fontWeight={800} anchorX="center">Thank You!</Text>
        <Text font="/font.ttf" position={[0, isMobile ? -6.0 : -5.0, 0]} fontSize={0.12} color="#cbd5e1" anchorX="center">(C) 2025 Anshveer Singh</Text>
      </Float>
    </group>
  );
}

function AIController() {
  const scroll = useScroll();

  useEffect(() => {
    // Expose the scroll engine to the bot
    window.aiNavigate = (targetOffset) => {
      if (scroll && scroll.el) {
        // scroll.el.scrollHeight is the total scrollable content
        // scroll.el.clientHeight is the visible window size
        // Max scrollable distance = scrollHeight - clientHeight
        const maxScroll = scroll.el.scrollHeight - scroll.el.clientHeight;
        scroll.el.scrollTo({
          top: maxScroll * targetOffset,
          behavior: 'auto'
        });
      }
    };

    // Cleanup
    return () => { delete window.aiNavigate; };
  }, [scroll]);

  return null;
}

function Scene() {
  const scroll = useScroll();
  useFrame((state) => {
    state.camera.position.z = 5 - (scroll.offset * 215);
    const debugNode = document.getElementById('debug-offset');
    if (debugNode) {
      debugNode.innerText = `Scroll Offset: ${scroll.offset.toFixed(3)}`;
    }
  });
  return (
    <group>
      <IntroZone />
      <TechZone />
      <ProjectsZone />
      <ExperienceZone />
      <ContactZone />
    </group>
  );
}

// This component reads the R3F scroll and updates the HTML background
function BackgroundSync() {
  const scroll = useScroll();
  useFrame(() => {
    // If the background component is ready, send the scroll data (0 to 1)
    if (window.updateHandScroll) {
      window.updateHandScroll(scroll.offset);
    }
  });
  return null;
}

export default function Experience() {
  return (
    // CHANGE: Removed 'bg-[#f8fafc]' to make container transparent
    <div className="h-screen w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 40 }} gl={{ antialias: true }} shadows>
        <Suspense fallback={null}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[5, 10, 5]} intensity={2} castShadow color="#ffffff" />
          <directionalLight position={[-5, 5, 5]} intensity={1} color="#bfdbfe" />
          <ContactShadows opacity={0.2} scale={30} blur={2} far={4} color="#94a3b8" />

          <ScrollControls pages={11} damping={0.3}>
            <BackgroundSync />
            <SkipButton />
            <DarkWarpParticles count={1000} />
            <WarpStars />
            <Scene />
            <AIController />
          </ScrollControls>
        </Suspense>
      </Canvas>
      <Loader 
        containerStyles={{ background: '#f8fafc' }}
        innerStyles={{ width: '300px' }}
        barStyles={{ background: '#0ea5e9', height: '4px' }}
        dataInterpolation={(p) => `Loading Anshveer's Portfolio... ${p.toFixed(0)}%`}
      />
      <div className="fixed bottom-6 left-0 w-full text-center z-50 pointer-events-none">
        <p className="text-[10px] text-slate-400 font-bold tracking-[0.3em] animate-pulse">SCROLL TO FLY</p>
      </div>
    </div>
  );
}
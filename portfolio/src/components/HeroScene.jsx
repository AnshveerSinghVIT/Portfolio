'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { MeshTransmissionMaterial, Environment, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

// This component makes the camera follow the mouse slightly for that "parallax" feel
function Rig() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();
  
  useFrame(() => {
    // Smoothly interpolate camera position based on mouse coordinates
    camera.position.lerp(vec.set(mouse.x * 2, mouse.y * 2, camera.position.z), 0.05);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function GlassShape({ position, scale, rotationSpeed, geometryType }) {
  const mesh = useRef();
  
  useFrame((state, delta) => {
    if (mesh.current) {
      mesh.current.rotation.x += delta * rotationSpeed;
      mesh.current.rotation.y += delta * rotationSpeed;
      mesh.current.rotation.z += delta * rotationSpeed;
    }
  });

  return (
    <Float speed={2} rotationIntensity={2} floatIntensity={2}>
      <mesh ref={mesh} position={position} scale={scale}>
        {geometryType === 'torus' && <torusKnotGeometry args={[1, 0.3, 128, 32]} />}
        {geometryType === 'ico' && <icosahedronGeometry args={[1, 0]} />}
        {geometryType === 'capsule' && <capsuleGeometry args={[0.5, 1, 4, 8]} />}
        
        <MeshTransmissionMaterial 
            backside={false}
            samples={16} 
            resolution={1024} 
            thickness={1} 
            roughness={0.1} 
            anisotropy={1} 
            chromaticAberration={0.5} // High rainbow effect
            distortion={0.5}          // Makes it look like liquid
            distortionScale={0.5}
            temporalDistortion={0.2}
            color="#ffffff" 
            bg="#ffffff"
        />
      </mesh>
    </Float>
  );
}

export default function HeroScene() {
  return (
    // FIXED: Full screen container behind content
    <div className="fixed top-0 left-0 w-full h-full -z-10 bg-[#f0f0f0]">
      <Canvas camera={{ position: [0, 0, 15], fov: 35 }}>
        <ambientLight intensity={2} />
        <spotLight position={[20, 20, 10]} angle={0.15} penumbra={1} intensity={2} color="white" />
        <pointLight position={[-10, -10, -10]} intensity={2} color="#purple" />
        
        {/* A cluster of shapes */}
        <group>
            {/* Centerpiece */}
            <GlassShape position={[0, 0, 0]} scale={2.5} rotationSpeed={0.2} geometryType="torus" />
            
            {/* Satellites */}
            <GlassShape position={[-4, 3, -2]} scale={1} rotationSpeed={0.1} geometryType="ico" />
            <GlassShape position={[4, -3, -5]} scale={1.5} rotationSpeed={0.3} geometryType="capsule" />
            <GlassShape position={[-5, -2, 2]} scale={0.8} rotationSpeed={0.15} geometryType="ico" />
        </group>

        <Rig />
        <Environment preset="warehouse" /> 
      </Canvas>
    </div>
  );
}
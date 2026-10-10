'use client';

import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import { useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SkeletonUtils } from 'three-stdlib';

interface PropDef {
  path: string;
  pos: [number, number, number];
  rot?: [number, number, number];
  scale: number;
  castShadow?: boolean;
}

interface PedestrianDef {
  path: string;
  p1: [number, number, number];
  p2: [number, number, number];
  speed: number;
  scale: number;
}

const PropModel = React.memo(function PropModel({ path, pos, rot = [0, 0, 0], scale, castShadow = false }: PropDef) {
  const { scene } = useGLTF(path);
  return (
    <group position={pos} rotation={rot}>
      <Clone object={scene} scale={[scale, scale, scale]} castShadow={castShadow} receiveShadow />
    </group>
  );
});

const FootpathVisual = React.memo(function FootpathVisual({ p1, p2, width = 1.8 }: { p1: [number, number, number]; p2: [number, number, number]; width?: number }) {
  const { pos, rotY, length } = useMemo(() => {
    const dx = p2[0] - p1[0];
    const dz = p2[2] - p1[2];
    const len = Math.hypot(dx, dz) + 2.5;
    const angle = Math.atan2(dx, dz);
    return {
      pos: [(p1[0] + p2[0]) / 2, 0.045, (p1[2] + p2[2]) / 2] as [number, number, number],
      rotY: angle,
      length: len,
    };
  }, [p1, p2]);

  return (
    <group position={pos} rotation={[0, rotY, 0]}>
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[width + 0.35, 0.04, length]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[width, 0.05, length]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.042, 0]}>
        <boxGeometry args={[0.06, 0.004, length]} />
        <meshBasicMaterial color="#e2e8f0" opacity={0.7} transparent />
      </mesh>
    </group>
  );
});

const WalkingPedestrian = React.memo(function WalkingPedestrian({ path, p1, p2, speed, scale }: PedestrianDef) {
  const { scene, animations } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!clonedScene) return;

    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    const walkClip = animations.find((a) =>
      a.name.toLowerCase().includes('walk')
    ) || animations[0];

    if (walkClip) {
      const action = mixer.clipAction(walkClip);
      action.setEffectiveTimeScale(speed * 0.95);
      action.play();
    }

    return () => {
      mixer.stopAllAction();
    };
  }, [clonedScene, animations, speed]);

  const tRef = useRef(Math.random());
  const dirRef = useRef(1);

  useFrame((_, delta) => {
    const clampedDelta = Math.min(delta, 0.05);
    if (mixerRef.current) {
      mixerRef.current.update(clampedDelta);
    }

    if (!groupRef.current) return;
    const dist = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
    if (dist < 0.1) return;

    tRef.current += (speed / dist) * clampedDelta * dirRef.current;
    if (tRef.current >= 1) {
      tRef.current = 1;
      dirRef.current = -1;
    } else if (tRef.current <= 0) {
      tRef.current = 0;
      dirRef.current = 1;
    }

    const x = p1[0] + (p2[0] - p1[0]) * tRef.current;
    const z = p1[2] + (p2[2] - p1[2]) * tRef.current;

    const angle = dirRef.current > 0
      ? Math.atan2(p2[0] - p1[0], p2[2] - p1[2])
      : Math.atan2(p1[0] - p2[0], p1[2] - p2[2]);

    groupRef.current.position.set(x, 0.05, z);
    groupRef.current.rotation.y = angle;
  });

  return (
    <group ref={groupRef}>
      <primitive object={clonedScene} scale={[scale, scale, scale]} />
    </group>
  );
});

export function CityProps() {
  const electricityPoles: PropDef[] = useMemo(() => [
    { path: '/models/props/electricity-pole.glb', pos: [54, 0, -28], rot: [0, 1.5, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [76, 0, -30], rot: [0, 1.5, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [12, 0, 68], rot: [0, 0.25, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [48, 0, 86], rot: [0, 0.2, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [16, 0, -64], rot: [0, 1.5, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [18, 0, -84], rot: [0, 1.5, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [-72, 0, -40], rot: [0, 0.35, 0], scale: 16.0, castShadow: false },
    { path: '/models/props/electricity-pole.glb', pos: [-88, 0, -44], rot: [0, 0.35, 0], scale: 16.0, castShadow: false },
  ], []);

  const streetLamps: PropDef[] = useMemo(() => [
    { path: '/models/props/light-curved.glb', pos: [-13, 0, 6], rot: [0, -Math.PI / 4, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [8, 0, -6], rot: [0, Math.PI / 1.5, 0], scale: 8.5 },

    { path: '/models/props/light-curved.glb', pos: [-1, 0, -24], rot: [0, Math.PI / 2, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [25, 0, -28], rot: [0, Math.PI / 2, 0], scale: 8.5 },

    { path: '/models/props/light-curved.glb', pos: [38, 0, 14], rot: [0, -Math.PI / 2, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [36, 0, 36], rot: [0, -Math.PI / 2, 0], scale: 8.5 },

    { path: '/models/props/light-curved.glb', pos: [36, 0, 60], rot: [0, -Math.PI / 2, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [40, 0, 80], rot: [0, -Math.PI / 2, 0], scale: 8.5 },

    { path: '/models/props/light-curved.glb', pos: [-24, 0, 2], rot: [0, Math.PI, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [-42, 0, -8], rot: [0, Math.PI, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [-64, 0, -14], rot: [0, Math.PI, 0], scale: 8.5 },
  ], []);

  const highwaySigns: PropDef[] = useMemo(() => [
    { path: '/models/props/sign-highway.glb', pos: [35, 0, 34], rot: [0, -0.6, 0], scale: 7.5, castShadow: false },
    { path: '/models/props/sign-highway.glb', pos: [-32, 0, -2], rot: [0, -0.3, 0], scale: 7.5, castShadow: false },
    { path: '/models/props/sign-highway.glb', pos: [48, 0, -8], rot: [0, 0, 0], scale: 7.5, castShadow: false },
    { path: '/models/props/sign-highway.glb', pos: [38, 0, 72], rot: [0, -0.4, 0], scale: 7.5, castShadow: false },
  ], []);

  const safetyProps: PropDef[] = useMemo(() => [
    { path: '/models/props/construction-barrier.glb', pos: [-24, 0, 59], rot: [0, 0.3, 0], scale: 0.5 },
    { path: '/models/props/construction-barrier.glb', pos: [-32, 0, 59], rot: [0, -0.3, 0], scale: 0.5 },
    { path: '/models/props/construction-cone.glb', pos: [-23, 0, 60], rot: [0, 0, 0], scale: 0.35 },
    { path: '/models/props/construction-cone.glb', pos: [-25, 0, 60.5], rot: [0, 0, 0], scale: 0.35 },
    { path: '/models/props/construction-cone.glb', pos: [-27, 0, 60.8], rot: [0, 0, 0], scale: 0.35 },
  ], []);

  const streetFurniture: PropDef[] = useMemo(() => [
    { path: '/models/props/dumpster.glb', pos: [-46, 0, 32], rot: [0, 0.2, 0], scale: 4.2 },
    { path: '/models/props/dumpster.glb', pos: [-44, 0, -30], rot: [0, 1.2, 0], scale: 4.2 },
    { path: '/models/city/bus_stop.glb', pos: [18, 0, -24], rot: [0, Math.PI / 2, 0], scale: 0.10 },
    { path: '/models/city/bench.glb', pos: [16, 0, -22], rot: [0, Math.PI / 2, 0], scale: 0.50 },
    { path: '/models/city/billboard.glb', pos: [48, 0, -26], rot: [0, Math.PI / 2, 0], scale: 0.018 },
    { path: '/models/city/billboard.glb', pos: [14, 0, 72], rot: [0, -0.4, 0], scale: 0.018 },
    { path: '/models/city/fence.glb', pos: [-6, 0, -18], rot: [0, 0, 0], scale: 0.20 },
    { path: '/models/city/fence.glb', pos: [-2, 0, -18], rot: [0, 0, 0], scale: 0.20 },
  ], []);

  const walkingPedestrians: PedestrianDef[] = useMemo(() => [
    { path: '/models/characters/woman.glb', p1: [-2, 0, -22], p2: [-4, 0, -34], speed: 1.20, scale: 0.38 },
    { path: '/models/characters/worker.glb', p1: [-26, 0, 48], p2: [-26, 0, 60], speed: 1.15, scale: 1.0 },
    { path: '/models/characters/business_man.glb', p1: [48, 0, 24], p2: [48, 0, 38], speed: 1.25, scale: 1.0 },
    { path: '/models/characters/casual_character.glb', p1: [54, 0, -108], p2: [54, 0, -126], speed: 1.10, scale: 1.0 },
    { path: '/models/characters/worker.glb', p1: [-52, 0, -26], p2: [-58, 0, -34], speed: 1.20, scale: 1.0 },
    { path: '/models/characters/woman.glb', p1: [-66, 0, 224], p2: [-80, 0, 228], speed: 1.20, scale: 0.38 },
    { path: '/models/characters/man.glb', p1: [32, 0, 172], p2: [32, 0, 188], speed: 1.25, scale: 0.38 },
  ], []);

  return (
    <group name="CitySurroundingProps">
      <Suspense fallback={null}>
        {electricityPoles.map((p, i) => (
          <PropModel key={`pole-${i}`} {...p} />
        ))}

        {streetLamps.map((p, i) => (
          <PropModel key={`lamp-${i}`} {...p} />
        ))}

        {highwaySigns.map((p, i) => (
          <PropModel key={`sign-${i}`} {...p} />
        ))}

        {safetyProps.map((p, i) => (
          <PropModel key={`safety-${i}`} {...p} />
        ))}

        {streetFurniture.map((p, i) => (
          <PropModel key={`furn-${i}`} {...p} />
        ))}

        {walkingPedestrians.map((ped, i) => (
          <FootpathVisual key={`footpath-${i}`} p1={ped.p1} p2={ped.p2} />
        ))}

        {walkingPedestrians.map((ped, i) => (
          <WalkingPedestrian key={`walker-${i}`} {...ped} />
        ))}
      </Suspense>
    </group>
  );
}

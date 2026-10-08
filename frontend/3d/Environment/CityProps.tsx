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

function PropModel({ path, pos, rot = [0, 0, 0], scale, castShadow = false }: PropDef) {
  const { scene } = useGLTF(path);
  return (
    <group position={pos} rotation={rot}>
      <Clone object={scene} scale={[scale, scale, scale]} castShadow={castShadow} receiveShadow />
    </group>
  );
}

/**
 * Procedural Dedicated Pedestrian Footpath / Pavement Mesh
 * Renders a crisp raised sidewalk with curbs along the pedestrian walkway
 */
function FootpathVisual({ p1, p2, width = 1.8 }: { p1: [number, number, number]; p2: [number, number, number]; width?: number }) {
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
      {/* Dark Slate Curb Foundation */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[width + 0.35, 0.04, length]} />
        <meshStandardMaterial color="#475569" roughness={0.8} />
      </mesh>
      {/* Light Paver Walkway Surface */}
      <mesh position={[0, 0.015, 0]} receiveShadow>
        <boxGeometry args={[width, 0.05, length]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.75} />
      </mesh>
      {/* Tactile Paving Center Guideline */}
      <mesh position={[0, 0.042, 0]}>
        <boxGeometry args={[0.06, 0.004, length]} />
        <meshBasicMaterial color="#e2e8f0" opacity={0.7} transparent />
      </mesh>
    </group>
  );
}

/**
 * 3D Human Pedestrian with Authentic Skeletal Walk Animation
 * Cloned via SkeletonUtils so bones animate independently, playing embedded walk cycle
 */
function WalkingPedestrian({ path, p1, p2, speed, scale }: PedestrianDef) {
  const { scene, animations } = useGLTF(path);
  const groupRef = useRef<THREE.Group>(null);
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  useEffect(() => {
    if (!clonedScene) return;

    // Enable shadows on all child meshes
    clonedScene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // Create independent AnimationMixer on the cloned skeleton
    const mixer = new THREE.AnimationMixer(clonedScene);
    mixerRef.current = mixer;

    // Find skeletal walking animation clip
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
    // 1. Advance skeletal animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

    // 2. Advance pedestrian along footpath
    if (!groupRef.current) return;
    const dist = Math.hypot(p2[0] - p1[0], p2[2] - p1[2]);
    if (dist < 0.1) return;

    tRef.current += (speed / dist) * delta * dirRef.current;
    if (tRef.current >= 1) {
      tRef.current = 1;
      dirRef.current = -1;
    } else if (tRef.current <= 0) {
      tRef.current = 0;
      dirRef.current = 1;
    }

    const x = p1[0] + (p2[0] - p1[0]) * tRef.current;
    const z = p1[2] + (p2[2] - p1[2]) * tRef.current;

    // Face forward along walking direction
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
}

export function CityProps() {
  // 1. High-Voltage Transmission Poles — Along outer regional transmission corridors (Clear of all roads)
  const electricityPoles: PropDef[] = useMemo(() => [
    // Manor link corridor (East)
    { path: '/models/props/electricity-pole.glb', pos: [54, 0, -28], rot: [0, 1.5, 0], scale: 16.0, castShadow: true },
    { path: '/models/props/electricity-pole.glb', pos: [76, 0, -30], rot: [0, 1.5, 0], scale: 16.0, castShadow: true },
    // Palghar district corridor (South)
    { path: '/models/props/electricity-pole.glb', pos: [12, 0, 68], rot: [0, 0.25, 0], scale: 16.0, castShadow: true },
    { path: '/models/props/electricity-pole.glb', pos: [48, 0, 86], rot: [0, 0.2, 0], scale: 16.0, castShadow: true },
    // Dahanu corridor (North)
    { path: '/models/props/electricity-pole.glb', pos: [16, 0, -64], rot: [0, 1.5, 0], scale: 16.0, castShadow: true },
    { path: '/models/props/electricity-pole.glb', pos: [18, 0, -84], rot: [0, 1.5, 0], scale: 16.0, castShadow: true },
    // Tarapur Coastal corridor (West)
    { path: '/models/props/electricity-pole.glb', pos: [-72, 0, -40], rot: [0, 0.35, 0], scale: 16.0, castShadow: true },
    { path: '/models/props/electricity-pole.glb', pos: [-88, 0, -44], rot: [0, 0.35, 0], scale: 16.0, castShadow: true },
  ], []);

  // 2. Modern Curved Street Lamps — Along roadside sidewalk verges (Guaranteed off road asphalt)
  const streetLamps: PropDef[] = useMemo(() => [
    // Roundabout outer perimeter verge
    { path: '/models/props/light-curved.glb', pos: [-13, 0, 6], rot: [0, -Math.PI / 4, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [8, 0, -6], rot: [0, Math.PI / 1.5, 0], scale: 8.5 },

    // Boisar Avenue & Market Sidewalk Verges
    { path: '/models/props/light-curved.glb', pos: [-1, 0, -24], rot: [0, Math.PI / 2, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [25, 0, -28], rot: [0, Math.PI / 2, 0], scale: 8.5 },

    // Betegaon Residential Avenues
    { path: '/models/props/light-curved.glb', pos: [38, 0, 14], rot: [0, -Math.PI / 2, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [36, 0, 36], rot: [0, -Math.PI / 2, 0], scale: 8.5 },

    // Palghar Highway South Corridor
    { path: '/models/props/light-curved.glb', pos: [36, 0, 60], rot: [0, -Math.PI / 2, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [40, 0, 80], rot: [0, -Math.PI / 2, 0], scale: 8.5 },

    // Navapur Highway Verge
    { path: '/models/props/light-curved.glb', pos: [-24, 0, 2], rot: [0, Math.PI, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [-42, 0, -8], rot: [0, Math.PI, 0], scale: 8.5 },
    { path: '/models/props/light-curved.glb', pos: [-64, 0, -14], rot: [0, Math.PI, 0], scale: 8.5 },
  ], []);

  // 3. Traffic Signals at Junction Corners (Positioned on Sidewalk Verges)
  const trafficLights: PropDef[] = useMemo(() => [
    { path: '/models/props/traffic-light.glb', pos: [-14, 0, 8], rot: [0, 0.4, 0], scale: 9.0 },
    { path: '/models/props/traffic-light.glb', pos: [2, 0, 18], rot: [0, -1.8, 0], scale: 9.0 },
    { path: '/models/props/traffic-light.glb', pos: [20, 0, 26], rot: [0, -0.8, 0], scale: 9.0 },
    { path: '/models/props/traffic-light.glb', pos: [34, 0, -46], rot: [0, -0.4, 0], scale: 9.0 },
  ], []);

  // 4. Highway Overhead Gantry Signs Across Key Interchanges (Roadside Shoulders)
  const highwaySigns: PropDef[] = useMemo(() => [
    { path: '/models/props/sign-highway.glb', pos: [35, 0, 34], rot: [0, -0.6, 0], scale: 7.5, castShadow: true },
    { path: '/models/props/sign-highway.glb', pos: [-32, 0, -2], rot: [0, -0.3, 0], scale: 7.5, castShadow: true },
    { path: '/models/props/sign-highway.glb', pos: [48, 0, -8], rot: [0, 0, 0], scale: 7.5, castShadow: true },
    { path: '/models/props/sign-highway.glb', pos: [38, 0, 72], rot: [0, -0.4, 0], scale: 7.5, castShadow: true },
  ], []);

  // 5. Road Safety & Work Zones (Bordering S03 Service Center work bay perimeter)
  const safetyProps: PropDef[] = useMemo(() => [
    { path: '/models/props/construction-barrier.glb', pos: [-24, 0, 59], rot: [0, 0.3, 0], scale: 0.5 },
    { path: '/models/props/construction-barrier.glb', pos: [-32, 0, 59], rot: [0, -0.3, 0], scale: 0.5 },
    { path: '/models/props/construction-cone.glb', pos: [-23, 0, 60], rot: [0, 0, 0], scale: 0.35 },
    { path: '/models/props/construction-cone.glb', pos: [-25, 0, 60.5], rot: [0, 0, 0], scale: 0.35 },
    { path: '/models/props/construction-cone.glb', pos: [-27, 0, 60.8], rot: [0, 0, 0], scale: 0.35 },
  ], []);

  // 6. Street Furniture: Clean Highway Billboards, Bus Stop, Benches (On Promenade & Verges)
  const streetFurniture: PropDef[] = useMemo(() => [
    { path: '/models/props/dumpster.glb', pos: [-46, 0, 32], rot: [0, 0.2, 0], scale: 4.2 },
    { path: '/models/props/dumpster.glb', pos: [-44, 0, -30], rot: [0, 1.2, 0], scale: 4.2 },
    // Bus stop & passenger bench along Boisar Town promenade
    { path: '/models/city/bus_stop.glb', pos: [18, 0, -24], rot: [0, Math.PI / 2, 0], scale: 0.10 },
    { path: '/models/city/bench.glb', pos: [16, 0, -22], rot: [0, Math.PI / 2, 0], scale: 0.50 },
    // Highway Billboards: Elevated roadside verges with clear sightlines
    { path: '/models/city/billboard.glb', pos: [48, 0, -26], rot: [0, Math.PI / 2, 0], scale: 0.018 },
    { path: '/models/city/billboard.glb', pos: [14, 0, 72], rot: [0, -0.4, 0], scale: 0.018 },
    // Pedestrian decorative boundary fences
    { path: '/models/city/fence.glb', pos: [-6, 0, -18], rot: [0, 0, 0], scale: 0.20 },
    { path: '/models/city/fence.glb', pos: [-2, 0, -18], rot: [0, 0, 0], scale: 0.20 },
  ], []);

  // 7. Dynamic Human Pedestrians Walking with Skeletal Animation on Dedicated Footpaths
  const walkingPedestrians: PedestrianDef[] = useMemo(() => [
    // 1. Citizen walking along Boisar Town Centre promenade footpath
    { path: '/models/characters/woman.glb', p1: [-2, 0, -22], p2: [-4, 0, -34], speed: 1.20, scale: 0.38 },
    // 2. Service Technician walking along S03 Workshop bay footpath
    { path: '/models/characters/worker.glb', p1: [-26, 0, 48], p2: [-26, 0, 60], speed: 1.15, scale: 1.0 },
    // 3. Business Driver walking along Betegaon residential avenue sidewalk
    { path: '/models/characters/business_man.glb', p1: [48, 0, 24], p2: [48, 0, 38], speed: 1.25, scale: 1.0 },
    // 4. Commuter walking along Hospital Healthcare campus footpath
    { path: '/models/characters/casual_character.glb', p1: [54, 0, -108], p2: [54, 0, -126], speed: 1.10, scale: 1.0 },
    // 5. Maintenance Engineer inspecting along Station B104 sidewalk
    { path: '/models/characters/worker.glb', p1: [-52, 0, -26], p2: [-58, 0, -34], speed: 1.20, scale: 1.0 },
    // 6. Coastal pedestrian walking along Shirgaon fort beach promenade
    { path: '/models/characters/woman.glb', p1: [-66, 0, 224], p2: [-80, 0, 228], speed: 1.20, scale: 0.38 },
    // 7. Executive walking along Palghar District Capital boulevard sidewalk
    { path: '/models/characters/man.glb', p1: [32, 0, 172], p2: [32, 0, 188], speed: 1.25, scale: 0.38 },
  ], []);

  return (
    <group name="CitySurroundingProps">
      <Suspense fallback={null}>
        {/* Electricity Utility Poles */}
        {electricityPoles.map((p, i) => (
          <PropModel key={`pole-${i}`} {...p} />
        ))}

        {/* Street Lamps */}
        {streetLamps.map((p, i) => (
          <PropModel key={`lamp-${i}`} {...p} />
        ))}

        {/* Traffic Signals */}
        {trafficLights.map((p, i) => (
          <PropModel key={`traffic-${i}`} {...p} />
        ))}

        {/* Overhead Highway Signs */}
        {highwaySigns.map((p, i) => (
          <PropModel key={`sign-${i}`} {...p} />
        ))}

        {/* Safety Barriers & Traffic Cones */}
        {safetyProps.map((p, i) => (
          <PropModel key={`safety-${i}`} {...p} />
        ))}

        {/* Urban Street Furniture & Elevated Highway Billboards */}
        {streetFurniture.map((p, i) => (
          <PropModel key={`furn-${i}`} {...p} />
        ))}

        {/* Visible Concrete & Paver Footpaths underneath each pedestrian walkway */}
        {walkingPedestrians.map((ped, i) => (
          <FootpathVisual key={`footpath-${i}`} p1={ped.p1} p2={ped.p2} />
        ))}

        {/* Animated Human Pedestrians Walking with Skeletal Animations */}
        {walkingPedestrians.map((ped, i) => (
          <WalkingPedestrian key={`walker-${i}`} {...ped} />
        ))}
      </Suspense>
    </group>
  );
}

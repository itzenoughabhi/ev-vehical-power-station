'use client';

import React, { useRef, useMemo, Suspense, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, useGLTF, Clone, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle } from '../../types';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

interface ModelSpec {
  path: string;
  scale: number;
  rotY: number;
  groundY: number;
}

/**
 * Deterministic, calibrated vehicle models accurately scaled to Boisar road dimensions:
 * Road width: 6.8-7.6m (each lane is ~3.5m).
 * Vehicle dimensions: Length ~3.4-4.0m, Width ~1.7-2.1m (fits comfortably inside a lane).
 */
const MODEL_SPECS: Record<string, ModelSpec> = {
  // Heavy Electric Hauler Truck (truck.glb): raw length 15.27m -> Length 9.9m, Width 1.6m
  'Heavy Electric Hauler': { path: '/models/vehicles/truck.glb', scale: 0.65, rotY: 0, groundY: 0.04 },
  'Electric Truck':        { path: '/models/vehicles/truck.glb', scale: 0.65, rotY: 0, groundY: 0.04 },

  // Electric Pickup Truck (pickup_truck.glb): raw length 5.18m -> Length 4.4m, Width 1.96m
  'Electric Pickup Truck': { path: '/models/vehicles/pickup_truck.glb', scale: 0.85, rotY: 0, groundY: 0.02 },
  'Pickup EV':             { path: '/models/vehicles/pickup_truck.glb', scale: 0.85, rotY: 0, groundY: 0.02 },

  // Commercial EV Van (van.glb): raw length 80.23 -> Length 3.85m, Width 2.10m
  'Commercial EV Van':     { path: '/models/vehicles/van.glb', scale: 0.048, rotY: 0, groundY: 0 },
  'FleetVan':              { path: '/models/vehicles/van.glb', scale: 0.048, rotY: 0, groundY: 0 },

  // Electric City Bus (bus.glb): raw length 157.46 -> Length 9.2m
  'Electric City Bus':     { path: '/models/vehicles/bus.glb', scale: 0.058, rotY: 0, groundY: 0.04 },

  // Tesla Model Y (model_y.glb): raw length 3.28m -> Length 4.1m
  'Tesla Model Y':         { path: '/models/vehicles/model_y.glb', scale: 1.25, rotY: Math.PI / 2, groundY: 0.02 },

  // Porsche Taycan (taycan.glb): raw length 0.0497m -> Length 4.4m, Width 1.89m
  'Porsche Taycan':        { path: '/models/vehicles/taycan.glb', scale: 88.5, rotY: 0, groundY: 0.02 },

  // Mercedes EQS (mercedes_benz_vision_eqs.glb): raw length 6.34m -> Length 4.56m, Width 1.74m
  'Mercedes EQS':          { path: '/models/vehicles/mercedes_benz_vision_eqs.glb', scale: 0.72, rotY: 0, groundY: 0.02 },

  // Lucid Air EV (lucid.glb): raw length 5.01 -> Length 4.2m
  'Lucid Air EV':          { path: '/models/vehicles/lucid.glb', scale: 0.84, rotY: 0, groundY: 0.02 },

  // Highway Patrol Police EV (police_car.glb): raw length 3.73 -> Length 3.8m
  'Highway Patrol EV':     { path: '/models/vehicles/police_car.glb', scale: 1.02, rotY: 0, groundY: 0.02 },

  // Tata Nexon EV (suv.glb): raw length 4.21 -> Length 3.58m, Width 1.79m
  'Tata Nexon EV':         { path: '/models/vehicles/suv.glb', scale: 0.85, rotY: 0, groundY: 0.02 },
  'Apex SUV':              { path: '/models/vehicles/suv.glb', scale: 0.85, rotY: 0, groundY: 0.02 },
  'BYD Atto 3':            { path: '/models/vehicles/suv.glb', scale: 0.85, rotY: 0, groundY: 0.02 },

  // Mahindra XUV400 (car_sedan.glb): raw length 3.31 -> Length 3.48m, Width 2.10m
  'Mahindra XUV400':       { path: '/models/vehicles/car_sedan.glb', scale: 1.05, rotY: 0, groundY: 0.03 },

  // MG ZS EV (car_model.glb): raw length 489.44 -> Length 3.67m, Width 1.72m
  'MG ZS EV':              { path: '/models/vehicles/car_model.glb', scale: 0.0075, rotY: 0, groundY: 0 },

  // Tata Tiago EV (car.glb): raw length 89.11 -> Length 3.38m, Width 1.73m
  'Tata Tiago EV':         { path: '/models/vehicles/car.glb', scale: 0.038, rotY: 0, groundY: 0 },

  // Hyundai Ioniq 5 & Kia EV6 (sports_car.glb): raw length 3.93 -> Length 3.61m, Width 1.84m
  'Hyundai Ioniq 5':       { path: '/models/vehicles/sports_car.glb', scale: 0.92, rotY: 0, groundY: 0.02 },
  'HyperCoupe':            { path: '/models/vehicles/sports_car.glb', scale: 0.92, rotY: 0, groundY: 0.02 },
  'Kia EV6':               { path: '/models/vehicles/sports_car.glb', scale: 0.92, rotY: 0, groundY: 0.02 },

  // CyberSedan (cybertruck.glb): raw length 3.28m -> Length 4.1m
  'CyberSedan':            { path: '/models/vehicles/cybertruck.glb', scale: 1.25, rotY: Math.PI / 2, groundY: 0.01 },
};

function VehicleGLBModel({ model }: { model: string }) {
  const spec = MODEL_SPECS[model] || MODEL_SPECS['Tata Nexon EV'];
  const { scene } = useGLTF(spec.path);

  useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.geometry && !child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }
    });
  }, [scene]);

  return (
    <group position={[0, spec.groundY, 0]} rotation={[0, spec.rotY, 0]}>
      <Clone
        object={scene}
        scale={[spec.scale, spec.scale, spec.scale]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

function FallbackProceduralCar({ isSelected, hasFault }: { isSelected: boolean; hasFault: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Chassis Body */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.58, 3.5]} />
        <meshStandardMaterial
          color={hasFault ? '#dc2626' : isSelected ? '#2563eb' : '#38bdf8'}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      {/* Cabin Roof & Windows */}
      <mesh position={[0, 0.85, -0.1]} castShadow>
        <boxGeometry args={[1.4, 0.48, 1.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
      {/* Front Headlights */}
      <mesh position={[0.55, 0.42, 1.76]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[-0.55, 0.42, 1.76]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      {/* Rear Taillights */}
      <mesh position={[0.55, 0.42, -1.76]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.55, 0.42, -1.76]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      {/* 4 Rubber Wheels */}
      {[-0.86, 0.86].map((wx, wi) =>
        [-1.05, 1.05].map((wz, zi) => (
          <mesh key={`w-${wi}-${zi}`} position={[wx, 0.25, wz]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.25, 0.25, 0.2, 16]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>
        ))
      )}
    </group>
  );
}

const VehicleItem = React.memo(function VehicleItem({ vehicle }: { vehicle: Vehicle }) {
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isSelected = selectedObject?.type === 'vehicle' && selectedObject.id === vehicle.id;
  const simSpeed = useDigitalTwinStore((s) => s.simulationSpeed);

  const groupRef = useRef<THREE.Group>(null);
  const isMoving = (vehicle.status === 'EN_ROUTE' || vehicle.status === 'DEPARTING') && vehicle.speed > 0;

  const targetRef = useRef({
    x: vehicle.position.x,
    y: vehicle.position.y && vehicle.position.y > 0.1 ? vehicle.position.y : 0.04,
    z: vehicle.position.z,
    heading: vehicle.heading || 0,
    speed: vehicle.speed || 0,
    isMoving,
  });

  useEffect(() => {
    targetRef.current.x = vehicle.position.x;
    targetRef.current.y = vehicle.position.y && vehicle.position.y > 0.1 ? vehicle.position.y : 0.04;
    targetRef.current.z = vehicle.position.z;
    targetRef.current.heading = vehicle.heading || 0;
    targetRef.current.speed = vehicle.speed || 0;
    targetRef.current.isMoving = (vehicle.status === 'EN_ROUTE' || vehicle.status === 'DEPARTING') && vehicle.speed > 0;
  }, [vehicle.position.x, vehicle.position.y, vehicle.position.z, vehicle.heading, vehicle.speed, vehicle.status]);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.position.set(vehicle.position.x, targetRef.current.y, vehicle.position.z);
      groupRef.current.rotation.y = vehicle.heading || 0;
    }
  }, []);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const clampedDelta = Math.min(delta, 0.05);
    const currentSimSpeed = simSpeed || 1.0;
    const target = targetRef.current;

    // Safety guard against NaN
    if (isNaN(groupRef.current.position.x) || isNaN(groupRef.current.position.z)) {
      groupRef.current.position.x = target.x || 20.6;
      groupRef.current.position.z = target.z || 29.1;
      groupRef.current.position.y = target.y || 0.04;
      groupRef.current.rotation.y = target.heading || 0;
    }

    // --- CONTINUOUS SILKY-SMOOTH 60 FPS MOTION (NO STUTTER OR RESET JUMPS) ---
    if (target.isMoving) {
      const speedMps = ((target.speed || 36) / 3.6) * 0.42 * currentSimSpeed;
      const fHeading = target.heading;
      const fVx = Math.sin(fHeading) * speedMps;
      const fVz = Math.cos(fHeading) * speedMps;

      // 1. Continuous 60fps forward roll along heading
      groupRef.current.position.x += fVx * clampedDelta;
      groupRef.current.position.z += fVz * clampedDelta;

      // 2. Soft proportional damping towards server position (eliminates jitter and snapping)
      const errX = target.x - groupRef.current.position.x;
      const errZ = target.z - groupRef.current.position.z;
      const distSq = errX * errX + errZ * errZ;

      if (distSq > 100) {
        groupRef.current.position.x = target.x;
        groupRef.current.position.z = target.z;
      } else {
        const corrFactor = 1 - Math.exp(-6.0 * currentSimSpeed * clampedDelta);
        groupRef.current.position.x += errX * corrFactor;
        groupRef.current.position.z += errZ * corrFactor;
      }

      // Smooth elevation handling for highway bridges
      groupRef.current.position.y += (target.y - groupRef.current.position.y) * (1 - Math.exp(-6.0 * clampedDelta));
    } else {
      // Stationary / Parked: smoothly damp into charger bay / queue slot / repair bay
      groupRef.current.position.x = THREE.MathUtils.damp(groupRef.current.position.x, target.x, 8, clampedDelta);
      groupRef.current.position.z = THREE.MathUtils.damp(groupRef.current.position.z, target.z, 8, clampedDelta);
      groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, target.y, 8, clampedDelta);
    }

    // Smooth continuous heading rotation (no instant snapping on turns)
    let diff = target.heading - groupRef.current.rotation.y;
    diff = THREE.MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;
    groupRef.current.rotation.y += diff * (1 - Math.exp(-9.0 * clampedDelta));
  });

  const isCharging = vehicle.status === 'CHARGING';
  const hasFault = vehicle.status === 'FAULT' || vehicle.status === 'SERVICE_REQUIRED' || vehicle.vehicleHealth === 'CRITICAL';
  const isUnderRepair = vehicle.status === 'UNDER_REPAIR';
  const isQueue = vehicle.status === 'QUEUE';

  const routePoints = useMemo(() => {
    if (
      !isSelected ||
      isCharging ||
      isQueue ||
      isUnderRepair ||
      vehicle.status === 'ARRIVING' ||
      !vehicle.routeWaypoints ||
      vehicle.routeWaypoints.length < 2
    ) {
      return null;
    }
    const curX = groupRef.current ? groupRef.current.position.x : vehicle.position.x;
    const curZ = groupRef.current ? groupRef.current.position.z : vehicle.position.z;
    const pts: [number, number, number][] = [
      [curX, 0.12, curZ],
    ];
    for (let i = vehicle.currentWaypointIndex; i < vehicle.routeWaypoints.length; i++) {
      const wp = vehicle.routeWaypoints[i];
      pts.push([wp.x, 0.12, wp.z]);
    }
    return pts;
  }, [isSelected, isCharging, isQueue, isUnderRepair, vehicle.status, vehicle.position, vehicle.routeWaypoints, vehicle.currentWaypointIndex]);

  const getStatusIcon = () => {
    if (hasFault) return '🚨';
    if (isUnderRepair) return '🔧';
    if (isCharging) return '⚡';
    if (isQueue) return '⏳';
    return '🚗';
  };

  return (
    <>
      {/* Route Spline Line (shown when selected) */}
      {routePoints && routePoints.length > 1 && (
        <Line
          points={routePoints}
          color={hasFault ? '#ef4444' : '#2563eb'}
          lineWidth={2.8}
          transparent
          opacity={0.85}
        />
      )}

      <group
        ref={groupRef}
        onClick={(e) => {
          e.stopPropagation();
          selectVehicle(vehicle.id);
        }}
      >
        <Suspense fallback={<FallbackProceduralCar isSelected={isSelected} hasFault={hasFault} />}>
          <VehicleGLBModel model={vehicle.model} />
        </Suspense>

        {/* Neon Emerald EV Underglow matching glowing vehicle in demo image */}
        {vehicle.speed > 0 && !hasFault && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[2.2, 3.8]} />
            <meshBasicMaterial
              color="#10b981"
              transparent
              opacity={0.4}
            />
          </mesh>
        )}

        {/* Selection / Alert Ring sized accurately to vehicle footprint */}
        {isSelected && (
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.35, 1.5, 32]} />
            <meshBasicMaterial
              color={hasFault ? '#ef4444' : '#2563eb'}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}

        {/* Floating Pin / Tag Badge with Live Telemetry */}
        {(isSelected || vehicle.status === 'LOW_BATTERY' || vehicle.status === 'CHARGING') && (
          <Html position={[0, 1.85, 0]} center distanceFactor={26} zIndexRange={[100, 0]}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                selectVehicle(vehicle.id);
              }}
              className={`cursor-pointer px-2.5 py-0.5 rounded-full border transition-all select-none text-[10px] font-medium flex items-center gap-1 shadow-md ${
                hasFault
                  ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-300 animate-pulse'
                  : isUnderRepair
                  ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-300'
                  : isSelected
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300'
                  : 'bg-slate-900/90 text-white border-slate-700 hover:border-blue-400'
              }`}
              style={{ whiteSpace: 'nowrap' }}
            >
              <span>{getStatusIcon()}</span>
              <span className="font-semibold">{vehicle.code}</span>
              <span className="text-[9px] font-mono text-emerald-400">
                {Math.round(vehicle.currentBatteryPct)}%
              </span>
            </div>
          </Html>
        )}
      </group>
    </>
  );
});

export function VehicleFleet() {
  const vehicles = useDigitalTwinStore((s) => s.vehicles);

  return (
    <group name="VehicleFleet">
      {vehicles.map((vehicle) => (
        <VehicleItem key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}

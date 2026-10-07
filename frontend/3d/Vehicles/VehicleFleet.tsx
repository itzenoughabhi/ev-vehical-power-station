'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, useGLTF, Clone, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Vehicle } from '../../types';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

function VehicleGLBModel({ model }: { model: string }) {
  const { path, scale, rotY } = useMemo(() => {
    switch (model) {
      case 'Commercial EV Van':
      case 'FleetVan':
        return { path: '/models/vehicles/van.glb', scale: 0.04, rotY: 0 };
      case 'Tata Nexon EV':
      case 'Apex SUV':
        return { path: '/models/vehicles/suv.glb', scale: 0.72, rotY: 0 };
      case 'Mahindra XUV400':
        return { path: '/models/vehicles/car_sedan.glb', scale: 0.7, rotY: 0 };
      case 'MG ZS EV':
        return { path: '/models/vehicles/car_model.glb', scale: 0.72, rotY: 0 };
      case 'Tata Tiago EV':
        return { path: '/models/vehicles/car.glb', scale: 0.65, rotY: 0 };
      case 'Hyundai Ioniq 5':
      case 'HyperCoupe':
        return { path: '/models/vehicles/sports_car.glb', scale: 0.72, rotY: 0 };
      case 'CyberSedan':
      default:
        return { path: '/models/vehicles/cybertruck.glb', scale: 0.35, rotY: Math.PI / 2 };
    }
  }, [model]);

  const { scene } = useGLTF(path);

  return (
    <group position={[0, 0, 0]} rotation={[0, rotY, 0]}>
      <Clone
        object={scene}
        scale={[scale, scale, scale]}
        castShadow
        receiveShadow
      />
    </group>
  );
}

function FallbackProceduralCar({ isSelected, hasFault }: { isSelected: boolean; hasFault: boolean }) {
  return (
    <group position={[0, 0.4, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.75, 2.6]} />
        <meshStandardMaterial
          color={hasFault ? '#ef4444' : isSelected ? '#2563eb' : '#f8fafc'}
          roughness={0.2}
          metalness={0.1}
        />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.38, 0.2]}>
        <boxGeometry args={[1.2, 0.42, 1.2]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  );
}

function VehicleItem({ vehicle }: { vehicle: Vehicle }) {
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isSelected = selectedObject?.type === 'vehicle' && selectedObject.id === vehicle.id;

  const groupRef = useRef<THREE.Group>(null);

  const simSpeed = useDigitalTwinStore((s) => s.simulationSpeed);
  const isMoving = (vehicle.status === 'EN_ROUTE' || vehicle.status === 'DEPARTING') && vehicle.speed > 0;

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (isMoving) {
      // 1. Continuous forward velocity along the road heading at 60 FPS
      const speedMultiplier = (vehicle.speed * 0.04) * (simSpeed || 1.0);
      const heading = vehicle.heading ?? 0;
      const forwardX = Math.sin(heading) * speedMultiplier * delta;
      const forwardZ = Math.cos(heading) * speedMultiplier * delta;

      // Advance continuously between server ticks
      groupRef.current.position.x += forwardX;
      groupRef.current.position.z += forwardZ;

      // 2. Soft error reconciliation towards server authoritative position
      // Using exponential blend: never snaps, never freezes, keeps constant speed
      groupRef.current.position.x += (vehicle.position.x - groupRef.current.position.x) * (1 - Math.exp(-4 * delta));
      groupRef.current.position.z += (vehicle.position.z - groupRef.current.position.z) * (1 - Math.exp(-4 * delta));
    } else {
      // 3. Stationary / Parked: smoothly damp into charger bay / queue slot / repair bay
      groupRef.current.position.x = THREE.MathUtils.damp(
        groupRef.current.position.x,
        vehicle.position.x,
        8,
        delta
      );
      groupRef.current.position.z = THREE.MathUtils.damp(
        groupRef.current.position.z,
        vehicle.position.z,
        8,
        delta
      );
    }
    groupRef.current.position.y = 0.22;

    // 4. Smooth continuous heading rotation (no instant snapping on turns)
    const targetHeading = vehicle.heading ?? 0;
    let diff = targetHeading - groupRef.current.rotation.y;
    diff = THREE.MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;
    groupRef.current.rotation.y += diff * (1 - Math.exp(-8 * delta));
  });

  const routePoints = useMemo(() => {
    if (!isSelected || !vehicle.routeWaypoints || vehicle.routeWaypoints.length < 2) {
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
  }, [isSelected, vehicle.position, vehicle.routeWaypoints, vehicle.currentWaypointIndex]);

  const isCharging = vehicle.status === 'CHARGING';
  const hasFault = vehicle.status === 'FAULT' || vehicle.status === 'SERVICE_REQUIRED' || vehicle.vehicleHealth === 'CRITICAL';
  const isUnderRepair = vehicle.status === 'UNDER_REPAIR';
  const isQueue = vehicle.status === 'QUEUE';

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
        position={[vehicle.position.x, 0.22, vehicle.position.z]}
        onClick={(e) => {
          e.stopPropagation();
          selectVehicle(vehicle.id);
        }}
      >
        <Suspense fallback={<FallbackProceduralCar isSelected={isSelected} hasFault={hasFault} />}>
          <VehicleGLBModel model={vehicle.model} />
        </Suspense>

        {/* Selection / Alert Ring */}
        {isSelected && (
          <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 1.95, 32]} />
            <meshBasicMaterial
              color={hasFault ? '#ef4444' : '#2563eb'}
              transparent
              opacity={0.9}
            />
          </mesh>
        )}

        {/* Floating Pin / Tag Badge with Live Telemetry */}
        <Html position={[0, 2.3, 0]} center distanceFactor={26} zIndexRange={[100, 0]}>
          <div
            onClick={(e) => {
              e.stopPropagation();
              selectVehicle(vehicle.id);
            }}
            className={`cursor-pointer px-2 py-0.5 rounded-full border backdrop-blur-md transition-all select-none text-[10px] font-medium flex items-center gap-1 shadow-sm ${
              hasFault
                ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-300 animate-pulse'
                : isUnderRepair
                ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-300'
                : isSelected
                ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300'
                : 'bg-white/95 text-slate-800 border-slate-200 hover:border-blue-400'
            }`}
            style={{ whiteSpace: 'nowrap' }}
          >
            <span>{getStatusIcon()}</span>
            <span className="font-semibold">{vehicle.code}</span>
            <span className="text-[9px] font-mono opacity-90">
              {Math.round(vehicle.currentBatteryPct)}%
            </span>
          </div>
        </Html>
      </group>
    </>
  );
}

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

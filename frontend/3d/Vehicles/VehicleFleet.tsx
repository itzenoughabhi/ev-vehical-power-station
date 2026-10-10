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

const MODEL_SPECS: Record<string, ModelSpec> = {
  'Heavy Electric Hauler': { path: '/models/vehicles/truck.glb', scale: 0.65, rotY: 0, groundY: 0.04 },
  'Electric Truck':        { path: '/models/vehicles/truck.glb', scale: 0.65, rotY: 0, groundY: 0.04 },

  'Electric Pickup Truck': { path: '/models/vehicles/pickup_truck.glb', scale: 0.85, rotY: 0, groundY: 0.02 },
  'Pickup EV':             { path: '/models/vehicles/pickup_truck.glb', scale: 0.85, rotY: 0, groundY: 0.02 },

  'Commercial EV Van':     { path: '/models/vehicles/van.glb', scale: 0.048, rotY: 0, groundY: 0 },
  'FleetVan':              { path: '/models/vehicles/van.glb', scale: 0.048, rotY: 0, groundY: 0 },

  'Electric City Bus':     { path: '/models/vehicles/bus.glb', scale: 0.058, rotY: 0, groundY: 0.04 },

  'Tesla Model Y':         { path: '/models/vehicles/model_y.glb', scale: 1.25, rotY: Math.PI / 2, groundY: 0.02 },

  'Porsche Taycan':        { path: '/models/vehicles/taycan.glb', scale: 88.5, rotY: 0, groundY: 0.02 },

  'Mercedes EQS':          { path: '/models/vehicles/mercedes_benz_vision_eqs.glb', scale: 0.72, rotY: 0, groundY: 0.02 },

  'Lucid Air EV':          { path: '/models/vehicles/lucid.glb', scale: 0.84, rotY: 0, groundY: 0.02 },

  'Highway Patrol EV':     { path: '/models/vehicles/police_car.glb', scale: 1.02, rotY: 0, groundY: 0.02 },

  'Tata Nexon EV':         { path: '/models/vehicles/suv.glb', scale: 0.85, rotY: 0, groundY: 0.02 },
  'Apex SUV':              { path: '/models/vehicles/suv.glb', scale: 0.85, rotY: 0, groundY: 0.02 },
  'BYD Atto 3':            { path: '/models/vehicles/suv.glb', scale: 0.85, rotY: 0, groundY: 0.02 },

  'Mahindra XUV400':       { path: '/models/vehicles/car_sedan.glb', scale: 1.05, rotY: 0, groundY: 0.03 },

  'MG ZS EV':              { path: '/models/vehicles/car_model.glb', scale: 0.0075, rotY: 0, groundY: 0 },

  'Tata Tiago EV':         { path: '/models/vehicles/car.glb', scale: 0.038, rotY: 0, groundY: 0 },

  'Hyundai Ioniq 5':       { path: '/models/vehicles/sports_car.glb', scale: 0.92, rotY: 0, groundY: 0.02 },
  'HyperCoupe':            { path: '/models/vehicles/sports_car.glb', scale: 0.92, rotY: 0, groundY: 0.02 },
  'Kia EV6':               { path: '/models/vehicles/sports_car.glb', scale: 0.92, rotY: 0, groundY: 0.02 },

  'CyberSedan':            { path: '/models/vehicles/cybertruck.glb', scale: 1.25, rotY: Math.PI / 2, groundY: 0.01 },
};

const VehicleGLBModel = React.memo(function VehicleGLBModel({ model }: { model: string }) {
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
});

const FallbackProceduralCar = React.memo(function FallbackProceduralCar({ isSelected, hasFault }: { isSelected: boolean; hasFault: boolean }) {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.7, 0.58, 3.5]} />
        <meshStandardMaterial
          color={hasFault ? '#dc2626' : isSelected ? '#2563eb' : '#38bdf8'}
          metalness={0.7}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.85, -0.1]} castShadow>
        <boxGeometry args={[1.4, 0.48, 1.8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0.55, 0.42, 1.76]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[-0.55, 0.42, 1.76]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.55, 0.42, -1.76]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[-0.55, 0.42, -1.76]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.28, 0.14]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
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
});

const SelectedVehicleBadge = React.memo(function SelectedVehicleBadge({ vehicleId }: { vehicleId: string }) {
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const liveVehicle = useDigitalTwinStore((s) => s.vehicles.find((v) => v.id === vehicleId));
  if (!liveVehicle) return null;

  const hasFault = liveVehicle.status === 'FAULT' || liveVehicle.status === 'SERVICE_REQUIRED' || liveVehicle.vehicleHealth === 'CRITICAL';
  const isUnderRepair = liveVehicle.status === 'UNDER_REPAIR';
  const isCharging = liveVehicle.status === 'CHARGING';
  const isQueue = liveVehicle.status === 'QUEUE';

  const getStatusIcon = () => {
    if (hasFault) return '🚨';
    if (isUnderRepair) return '🔧';
    if (isCharging) return '⚡';
    if (isQueue) return '⏳';
    if (liveVehicle.status === 'ENTERING_STATION' || liveVehicle.status === 'REVERSE_PARKING') return '🅿️';
    return '🚗';
  };

  const batteryPct = Math.round(liveVehicle.currentBatteryPct);

  return (
    <Html position={[0, 1.85, 0]} center distanceFactor={26} zIndexRange={[100, 0]}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          selectVehicle(vehicleId);
        }}
        className={`cursor-pointer px-2.5 py-0.5 rounded-full border transition-all select-none text-[10px] font-medium flex items-center gap-1 shadow-md ${
          hasFault
            ? 'bg-red-600 text-white border-red-500 shadow-md ring-2 ring-red-300 animate-pulse'
            : isUnderRepair
            ? 'bg-amber-600 text-white border-amber-500 ring-2 ring-amber-300'
            : 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-300'
        }`}
        style={{ whiteSpace: 'nowrap' }}
      >
        <span>{getStatusIcon()}</span>
        <span className="font-semibold">{liveVehicle.code}</span>
        <span className="text-[9px] font-mono text-emerald-400">
          {batteryPct}%
        </span>
      </div>
    </Html>
  );
});

const VehicleItem = React.memo(function VehicleItem({ vehicle }: { vehicle: Vehicle }) {
  const selectVehicle = useDigitalTwinStore((s) => s.selectVehicle);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isSelected = selectedObject?.type === 'vehicle' && selectedObject.id === vehicle.id;
  const simSpeed = useDigitalTwinStore((s) => s.simulationSpeed);

  const groupRef = useRef<THREE.Group>(null);
  const isMoving =
    (vehicle.status === 'EN_ROUTE' ||
      vehicle.status === 'DEPARTING' ||
      vehicle.status === 'ENTERING_STATION' ||
      vehicle.status === 'REVERSE_PARKING' ||
      vehicle.status === 'LEAVING_STATION') &&
    vehicle.speed > 0;

  const targetRef = useRef({
    x: vehicle.position.x,
    y: vehicle.position.y && vehicle.position.y > 0.1 ? vehicle.position.y : 0.04,
    z: vehicle.position.z,
    heading: vehicle.heading || 0,
    speed: vehicle.speed || 0,
    isMoving,
    status: vehicle.status,
  });

  useEffect(() => {
    targetRef.current.x = vehicle.position.x;
    targetRef.current.y = vehicle.position.y && vehicle.position.y > 0.1 ? vehicle.position.y : 0.04;
    targetRef.current.z = vehicle.position.z;
    targetRef.current.heading = vehicle.heading || 0;
    targetRef.current.speed = vehicle.speed || 0;
    targetRef.current.status = vehicle.status;
    targetRef.current.isMoving =
      (vehicle.status === 'EN_ROUTE' ||
        vehicle.status === 'DEPARTING' ||
        vehicle.status === 'ENTERING_STATION' ||
        vehicle.status === 'REVERSE_PARKING' ||
        vehicle.status === 'LEAVING_STATION') &&
      vehicle.speed > 0;
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

    const liveVeh = useDigitalTwinStore.getState().vehicles.find((v) => v.id === vehicle.id);
    if (liveVeh) {
      targetRef.current.x = liveVeh.position.x;
      targetRef.current.y = liveVeh.position.y && liveVeh.position.y > 0.1 ? liveVeh.position.y : 0.04;
      targetRef.current.z = liveVeh.position.z;
      targetRef.current.heading = liveVeh.heading || 0;
      targetRef.current.speed = liveVeh.speed || 0;
      targetRef.current.status = liveVeh.status;
      targetRef.current.isMoving = liveVeh.speed > 0;
    }
    const target = targetRef.current;

    if (isNaN(groupRef.current.position.x) || isNaN(groupRef.current.position.z)) {
      groupRef.current.position.x = target.x || 20.6;
      groupRef.current.position.z = target.z || 29.1;
      groupRef.current.position.y = target.y || 0.04;
      groupRef.current.rotation.y = target.heading || 0;
    }

    const trackingRate = target.isMoving ? 11.0 * currentSimSpeed : 8.0;
    const factor = 1 - Math.exp(-trackingRate * clampedDelta);

    const errX = target.x - groupRef.current.position.x;
    const errZ = target.z - groupRef.current.position.z;
    const distSq = errX * errX + errZ * errZ;

    if (distSq > 49) {
      groupRef.current.position.x = target.x;
      groupRef.current.position.z = target.z;
    } else {
      groupRef.current.position.x += errX * factor;
      groupRef.current.position.z += errZ * factor;
    }

    groupRef.current.position.y += (target.y - groupRef.current.position.y) * factor;

    let diff = target.heading - groupRef.current.rotation.y;
    diff = THREE.MathUtils.euclideanModulo(diff + Math.PI, Math.PI * 2) - Math.PI;
    groupRef.current.rotation.y += diff * factor;
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
    if (vehicle.status === 'ENTERING_STATION' || vehicle.status === 'REVERSE_PARKING') return '🅿️';
    return '🚗';
  };

  return (
    <>
      {routePoints && routePoints.length > 1 && (
        <Line
          points={routePoints}
          color={hasFault ? '#ef4444' : '#2563eb'}
          lineWidth={2.0}
          transparent
          opacity={0.7}
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

        {isSelected && (
          <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.35, 1.5, 32]} />
            <meshBasicMaterial
              color={hasFault ? '#ef4444' : '#2563eb'}
              transparent
              opacity={0.85}
            />
          </mesh>
        )}

        {isSelected && (
          <SelectedVehicleBadge vehicleId={vehicle.id} />
        )}
      </group>
    </>
  );
}, (prev, next) => {
  return (
    prev.vehicle.id === next.vehicle.id &&
    prev.vehicle.status === next.vehicle.status &&
    prev.vehicle.model === next.vehicle.model &&
    prev.vehicle.vehicleHealth === next.vehicle.vehicleHealth &&
    prev.vehicle.currentWaypointIndex === next.vehicle.currentWaypointIndex
  );
});

export function VehicleFleet() {
  const vehicleRosterKey = useDigitalTwinStore((s) => s.vehicles.map((v) => `${v.id}:${v.status}`).join('|'));
  const vehicles = useDigitalTwinStore.getState().vehicles;

  return (
    <group name="VehicleFleet">
      {vehicles.map((vehicle) => (
        <VehicleItem key={vehicle.id} vehicle={vehicle} />
      ))}
    </group>
  );
}

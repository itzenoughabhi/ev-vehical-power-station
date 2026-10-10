'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { CitySky } from './Environment/CitySky';
import { RoadNetwork } from './Roads/RoadNetwork';
import { TrafficSignals3D } from './Roads/TrafficSignals3D';
import { DebugOverlay3D } from './Roads/DebugOverlay3D';
import { Buildings } from './City/Buildings';
import { CityProps } from './Environment/CityProps';
import { ChargingStation } from './Stations/ChargingStation';
import { VehicleFleet } from './Vehicles/VehicleFleet';
import { IncidentMarkers } from './InteractiveMarkers/IncidentMarker';
import { PowerGridSystem } from './Grid/PowerGridSystem';
import { ServiceCenter3D } from './ServiceCenter/ServiceCenter3D';
import { HomeChargers3D } from './Residential/HomeChargers3D';

function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const cameraTarget = useDigitalTwinStore((s) => s.cameraTarget);
  const cameraPosition = useDigitalTwinStore((s) => s.cameraPosition);
  const trackingVehicleId = useDigitalTwinStore((s) => s.trackingVehicleId);
  const isPanMode = useDigitalTwinStore((s) => s.isPanMode);

  const targetVec = useRef(new THREE.Vector3(...cameraTarget));
  const posVec = useRef(new THREE.Vector3(...cameraPosition));
  const isTransitioning = useRef(false);
  const isUserInteracting = useRef(false);

  useEffect(() => {
    targetVec.current.set(...cameraTarget);
    posVec.current.set(...cameraPosition);
    if (!isUserInteracting.current) {
      isTransitioning.current = true;
    }
  }, [cameraTarget, cameraPosition]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (trackingVehicleId) {
      const vehicles = useDigitalTwinStore.getState().vehicles;
      const veh = vehicles.find((v) => v.id === trackingVehicleId);
      if (veh && !isNaN(veh.position.x) && !isNaN(veh.position.z)) {
        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, veh.position.x, 6, delta);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, 0.8, 6, delta);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, veh.position.z, 6, delta);

        if (!isUserInteracting.current) {
          const targetCamX = veh.position.x + 12;
          const targetCamY = 10;
          const targetCamZ = veh.position.z + 14;
          camera.position.x = THREE.MathUtils.damp(camera.position.x, targetCamX, 4, delta);
          camera.position.y = THREE.MathUtils.damp(camera.position.y, targetCamY, 4, delta);
          camera.position.z = THREE.MathUtils.damp(camera.position.z, targetCamZ, 4, delta);
        }

        controlsRef.current.update();
        return;
      }
    }

    if (isNaN(camera.position.x) || isNaN(camera.position.y) || isNaN(camera.position.z)) {
      camera.position.set(68, 56, 68);
    }
    if (isNaN(controlsRef.current.target.x) || isNaN(controlsRef.current.target.y) || isNaN(controlsRef.current.target.z)) {
      controlsRef.current.target.set(6, 1, 8);
    }

    if (isTransitioning.current && !isUserInteracting.current) {
      camera.position.x = THREE.MathUtils.damp(camera.position.x, posVec.current.x, 3.8, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, posVec.current.y, 3.8, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, posVec.current.z, 3.8, delta);

      controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, targetVec.current.x, 4.2, delta);
      controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, targetVec.current.y, 4.2, delta);
      controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, targetVec.current.z, 4.2, delta);

      controlsRef.current.update();

      const posDistSq = camera.position.distanceToSquared(posVec.current);
      const targetDistSq = controlsRef.current.target.distanceToSquared(targetVec.current);
      if (posDistSq < 0.05 && targetDistSq < 0.05) {
        camera.position.copy(posVec.current);
        controlsRef.current.target.copy(targetVec.current);
        isTransitioning.current = false;
      }
    } else {
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping={true}
      dampingFactor={0.06}
      panSpeed={1.8}
      screenSpacePanning={true}
      maxPolarAngle={Math.PI / 2.15}
      minDistance={6}
      maxDistance={320}
      touches={{
        ONE: THREE.TOUCH.PAN,
        TWO: THREE.TOUCH.DOLLY_ROTATE,
      }}
      mouseButtons={{
        LEFT: isPanMode ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.PAN,
      }}
      onStart={() => {
        isUserInteracting.current = true;
        isTransitioning.current = false;
      }}
      onEnd={() => {
        isUserInteracting.current = false;
        if (controlsRef.current) {
          posVec.current.copy(camera.position);
          targetVec.current.copy(controlsRef.current.target);
        }
      }}
    />
  );
}

const StationsList = React.memo(function StationsList() {
  const stations = useDigitalTwinStore((s) => s.stations);
  return (
    <group name="StationsGroup">
      {stations.map((station) => (
        <ChargingStation key={station.id} station={station} />
      ))}
    </group>
  );
});

export function DigitalTwinScene() {
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);
  const isPanMode = useDigitalTwinStore((s) => s.isPanMode);

  return (
    <div className={`w-full h-full relative select-none ${isPanMode ? 'cursor-grab active:cursor-grabbing' : ''}`}>
      <Canvas
        shadows
        dpr={[1, 1.15]}
        camera={{ position: [68, 56, 68], fov: 38 }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.15,
        }}
        onPointerMissed={(e) => {
          if (e.target === e.currentTarget) {
            clearSelection();
          }
        }}
      >
        <CitySky />
        <CameraRig />

        <RoadNetwork />

        <DebugOverlay3D />

        <Buildings />

        <CityProps />

        <PowerGridSystem />

        <ServiceCenter3D />

        <HomeChargers3D />

        <StationsList />

        <VehicleFleet />

        <IncidentMarkers />
      </Canvas>
    </div>
  );
}

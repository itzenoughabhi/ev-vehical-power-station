'use client';

import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../store/useDigitalTwinStore';
import { CitySky } from './Environment/CitySky';
import { RoadNetwork } from './Roads/RoadNetwork';
import { Buildings } from './City/Buildings';
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
  const vehicles = useDigitalTwinStore((s) => s.vehicles);

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

    // Follow vehicle if vehicle tracking mode is active
    if (trackingVehicleId) {
      const veh = vehicles.find((v) => v.id === trackingVehicleId);
      if (veh) {
        controlsRef.current.target.x = THREE.MathUtils.damp(controlsRef.current.target.x, veh.position.x, 6, delta);
        controlsRef.current.target.y = THREE.MathUtils.damp(controlsRef.current.target.y, 1.2, 6, delta);
        controlsRef.current.target.z = THREE.MathUtils.damp(controlsRef.current.target.z, veh.position.z, 6, delta);
        controlsRef.current.update();
        return;
      }
    }

    // Programmatic camera transition damping
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
      enableRotate={true}
      enablePan={true}
      enableZoom={true}
      enableDamping={true}
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2.15}
      minDistance={6}
      maxDistance={160}
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

export function DigitalTwinScene() {
  const stations = useDigitalTwinStore((s) => s.stations);
  const clearSelection = useDigitalTwinStore((s) => s.clearSelection);

  return (
    <div className="w-full h-full relative select-none">
      <Canvas
        shadows
        dpr={[1, 1.75]}
        camera={{ position: [38, 42, 48], fov: 38 }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1,
        }}
        onPointerMissed={(e) => {
          if (e.target === e.currentTarget) {
            clearSelection();
          }
        }}
      >
        {/* Natural daylight atmosphere & terrain */}
        <CitySky />
        <CameraRig />

        {/* Real Boisar Road Network */}
        <RoadNetwork />

        {/* Urban & Industrial Environment */}
        <Buildings />

        {/* Power Grid Infrastructure Layer */}
        <PowerGridSystem />

        {/* EV Service & Repair Center S03 */}
        <ServiceCenter3D />

        {/* Residential Home EV Chargers */}
        <HomeChargers3D />

        {/* Public EV Charging Stations */}
        <group name="StationsGroup">
          {stations.map((station) => (
            <ChargingStation key={station.id} station={station} />
          ))}
        </group>

        {/* EV Fleet */}
        <VehicleFleet />

        {/* Interactive Incidents */}
        <IncidentMarkers />
      </Canvas>
    </div>
  );
}

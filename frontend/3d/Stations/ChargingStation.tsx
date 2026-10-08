'use client';

import React, { useRef, useMemo, Suspense } from 'react';
import { Html, useGLTF, Clone } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Station, Charger } from '../../types';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';

function ChargingCable3D() {
  const curve = useMemo(() => {
    // 3D heavy-duty DC flexible charging cable connecting from charger pedestal holster to vehicle port
    const p0 = new THREE.Vector3(0.24, 1.05, -1.0);
    const p1 = new THREE.Vector3(0.38, 0.42, -0.5);
    const p2 = new THREE.Vector3(0.44, 0.28, 0.1);
    const p3 = new THREE.Vector3(0.48, 0.68, 0.7);
    return new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
  }, []);

  return (
    <group>
      {/* Heavy-duty DC flexible charging cable tube */}
      <mesh castShadow>
        <tubeGeometry args={[curve, 24, 0.038, 8, false]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* CCS2 / DC Fast Charging Connector Handle */}
      <mesh position={[0.48, 0.68, 0.7]} rotation={[-Math.PI / 4, 0, 0]} castShadow>
        <cylinderGeometry args={[0.065, 0.05, 0.22, 12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Illuminated LED Status Halo on Plug */}
      <mesh position={[0.48, 0.72, 0.74]}>
        <ringGeometry args={[0.04, 0.07, 16]} />
        <meshBasicMaterial color="#06b6d4" />
      </mesh>

      {/* Pulsing charging illumination */}
      <pointLight position={[0.48, 0.75, 0.74]} color="#06b6d4" intensity={1.8} distance={2.5} />
    </group>
  );
}

function StationPowerBox({ position }: { position: [number, number, number] }) {
  const { scene } = useGLTF('/models/stations/power_box.glb');
  return (
    <group position={position}>
      <Clone object={scene} scale={[1.8, 1.8, 1.8]} castShadow receiveShadow />
    </group>
  );
}

interface Props {
  station: Station;
}

interface ChargerUnitProps {
  charger: Charger;
  position: [number, number, number];
  stationId: string;
}

function ModularChargerUnit({ charger, position, stationId }: ChargerUnitProps) {
  const selectCharger = useDigitalTwinStore((s) => s.selectCharger);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isSelected = selectedObject?.type === 'charger' && selectedObject.id === charger.id;

  const beaconRef = useRef<THREE.MeshBasicMaterial>(null);
  const screenRef = useRef<THREE.MeshBasicMaterial>(null);

  const isFault = charger.status === 'FAULT';
  const isCharging = charger.status === 'CHARGING';
  const isAvailable = charger.status === 'AVAILABLE';

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    if (isFault && beaconRef.current) {
      // Rapid hazard warning blink (5 Hz)
      beaconRef.current.opacity = Math.sin(elapsed * 10) > 0 ? 1.0 : 0.2;
    } else if (isCharging && beaconRef.current) {
      // Smooth breathing glow
      beaconRef.current.opacity = 0.65 + Math.sin(elapsed * 4) * 0.35;
    } else if (beaconRef.current) {
      beaconRef.current.opacity = 0.9;
    }
  });

  const getStatusColor = () => {
    if (isSelected) return '#3b82f6';
    if (isFault) return '#ef4444';
    if (isCharging) return '#06b6d4';
    if (isAvailable) return '#22c55e';
    return '#64748b';
  };

  const statusColor = getStatusColor();

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        selectCharger(stationId, charger.id);
      }}
    >
      {/* Charger Pedestal Column */}
      <mesh castShadow receiveShadow position={[0, 0.95, 0]}>
        <boxGeometry args={[0.55, 1.8, 0.45]} />
        <meshStandardMaterial
          color={isFault ? '#2d1515' : isSelected ? '#dbeafe' : '#1e293b'}
          metalness={0.4}
          roughness={0.25}
        />
      </mesh>

      {/* Front Interface Screen Frame */}
      <mesh position={[0, 1.15, 0.23]}>
        <boxGeometry args={[0.42, 0.7, 0.02]} />
        <meshStandardMaterial color="#0b0f19" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* High-Tech Glowing Digital Screen Display */}
      <mesh position={[0, 1.15, 0.24]}>
        <planeGeometry args={[0.38, 0.62]} />
        <meshStandardMaterial
          color="#030712"
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Illuminated Status Header Strip */}
      <mesh position={[0, 1.35, 0.245]}>
        <planeGeometry args={[0.32, 0.08]} />
        <meshBasicMaterial
          color={isFault ? '#ef4444' : isCharging ? '#06b6d4' : '#10b981'}
        />
      </mesh>
      {/* Lower Telemetry Readout Indicator */}
      <mesh position={[0, 1.12, 0.245]}>
        <planeGeometry args={[0.30, 0.16]} />
        <meshBasicMaterial
          color={isFault ? '#991b1b' : isCharging ? '#0891b2' : '#059669'}
        />
      </mesh>

      {/* Selected Charger Inspector Tooltip (Only rendered when selected) */}
      {isSelected && (
        <Html position={[0, 2.3, 0]} center distanceFactor={22} zIndexRange={[100, 0]}>
          <div className="bg-slate-900/95 text-white border border-blue-500 rounded-lg px-2.5 py-1 font-mono text-[10px] shadow-2xl backdrop-blur-md whitespace-nowrap">
            <span className="font-bold text-blue-400">{charger.code}</span>: {charger.status} ({charger.currentPowerKw || 0}kW)
          </div>
        </Html>
      )}

      {/* Top Status Beacon Dome (Visible from afar to immediately tell if working) */}
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.12, 16]} />
        <meshBasicMaterial
          ref={beaconRef}
          color={statusColor}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Pedestal Accent LED Bar */}
      <mesh position={[0, 1.62, 0.24]}>
        <planeGeometry args={[0.38, 0.05]} />
        <meshBasicMaterial color={statusColor} />
      </mesh>

      {/* Charging Cable & Holster */}
      <mesh position={[0.28, 0.82, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.85, 8]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* Dynamic 3D Connected Charging Cord (Rendered when car is actively charging in bay) */}
      {isCharging && (
        <group position={[0.28, 0.82, 0]}>
          {/* Flexible cable curve from charger into parked car */}
          <mesh position={[-0.1, -0.3, 0.9]} rotation={[0.4, -0.2, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 1.8, 8]} />
            <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} />
          </mesh>
          {/* Subtle pulsating charging ring at connector head */}
          <mesh position={[-0.2, -0.4, 1.7]} rotation={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      )}
    </group>
  );
}

export const ChargingStation = React.memo(function ChargingStation({ station }: Props) {
  const selectStation = useDigitalTwinStore((s) => s.selectStation);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);

  const isSelected = selectedObject?.type === 'station' && selectedObject.id === station.id;

  const availableCount = station.chargers.filter((c) => c.status === 'AVAILABLE').length;
  const faultCount = station.chargers.filter((c) => c.status === 'FAULT').length;
  const hasFault = faultCount > 0;
  const isAllWorking = faultCount === 0 && station.status === 'ONLINE';
  const isBusy = availableCount === 0 && faultCount === 0;

  const totalChargers = station.chargers.length;
  const bayOffsets = totalChargers <= 4 
    ? [-3.6, -1.2, 1.2, 3.6] 
    : [-5.2, -3.1, -1.0, 1.0, 3.1, 5.2];
  const apronW = totalChargers <= 4 ? 14.8 : 18.0;
  const buildingW = totalChargers <= 4 ? 14.0 : 17.2;
  const canopyW = totalChargers <= 4 ? 14.0 : 17.2;
  const colOffset = totalChargers <= 4 ? 6.2 : 7.8;

  const emergencyLightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    if (emergencyLightRef.current && hasFault) {
      emergencyLightRef.current.intensity = Math.sin(state.clock.getElapsedTime() * 10) > 0 ? 3.0 : 0.2;
    }
  });

  return (
    <group
      position={[station.position.x, 0, station.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectStation(station.id);
      }}
    >
      {/* 1. Concrete Apron Base — Crisp Pale White/Grey */}
      <mesh receiveShadow position={[0, 0.04, 0.5]}>
        <boxGeometry args={[apronW, 0.08, 10.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* 2. Station Kiosk / Convenience Building — WareTrack Crisp White & Royal Blue Trim */}
      <group position={[0, 2.2, -3.2]}>
        {/* Main Clean White Building Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[buildingW, 4.4, 3.6]} />
          <meshStandardMaterial color="#ffffff" roughness={0.35} metalness={0.05} />
        </mesh>

        {/* WareTrack Royal Blue Roof Fascia Trim */}
        <mesh position={[0, 2.3, 0]} castShadow>
          <boxGeometry args={[buildingW + 0.4, 0.35, 4.0]} />
          <meshStandardMaterial color="#2563eb" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* Modern Large Reflective Panoramic Glass Windows */}
        <mesh position={[0, -0.4, 1.81]}>
          <planeGeometry args={[buildingW - 2.2, 2.2]} />
          <meshStandardMaterial color="#38bdf8" roughness={0.12} metalness={0.85} />
        </mesh>
      </group>

      {/* 3. Cantilever Canopy over Charging Bays — WareTrack Royal Blue */}
      <group position={[0, 4.2, 1.2]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[canopyW, 0.25, 4.8]} />
          <meshStandardMaterial color={hasFault ? '#dc2626' : '#2563eb'} roughness={0.25} />
        </mesh>

        {/* Photovoltaic Solar Glass Top */}
        <mesh position={[0, 0.16, 0]}>
          <boxGeometry args={[canopyW - 0.6, 0.04, 4.2]} />
          <meshStandardMaterial color="#0f172a" roughness={0.15} metalness={0.9} />
        </mesh>

        {/* Crisp White/Silver Support Columns */}
        {[-colOffset, colOffset].map((cx, cidx) => (
          <mesh key={`col-${cidx}`} position={[cx, -2.1, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.14, 4.2, 12]} />
            <meshStandardMaterial color="#f1f5f9" metalness={0.3} roughness={0.4} />
          </mesh>
        ))}

        {/* --- HIGH-VISIBILITY CANOPY STATUS MARQUEE (Clearly shows working or not) --- */}
        <group position={[0, 0.35, 2.45]}>
          {/* Physical Sign Box */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[11.8, 0.65, 0.12]} />
            <meshStandardMaterial color="#0b0f19" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Illuminated LED Sign Display Strip */}
          <mesh position={[0, 0, 0.07]}>
            <planeGeometry args={[11.4, 0.48]} />
            <meshStandardMaterial
              color={hasFault ? '#450a0a' : '#022c22'}
              emissive={hasFault ? '#ef4444' : '#10b981'}
              emissiveIntensity={0.65}
              roughness={0.2}
            />
          </mesh>

          {/* Accent Neon Border Lines */}
          <mesh position={[0, 0.22, 0.075]}>
            <planeGeometry args={[11.2, 0.04]} />
            <meshBasicMaterial color={hasFault ? '#ef4444' : '#34d399'} />
          </mesh>
          <mesh position={[0, -0.22, 0.075]}>
            <planeGeometry args={[11.2, 0.04]} />
            <meshBasicMaterial color={hasFault ? '#ef4444' : '#34d399'} />
          </mesh>

          {/* Roof Emergency Flashing Hazard Light (Active when fault exists) */}
          {hasFault && (
            <group position={[5.2, 0.45, 0]}>
              <mesh>
                <cylinderGeometry args={[0.12, 0.15, 0.22, 12]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              <pointLight ref={emergencyLightRef} color="#ef4444" intensity={2.5} distance={15} />
            </group>
          )}
        </group>
      </group>

      {/* 4. Charging Pedestals and Ground Bay Markings */}
      {bayOffsets.map((bx, bidx) => {
        const ch = station.chargers[bidx];
        if (!ch) return null;
        const isFault = ch.status === 'FAULT';
        const isCharging = ch.status === 'CHARGING';

        return (
          <group key={ch.id} position={[bx, 0, 1.8]}>
            {/* Painted Parking Bay Markings - Centered in stall */}
            <mesh position={[0, 0.05, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.2, 4.2]} />
              <meshBasicMaterial 
                color={isFault ? '#7f1d1d' : isCharging ? '#0284c7' : '#0f172a'} 
                opacity={isFault ? 0.35 : isCharging ? 0.25 : 0.15} 
                transparent 
              />
            </mesh>

            {/* White Parking Stall Boundary Lines */}
            {[-1.1, 1.1].map((lx, lidx) => (
              <mesh key={`pl-${lidx}`} position={[lx, 0.055, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.08, 4.2]} />
                <meshBasicMaterial 
                  color={isFault ? '#ef4444' : '#ffffff'} 
                  opacity={0.85} 
                  transparent 
                />
              </mesh>
            ))}

            {/* Rubber Wheel Stop Curb */}
            <mesh position={[0, 0.07, -0.3]} receiveShadow castShadow>
              <boxGeometry args={[1.7, 0.12, 0.2]} />
              <meshStandardMaterial color="#1e293b" roughness={0.8} />
            </mesh>

            {/* Yellow/Black Steel Safety Bollards to protect pedestal */}
            {[-0.75, 0.75].map((sx, sidx) => (
              <group key={`bollard-${sidx}`} position={[sx, 0.45, -0.75]}>
                <mesh castShadow receiveShadow>
                  <cylinderGeometry args={[0.065, 0.065, 0.9, 12]} />
                  <meshStandardMaterial color="#eab308" roughness={0.3} metalness={0.5} />
                </mesh>
                <mesh position={[0, 0.2, 0]}>
                  <cylinderGeometry args={[0.07, 0.07, 0.14, 12]} />
                  <meshStandardMaterial color="#0f172a" roughness={0.5} />
                </mesh>
              </group>
            ))}

            {/* Ground Fault Hazard Marking */}
            {isFault && (
              <group position={[0, 0.06, 1.2]}>
                <mesh rotation={[-Math.PI / 2, 0, 0]}>
                  <ringGeometry args={[0.6, 0.75, 16]} />
                  <meshBasicMaterial color="#ef4444" opacity={0.8} transparent />
                </mesh>
                {/* Yellow / Red diagonal warning bar */}
                <mesh rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
                  <planeGeometry args={[0.12, 1.2]} />
                  <meshBasicMaterial color="#ef4444" />
                </mesh>
              </group>
            )}

            {/* Ground Active Charging Halo Ring */}
            {isCharging && (
              <mesh position={[0, 0.056, 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.85, 1.05, 32]} />
                <meshBasicMaterial color="#06b6d4" opacity={0.75} transparent />
              </mesh>
            )}

            {/* 3D Physical Charging Cable connecting Pedestal to Vehicle */}
            {isCharging && <ChargingCable3D />}

            {/* Charger Pedestal */}
            <ModularChargerUnit
              charger={ch}
              position={[0, 0, -1.2]}
              stationId={station.id}
            />
          </group>
        );
      })}

      {/* 5. Station Power Distribution Cabinet (power_box.glb) */}
      <Suspense fallback={null}>
        <StationPowerBox position={[canopyW / 2 - 1.2, 0, -5.0]} />
      </Suspense>

      {/* 5. Physical Waiting Queue Slots on Side Apron */}
      <group position={[5.2, 0, -3.2]}>
        {[0, 1, 2].map((qi) => (
          <mesh key={`qslot-${qi}`} position={[qi * 1.8, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[1.5, 2.8]} />
            <meshBasicMaterial color="#f59e0b" opacity={0.12} transparent />
          </mesh>
        ))}
      </group>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[8.8, 9.3, 36]} />
          <meshBasicMaterial color="#2563eb" transparent opacity={0.85} />
        </mesh>
      )}
    </group>
  );
});

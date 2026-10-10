'use client';

import React from 'react';
import * as THREE from 'three';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';
import { BOISAR_ROADS } from './boisarRoads';

export function DebugOverlay3D() {
  const isDebugMode = useDigitalTwinStore((s) => s.isDebugMode);
  const debugGraph = useDigitalTwinStore((s) => s.debugGraph);
  const debugStations = useDigitalTwinStore((s) => s.debugStations);
  const debugCollisions = useDigitalTwinStore((s) => s.debugCollisions);
  const stations = useDigitalTwinStore((s) => s.stations);
  const vehicles = useDigitalTwinStore((s) => s.vehicles);
  const trafficSignals = useDigitalTwinStore((s) => s.trafficSignals);

  if (!isDebugMode) return null;

  return (
    <group name="DebugOverlay3D">
      {debugGraph && (
        <group name="DebugRoadGraph">
          {BOISAR_ROADS.map((road) => (
            <group key={`debug-road-${road.id}`}>
              <line>
                <bufferGeometry
                  attach="geometry"
                  {...(() => {
                    const geom = new THREE.BufferGeometry();
                    const flatPoints: number[] = [];
                    road.points.forEach((p) => flatPoints.push(p[0], 0.35, p[2]));
                    geom.setAttribute('position', new THREE.Float32BufferAttribute(flatPoints, 3));
                    return geom;
                  })()}
                />
                <lineBasicMaterial attach="material" color="#06b6d4" linewidth={2} />
              </line>

              {road.points.map((p, idx) => (
                <mesh key={`node-${road.id}-${idx}`} position={[p[0], 0.45, p[2]]}>
                  <sphereGeometry args={[0.35, 8, 8]} />
                  <meshBasicMaterial color="#22d3ee" wireframe />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      )}

      {debugStations && (
        <group name="DebugStationClearance">
          {stations.map((st) => (
            <group key={`debug-st-${st.id}`} position={[st.position.x, 0.2, st.position.z]}>
              <mesh position={[0, 0.5, 1.5]}>
                <boxGeometry args={[18, 1.0, 14]} />
                <meshBasicMaterial color="#eab308" wireframe />
              </mesh>

              {st.chargers.map((ch, idx) => {
                const totalCh = st.chargers.length;
                const offset = totalCh <= 4
                  ? [-3.6, -1.2, 1.2, 3.6][idx] || 0
                  : [-5.2, -3.1, -1.0, 1.0, 3.1, 5.2][idx] || 0;
                return (
                  <mesh key={`debug-bay-${ch.id}`} position={[offset, 0.1, 3.0]}>
                    <boxGeometry args={[2.2, 0.2, 4.2]} />
                    <meshBasicMaterial color="#3b82f6" wireframe />
                  </mesh>
                );
              })}
            </group>
          ))}
        </group>
      )}

      {debugCollisions && (
        <group name="DebugCollisions">
          {trafficSignals.map((sig) => (
            <mesh key={`debug-sig-${sig.id}`} position={[sig.stopLine.x, 0.2, sig.stopLine.z]}>
              <boxGeometry args={[4.2, 0.1, 0.6]} />
              <meshBasicMaterial color={sig.state === 'RED' ? '#ef4444' : '#10b981'} wireframe />
            </mesh>
          ))}

          {vehicles.map((v) => (
            <mesh key={`debug-veh-${v.id}`} position={[v.position.x, 0.2, v.position.z]} rotation={[0, v.heading || 0, 0]}>
              <boxGeometry args={[2.4, 0.4, 6.0]} />
              <meshBasicMaterial color="#f97316" wireframe />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

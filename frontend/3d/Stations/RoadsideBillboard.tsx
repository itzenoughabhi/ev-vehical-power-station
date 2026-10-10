'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Station } from '../../types';

interface RoadsideBillboardProps {
  station: Station;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const RoadsideBillboard = React.memo(function RoadsideBillboard({ station, position = [0, 0, 0], rotation = [0, 0, 0] }: RoadsideBillboardProps) {
  const signTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 940;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(0.5, 0.5);

    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(0.5, '#0b132b');
    gradient.addColorStop(1, '#020617');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(0, 0, canvas.width, 42);

    const topGlow = ctx.createLinearGradient(0, 42, 0, 90);
    topGlow.addColorStop(0, 'rgba(37, 99, 235, 0.4)');
    topGlow.addColorStop(1, 'rgba(37, 99, 235, 0)');
    ctx.fillStyle = topGlow;
    ctx.fillRect(0, 42, canvas.width, 48);

    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 6;
    ctx.strokeRect(28, 64, canvas.width - 56, canvas.height - 96);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 54px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillText('⚡ EVNEXUS', canvas.width / 2, 175);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 28px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('NATIONAL CHARGING NETWORK', canvas.width / 2, 230);

    ctx.strokeStyle = 'rgba(71, 85, 105, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 290);
    ctx.lineTo(canvas.width - 120, 290);
    ctx.stroke();

    const code = station.code || 'C201';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 210px "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '12px';
    ctx.fillText(code, canvas.width / 2, 530);

    let stationName = (station.name || 'MIDC INDUSTRIAL HUB').toUpperCase();
    stationName = stationName.replace(/CHARGING HUB|STATION|EV HUB/gi, '').trim();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 58px "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '3px';
    ctx.fillText(stationName, canvas.width / 2, 740);

    ctx.fillStyle = '#64748b';
    ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '8px';
    ctx.fillText('PUBLIC ULTRA-FAST HUB', canvas.width / 2, 810);

    ctx.save();
    ctx.translate(canvas.width / 2, 1080);

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(-55, -45, 110, 95, 18);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-35, -95, 20, 50);
    ctx.fillRect(15, -95, 20, 50);

    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(0, 50, 40, 0, Math.PI);
    ctx.stroke();

    ctx.restore();

    ctx.fillStyle = '#e2e8f0';
    ctx.font = 'bold 44px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.letterSpacing = '6px';
    ctx.fillText('EV CHARGING STATION', canvas.width / 2, 1370);

    ctx.fillStyle = '#475569';
    ctx.font = '500 30px monospace';
    ctx.letterSpacing = '4px';
    ctx.fillText('24×7 AUTOMATED HIGHWAY ACCESS', canvas.width / 2, 1435);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(120, 1530, canvas.width - 240, 6);

    ctx.fillStyle = '#2563eb';
    ctx.fillRect(canvas.width / 2 - 60, 1528, 120, 10);

    ctx.fillStyle = '#334155';
    ctx.font = '500 24px monospace';
    ctx.fillText('AUTHORIZED EV PARKING ONLY', canvas.width / 2, 1680);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.needsUpdate = true;
    return texture;
  }, [station.code, station.name]);

  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.24, 0.9]} />
        <meshStandardMaterial color="#64748b" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.76, 0.08, 0.76]} />
        <meshStandardMaterial color="#475569" roughness={0.85} metalness={0.1} />
      </mesh>

      <mesh position={[0, 0.31, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.03, 0.42]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>

      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.075, 0.085, 1.3, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.35} />
      </mesh>

      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.095, 0.095, 0.12, 16]} />
        <meshStandardMaterial color="#0f172a" metalness={0.85} roughness={0.25} />
      </mesh>

      <group position={[0, 2.7, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.22, 2.22, 0.12]} />
          <meshStandardMaterial color="#0f172a" metalness={0.4} roughness={0.5} />
        </mesh>

        {[-0.615, 0.615].map((tx, tidx) => (
          <mesh key={`trim-${tidx}`} position={[tx, 0, 0]} castShadow>
            <boxGeometry args={[0.02, 2.24, 0.13]} />
            <meshStandardMaterial color="#1e293b" metalness={0.75} roughness={0.3} />
          </mesh>
        ))}

        <mesh position={[0, 1.115, 0]} castShadow>
          <boxGeometry args={[1.22, 0.045, 0.13]} />
          <meshStandardMaterial color="#2563eb" emissive="#1d4ed8" emissiveIntensity={0.4} metalness={0.3} roughness={0.3} />
        </mesh>

        <mesh position={[0, -1.115, 0]} castShadow>
          <boxGeometry args={[1.22, 0.03, 0.13]} />
          <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.4} />
        </mesh>

        {signTexture && (
          <mesh position={[0, 0, 0.062]}>
            <planeGeometry args={[1.18, 2.16]} />
            <meshStandardMaterial
              map={signTexture}
              roughness={0.35}
              metalness={0.1}
            />
          </mesh>
        )}

        {signTexture && (
          <mesh position={[0, 0, -0.062]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[1.18, 2.16]} />
            <meshStandardMaterial
              map={signTexture}
              roughness={0.4}
              metalness={0.1}
            />
          </mesh>
        )}

        <mesh position={[0, 1.06, 0.12]} rotation={[Math.PI / 4, 0, 0]}>
          <boxGeometry args={[1.14, 0.03, 0.06]} />
          <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.045, 0.11]}>
          <boxGeometry args={[1.08, 0.008, 0.015]} />
          <meshBasicMaterial color="#bae6fd" />
        </mesh>
      </group>
    </group>
  );
});

'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function CitySky() {
  const mapTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(0.5, 0.5);

    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 4096, 4096);

    const toPx = (x: number, z: number) => ({
      px: 2048 + x * 2.0,
      py: 2048 + z * 2.0,
    });

    const seaGradient = ctx.createLinearGradient(0, 0, 1950, 0);
    seaGradient.addColorStop(0, '#0284c7');
    seaGradient.addColorStop(0.7, '#38bdf8');
    seaGradient.addColorStop(0.92, '#7dd3fc');
    seaGradient.addColorStop(1, '#e0f2fe');
    ctx.fillStyle = seaGradient;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1688, 0);
    ctx.bezierCurveTo(1638, 1400, 1638, 1968, 1748, 2248);
    ctx.bezierCurveTo(1820, 2380, 1878, 2468, 1860, 3200);
    ctx.lineTo(1850, 4096);
    ctx.lineTo(0, 4096);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(1688, 0);
    ctx.bezierCurveTo(1638, 1400, 1638, 1968, 1748, 2248);
    ctx.bezierCurveTo(1820, 2380, 1878, 2468, 1860, 3200);
    ctx.lineTo(1850, 4096);
    ctx.stroke();

    const drawLawn = (center: { px: number; py: number }, w: number, h: number, r: number = 20) => {
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      const x = center.px - w / 2;
      const y = center.py - h / 2;
      ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.strokeStyle = '#22c55e';
      ctx.lineWidth = 3;
      ctx.stroke();
    };

    drawLawn(toPx(30, -4), 220, 180, 18);
    drawLawn(toPx(45, 20), 280, 220, 20);
    drawLawn(toPx(-26, 26), 220, 180, 16);
    drawLawn(toPx(-48, -20), 260, 200, 18);
    drawLawn(toPx(6, -30), 200, 160, 16);
    drawLawn(toPx(20, -70), 260, 200, 20);
    drawLawn(toPx(40, -210), 320, 220, 22);
    drawLawn(toPx(195, -30), 320, 220, 22);
    drawLawn(toPx(55, 185), 320, 240, 24);
    drawLawn(toPx(-60, 195), 260, 200, 20);
    drawLawn(toPx(-96, -30), 280, 200, 20);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    const hwyPts = [
      toPx(28, -55), toPx(18, -32), toPx(6, -18), toPx(0, -2),
      toPx(5, 10), toPx(16, 28), toPx(22, 48),
      toPx(26, 65), toPx(28, 95), toPx(34, 135), toPx(42, 170), toPx(48, 190),
    ];
    ctx.moveTo(hwyPts[0].px, hwyPts[0].py);
    for (let i = 1; i < hwyPts.length; i++) ctx.lineTo(hwyPts[i].px, hwyPts[i].py);
    ctx.stroke();

    ctx.beginPath();
    const shirgaonPts = [
      toPx(34, 135), toPx(12, 150), toPx(-15, 170), toPx(-42, 192), toPx(-65, 205),
    ];
    ctx.moveTo(shirgaonPts[0].px, shirgaonPts[0].py);
    for (let i = 1; i < shirgaonPts.length; i++) ctx.lineTo(shirgaonPts[i].px, shirgaonPts[i].py);
    ctx.stroke();

    ctx.beginPath();
    const shirgaonPalgharPts = [
      toPx(-65, 205), toPx(-30, 203), toPx(-5, 200), toPx(22, 195), toPx(48, 190),
    ];
    ctx.moveTo(shirgaonPalgharPts[0].px, shirgaonPalgharPts[0].py);
    for (let i = 1; i < shirgaonPalgharPts.length; i++) ctx.lineTo(shirgaonPalgharPts[i].px, shirgaonPalgharPts[i].py);
    ctx.stroke();

    ctx.beginPath();
    const navPts = [
      toPx(0, -2), toPx(-16, -4), toPx(-30, -10),
      toPx(-48, -16), toPx(-68, -22), toPx(-82, -24), toPx(-96, -24),
    ];
    ctx.moveTo(navPts[0].px, navPts[0].py);
    for (let i = 1; i < navPts.length; i++) ctx.lineTo(navPts[i].px, navPts[i].py);
    ctx.stroke();

    ctx.beginPath();
    const manorPts = [
      toPx(6, -18), toPx(45, -16), toPx(105, -14), toPx(160, -10), toPx(210, -8),
    ];
    ctx.moveTo(manorPts[0].px, manorPts[0].py);
    for (let i = 1; i < manorPts.length; i++) ctx.lineTo(manorPts[i].px, manorPts[i].py);
    ctx.stroke();

    ctx.beginPath();
    const dahanuPts = [
      toPx(28, -55), toPx(30, -110), toPx(31, -165), toPx(32, -220),
    ];
    ctx.moveTo(dahanuPts[0].px, dahanuPts[0].py);
    for (let i = 1; i < dahanuPts.length; i++) ctx.lineTo(dahanuPts[i].px, dahanuPts[i].py);
    ctx.stroke();

    ctx.beginPath();
    const palgharManorPts = [
      toPx(48, 190), toPx(90, 135), toPx(155, 55), toPx(210, -8),
    ];
    ctx.moveTo(palgharManorPts[0].px, palgharManorPts[0].py);
    for (let i = 1; i < palgharManorPts.length; i++) ctx.lineTo(palgharManorPts[i].px, palgharManorPts[i].py);
    ctx.stroke();

    const drawApron = (center: { px: number; py: number }, w: number, h: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.fillRect(center.px - w / 2, center.py - h / 2, w, h);
      ctx.strokeRect(center.px - w / 2, center.py - h / 2, w, h);
    };

    drawApron(toPx(-8, -18), 120, 80);
    drawApron(toPx(-48, -28), 125, 85);
    drawApron(toPx(-48, 22), 120, 85);
    drawApron(toPx(38, 65), 120, 85);
    drawApron(toPx(48, 200), 160, 100);
    drawApron(toPx(-65, 210), 150, 95);
    drawApron(toPx(210, -20), 160, 100);
    drawApron(toPx(36, -220), 140, 90);
    drawApron(toPx(-96, -32), 140, 90);

    drawApron(toPx(-28, 54), 130, 90);
    drawApron(toPx(-48, -65), 130, 90);
    drawApron(toPx(95, 12), 150, 130);
    drawApron(toPx(58, -118), 150, 110);
    drawApron(toPx(-86, -75), 140, 100);
    drawApron(toPx(-36, -82), 130, 75);
    drawApron(toPx(48, 192), 150, 110);
    drawApron(toPx(-65, 202), 140, 100);
    drawApron(toPx(204, -34), 150, 100);

    ctx.strokeStyle = 'rgba(203, 213, 225, 0.4)';
    ctx.lineWidth = 1;
    for (let i = 256; i < 4096; i += 256) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 4096);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(4096, i);
      ctx.stroke();
    }

    ctx.font = '700 24px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('EVNEXUS • PALGHAR DISTRICT DIGITAL TWIN', 1400, 120);
    ctx.fillText('TARAPUR MIDC INDUSTRIAL COMPLEX [C201]', 1550, 2160);
    ctx.fillText('BETEGAON RESIDENTIAL TOWNSHIP & GREEN BELT', 2180, 2180);
    ctx.fillText('PALGHAR DISTRICT ADMINISTRATIVE CAPITAL [P401]', 2080, 2520);
    ctx.fillText('SHIRGAON HISTORIC COAST & BEACH PROMENADE [S801]', 1750, 2540);
    ctx.fillText('MANOR NH-48 EXPRESS GATEWAY [M501]', 2420, 1940);
    ctx.fillText('DAHANU NORTH HIGHWAY & AGRO BELT [D701]', 2050, 1540);
    ctx.fillText('TARAPUR COASTAL ENERGY & ATOMIC ZONE [T601]', 1540, 1920);
    ctx.fillText('SHRI RAM MANDIR HERITAGE PRECINCT', 2150, 1980);
    ctx.font = '16px monospace';
    ctx.fillText('COORDINATES: 19°47\'24.8"N 72°45\'56.6"E (WGS-84)', 1400, 155);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    return texture;
  }, []);

  return (
    <>
      <color attach="background" args={['#edf3f8']} />
      <fog attach="fog" args={['#edf3f8', 260, 950]} />

      <ambientLight intensity={1.1} color="#ffffff" />

      <hemisphereLight args={['#e0f2fe', '#f8fafc', 0.95]} />

      <directionalLight
        position={[60, 110, 50]}
        intensity={1.65}
        color="#fffdf2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={260}
        shadow-camera-left={-90}
        shadow-camera-right={90}
        shadow-camera-top={90}
        shadow-camera-bottom={-90}
        shadow-bias={-0.00015}
        shadow-normalBias={0.025}
      />

      <directionalLight
        position={[-60, 50, -60]}
        intensity={0.4}
        color="#cbd5e1"
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
        <planeGeometry args={[2048, 2048]} />
        <meshStandardMaterial
          map={mapTexture || undefined}
          color={mapTexture ? '#ffffff' : '#f8fafc'}
          roughness={0.88}
          metalness={0.02}
        />
      </mesh>
    </>
  );
}

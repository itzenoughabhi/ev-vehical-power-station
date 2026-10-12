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
      ctx.fillStyle = '#e2fbe8';
      ctx.beginPath();
      const x = center.px - w / 2;
      const y = center.py - h / 2;
      ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.strokeStyle = '#bbf7d0';
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    drawLawn(toPx(55, 15), 180, 140, 16);
    drawLawn(toPx(95, 45), 200, 160, 20);
    drawLawn(toPx(-45, 30), 180, 140, 16);
    drawLawn(toPx(-120, -10), 180, 140, 18);
    drawLawn(toPx(75, -80), 220, 180, 20);
    drawLawn(toPx(60, -180), 240, 180, 22);
    drawLawn(toPx(170, -25), 240, 180, 22);
    drawLawn(toPx(80, 160), 240, 180, 24);
    drawLawn(toPx(-60, 160), 200, 160, 20);
    drawLawn(toPx(-140, -60), 220, 180, 20);

    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const drawRoadPath = (pts: { px: number; py: number }[]) => {
      if (pts.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(pts[0].px, pts[0].py);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].px, pts[i].py);
      ctx.stroke();
    };

    // SH-40 Corridor
    drawRoadPath([
      toPx(32, -60), toPx(20, -40), toPx(12, -18), toPx(0, 0),
      toPx(14, 30), toPx(32, 75), toPx(36, 115), toPx(40, 155), toPx(50, 215),
    ]);

    // Shirgaon Coastal Road
    drawRoadPath([
      toPx(40, 155), toPx(0, 175), toPx(-50, 195), toPx(-95, 215),
    ]);

    // Shirgaon-Palghar Link
    drawRoadPath([
      toPx(-95, 215), toPx(-45, 215), toPx(0, 215), toPx(50, 215),
    ]);

    // Tarapur Coastal Highway
    drawRoadPath([
      toPx(0, 0), toPx(-30, -5), toPx(-60, -10), toPx(-95, -10), toPx(-135, -35), toPx(-170, -65),
    ]);

    // Manor NH-48 Expressway
    drawRoadPath([
      toPx(12, -18), toPx(60, -20), toPx(115, -22), toPx(165, -24), toPx(205, -25),
    ]);

    // Dahanu Northern Highway
    drawRoadPath([
      toPx(32, -60), toPx(34, -115), toPx(35, -175), toPx(35, -230),
    ]);

    // Palghar-Manor Connector
    drawRoadPath([
      toPx(50, 215), toPx(105, 150), toPx(160, 70), toPx(205, -25),
    ]);

    // Tarapur MIDC Industrial Ring
    drawRoadPath([
      toPx(-30, -5), toPx(-50, 35), toPx(-70, 80), toPx(-55, 105), toPx(-30, 125), toPx(-10, 80), toPx(14, 30),
    ]);

    // Substation Feeder Spur
    drawRoadPath([
      toPx(-60, -10), toPx(-55, -50), toPx(-50, -90), toPx(-10, -80), toPx(32, -60),
    ]);

    // Betegaon-Saravali Loop
    drawRoadPath([
      toPx(14, 30), toPx(45, 25), toPx(80, 15), toPx(55, -5), toPx(12, -18),
    ]);

    const drawApron = (center: { px: number; py: number }, w: number, h: number, r: number = 8) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      const x = center.px - w / 2;
      const y = center.py - h / 2;
      ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
      ctx.fill();
      ctx.stroke();
    };

    // Station Aprons - Exactly at well-spaced station coordinates
    drawApron(toPx(26, -40), 72, 54);     // A102
    drawApron(toPx(-95, -25), 68, 54);    // B104
    drawApron(toPx(-85, 80), 72, 58);     // C201
    drawApron(toPx(55, 75), 68, 54);      // D305
    drawApron(toPx(75, 215), 80, 64);     // P401
    drawApron(toPx(-110, 215), 72, 58);   // S801
    drawApron(toPx(220, -25), 80, 64);    // M501
    drawApron(toPx(-185, -65), 72, 58);   // T601
    drawApron(toPx(52, -230), 72, 58);    // D701
    drawApron(toPx(-45, 125), 76, 60);    // S03 Service Center
    drawApron(toPx(-50, -90), 64, 52);    // GRID-S01 Substation

    // Civic Landmarks Aprons
    drawApron(toPx(95, 12), 70, 70);      // Shri Ram Mandir
    drawApron(toPx(58, -118), 70, 56);    // Hospital
    drawApron(toPx(-86, -75), 72, 58);    // Mall
    drawApron(toPx(-36, -82), 68, 52);    // Market

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

    ctx.font = '700 22px monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('EVNEXUS • PALGHAR DISTRICT DIGITAL TWIN', 1400, 120);
    ctx.font = '16px monospace';
    ctx.fillText('COORDINATES: 19°47\'24.8"N 72°45\'56.6"E (WGS-84)', 1400, 155);

    ctx.font = '700 16px monospace';
    ctx.fillStyle = '#475569';
    const drawLabel = (x: number, z: number, text: string) => {
      const p = toPx(x, z);
      ctx.fillText(text, p.px - text.length * 4.5, p.py);
    };

    drawLabel(26, -48, 'BOISAR CENTRAL HUB [A102]');
    drawLabel(-95, -34, 'NAVAPUR ROAD HUB [B104]');
    drawLabel(-185, -74, 'TARAPUR ATOMIC ENERGY HUB [T601]');
    drawLabel(-85, 71, 'TARAPUR MIDC INDUSTRIAL HUB [C201]');
    drawLabel(-45, 134, 'TARAPUR EV SERVICE DIAGNOSTICS [S03]');
    drawLabel(55, 66, 'BOISAR–PALGHAR CORRIDOR [D305]');
    drawLabel(75, 225, 'PALGHAR DISTRICT CENTRAL HUB [P401]');
    drawLabel(-110, 225, 'SHIRGAON BEACH & FORT HUB [S801]');
    drawLabel(220, -34, 'MANOR NH-48 EXPRESS GATEWAY [M501]');
    drawLabel(52, -239, 'DAHANU HIGHWAY & AGRO HUB [D701]');
    drawLabel(95, 22, 'SHRI RAM MANDIR HERITAGE PRECINCT');

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

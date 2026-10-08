'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function CitySky() {
  // WareTrack-inspired Clean Daylight Ground Canvas Texture with Palghar GIS Geography
  const mapTexture = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.scale(0.5, 0.5);

    // 1. WareTrack Crisp Pearl-White / Pale-Slate Facility Ground Base
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, 4096, 4096);

    // Coordinate mapping: 0,0 in 3D is 2048, 2048 in canvas. Scale: 1 unit = 2.0 px
    const toPx = (x: number, z: number) => ({
      px: 2048 + x * 2.0,
      py: 2048 + z * 2.0,
    });

    // 2. Arabian Sea Coastline on the West (Clean vibrant coastal water)
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

    // Coastal surf white line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(1688, 0);
    ctx.bezierCurveTo(1638, 1400, 1638, 1968, 1748, 2248);
    ctx.bezierCurveTo(1820, 2380, 1878, 2468, 1860, 3200);
    ctx.lineTo(1850, 4096);
    ctx.stroke();

    // 3. Stylized Vibrant Green Lawn Zones (WareTrack aesthetic parklands and verges)
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

    // Central Facility & Regional Lawn Islands & Landscaping
    drawLawn(toPx(30, -4), 220, 180, 18);   // Boisar East / Mandir Gardens
    drawLawn(toPx(45, 20), 280, 220, 20);   // Betegaon green belt & residential park
    drawLawn(toPx(-26, 26), 220, 180, 16);  // S03 Service center & MIDC buffer
    drawLawn(toPx(-48, -20), 260, 200, 18); // Tarapur MIDC & B104 green buffer
    drawLawn(toPx(6, -30), 200, 160, 16);   // Boisar Town Centre park
    drawLawn(toPx(20, -70), 260, 200, 20);  // Northern Healthcare & Hospital lawn
    drawLawn(toPx(40, -210), 320, 220, 22); // Dahanu Agro & Coastal chikoo orchard zone
    drawLawn(toPx(195, -30), 320, 220, 22); // Manor NH-48 Express highway buffer
    drawLawn(toPx(55, 185), 320, 240, 24);  // Palghar District Administrative Parklands
    drawLawn(toPx(-60, 195), 260, 200, 20); // Shirgaon Coastal palms & beach buffer
    drawLawn(toPx(-96, -30), 280, 200, 20); // Tarapur Coastal Energy & beach park on dry land

    // 4. Clean Slate Road Corridor Underlays (Smooth contrast with white ground)
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 26;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Boisar-Palghar Highway (SH-40) underlay (Full corridor South to Palghar HQ)
    ctx.beginPath();
    const hwyPts = [
      toPx(28, -55), toPx(18, -32), toPx(6, -18), toPx(-4, -8.5),
      toPx(4.5, 0), toPx(5, 10), toPx(16, 28), toPx(22, 48),
      toPx(26, 65), toPx(28, 95), toPx(34, 135), toPx(42, 170), toPx(48, 200),
    ];
    ctx.moveTo(hwyPts[0].px, hwyPts[0].py);
    for (let i = 1; i < hwyPts.length; i++) ctx.lineTo(hwyPts[i].px, hwyPts[i].py);
    ctx.stroke();

    // Shirgaon Coastal Fort & Beach Road underlay
    ctx.beginPath();
    const shirgaonPts = [
      toPx(34, 135), toPx(12, 150), toPx(-15, 170), toPx(-42, 192), toPx(-65, 210),
    ];
    ctx.moveTo(shirgaonPts[0].px, shirgaonPts[0].py);
    for (let i = 1; i < shirgaonPts.length; i++) ctx.lineTo(shirgaonPts[i].px, shirgaonPts[i].py);
    ctx.stroke();

    // Shirgaon-Palghar Regional Coastal Link underlay
    ctx.beginPath();
    const shirgaonPalgharPts = [
      toPx(-65, 210), toPx(-30, 208), toPx(-5, 205), toPx(22, 202), toPx(48, 200),
    ];
    ctx.moveTo(shirgaonPalgharPts[0].px, shirgaonPalgharPts[0].py);
    for (let i = 1; i < shirgaonPalgharPts.length; i++) ctx.lineTo(shirgaonPalgharPts[i].px, shirgaonPalgharPts[i].py);
    ctx.stroke();

    // Navapur Coastal Highway underlay (Corridor West to Tarapur Coast on dry land)
    ctx.beginPath();
    const navPts = [
      toPx(-4, -8.5), toPx(-12.5, -2), toPx(-16, -4), toPx(-30, -10),
      toPx(-48, -16), toPx(-68, -22), toPx(-82, -28), toPx(-96, -32),
    ];
    ctx.moveTo(navPts[0].px, navPts[0].py);
    for (let i = 1; i < navPts.length; i++) ctx.lineTo(navPts[i].px, navPts[i].py);
    ctx.stroke();

    // Manor NH-48 Expressway underlay (East to Expressway Hub)
    ctx.beginPath();
    const manorPts = [
      toPx(6, -18), toPx(45, -16), toPx(105, -16), toPx(160, -18), toPx(210, -20),
    ];
    ctx.moveTo(manorPts[0].px, manorPts[0].py);
    for (let i = 1; i < manorPts.length; i++) ctx.lineTo(manorPts[i].px, manorPts[i].py);
    ctx.stroke();

    // Dahanu Northern Arterial Highway underlay (North Corridor)
    ctx.beginPath();
    const dahanuPts = [
      toPx(28, -55), toPx(30, -110), toPx(33, -165), toPx(36, -220),
    ];
    ctx.moveTo(dahanuPts[0].px, dahanuPts[0].py);
    for (let i = 1; i < dahanuPts.length; i++) ctx.lineTo(dahanuPts[i].px, dahanuPts[i].py);
    ctx.stroke();

    // Palghar-Manor Regional Connector underlay (Southeast Belt)
    ctx.beginPath();
    const palgharManorPts = [
      toPx(48, 200), toPx(90, 140), toPx(155, 60), toPx(210, -20),
    ];
    ctx.moveTo(palgharManorPts[0].px, palgharManorPts[0].py);
    for (let i = 1; i < palgharManorPts.length; i++) ctx.lineTo(palgharManorPts[i].px, palgharManorPts[i].py);
    ctx.stroke();

    // 5. Crisp Facility Aprons & Civic Plazas (Clean white/pale slate pads)
    const drawApron = (center: { px: number; py: number }, w: number, h: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 3;
      ctx.fillRect(center.px - w / 2, center.py - h / 2, w, h);
      ctx.strokeRect(center.px - w / 2, center.py - h / 2, w, h);
    };

    // Public Charging Hub Aprons (All 9 Regional Stations)
    drawApron(toPx(-8, -18), 120, 80);    // A102 Boisar Central Hub
    drawApron(toPx(-48, -28), 125, 85);   // B104 Navapur Road Hub
    drawApron(toPx(-48, 22), 120, 85);    // C201 MIDC Industrial Hub
    drawApron(toPx(38, 65), 120, 85);     // D305 Boisar-Palghar Corridor
    drawApron(toPx(48, 200), 160, 100);   // P401 Palghar District Central Hub
    drawApron(toPx(-65, 210), 150, 95);   // S801 Shirgaon Beach & Fort Hub
    drawApron(toPx(210, -20), 160, 100);  // M501 Manor NH-48 Express Hub
    drawApron(toPx(36, -220), 140, 90);   // D701 Dahanu Highway Hub
    drawApron(toPx(-96, -32), 140, 90);   // T601 Tarapur Coastal Energy Hub on solid land

    // Civic & Commercial Landmark Plazas (Expanded with ample breathing room)
    drawApron(toPx(-28, 54), 130, 90);    // S03 EV Service Center
    drawApron(toPx(-48, -65), 130, 90);   // GRID-S01 Distribution Substation
    drawApron(toPx(95, 12), 150, 130);    // Shri Ram Mandir Heritage Sacred Courtyard
    drawApron(toPx(58, -118), 150, 110);  // Boisar Multi-Specialty Hospital Campus
    drawApron(toPx(-86, -75), 140, 100);  // Boisar Grand Central Mall
    drawApron(toPx(-36, -82), 130, 75);   // Boisar Station Bazaar & Market
    drawApron(toPx(48, 192), 150, 110);   // Palghar District Administrative Plaza
    drawApron(toPx(-65, 202), 140, 100);  // Shirgaon Historic Fort Plaza
    drawApron(toPx(204, -34), 150, 100);  // Manor Transit & Express Logistics Plaza

    // 6. Subtle Modern Architectural Grid
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

    // High-tech Regional GIS Typography Labels Across the Full District
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
      {/* WareTrack Pure Crisp Daylight Atmosphere */}
      <color attach="background" args={['#edf3f8']} />
      <fog attach="fog" args={['#edf3f8', 260, 950]} />

      {/* Balanced Pure Ambient Daylight Illumination */}
      <ambientLight intensity={1.1} color="#ffffff" />

      {/* Sky to Ground Natural Reflection */}
      <hemisphereLight args={['#e0f2fe', '#f8fafc', 0.95]} />

      {/* Primary Sunlight with Crisp Soft Contact Shadows */}
      <directionalLight
        position={[80, 120, 60]}
        intensity={1.75}
        color="#fffdf2"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={450}
        shadow-camera-left={-220}
        shadow-camera-right={220}
        shadow-camera-top={220}
        shadow-camera-bottom={-220}
        shadow-bias={-0.00012}
      />

      {/* Soft Northern Fill Light */}
      <directionalLight
        position={[-60, 50, -60]}
        intensity={0.4}
        color="#cbd5e1"
      />

      {/* WareTrack Pearl-White / Pale-Slate Ground Floor */}
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

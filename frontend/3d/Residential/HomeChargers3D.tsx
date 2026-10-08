'use client';

import React, { Suspense } from 'react';
import { useGLTF, Clone, Html } from '@react-three/drei';
import { useDigitalTwinStore } from '../../store/useDigitalTwinStore';
import { HomeCharger } from '../../types';

function HouseWithDrivewayModel({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  const { scene } = useGLTF('/models/city/house.glb');

  React.useEffect(() => {
    scene.traverse((child: any) => {
      if (child.isMesh && child.geometry && !child.geometry.attributes.normal) {
        child.geometry.computeVertexNormals();
      }
    });
  }, [scene]);

  return (
    <group position={position} rotation={rotation} scale={[0.26, 0.26, 0.26]}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  );
}

function ParkedCarModel({ model, position, rotation = [0, 0, 0] }: { model?: string; position: [number, number, number]; rotation?: [number, number, number] }) {
  const path = model === 'Tata Nexon EV' ? '/models/vehicles/suv.glb' : '/models/vehicles/car_sedan.glb';
  const { scene } = useGLTF(path);
  return (
    <group position={position} rotation={rotation} scale={[0.65, 0.65, 0.65]}>
      <Clone object={scene} castShadow receiveShadow />
    </group>
  );
}

function HomeChargerItem({ hc }: { hc: HomeCharger }) {
  const selectHomeCharger = useDigitalTwinStore((s) => s.selectHomeCharger);
  const selectedObject = useDigitalTwinStore((s) => s.selectedObject);
  const isSelected = selectedObject?.type === 'homeCharger' && selectedObject.id === hc.homeId;

  return (
    <group
      position={[hc.position.x, 0, hc.position.z]}
      onClick={(e) => {
        e.stopPropagation();
        selectHomeCharger(hc.homeId);
      }}
    >
      {/* House with Driveway model accurately scaled */}
      <Suspense fallback={null}>
        <HouseWithDrivewayModel position={[0, 0, 0]} rotation={[0, -Math.PI / 4, 0]} />
      </Suspense>

      {/* Driveway Concrete Slab */}
      <mesh position={[1.8, 0.04, 1.2]} receiveShadow>
        <boxGeometry args={[2.4, 0.08, 4.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>

      {/* Wall-mounted Home Charger Wallbox (7.2 kW AC Charger) */}
      <group position={[0.7, 1.1, 0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.24, 0.38, 0.16]} />
          <meshStandardMaterial color="#1e293b" metalness={0.4} />
        </mesh>
        {/* LED Indicator Light */}
        <mesh position={[0, 0.06, 0.09]}>
          <circleGeometry args={[0.035, 16]} />
          <meshBasicMaterial color={hc.status === 'CHARGING' ? '#10b981' : '#38bdf8'} />
        </mesh>
        {/* Charging Cable coiled to parked car */}
        <mesh position={[0.3, -0.4, 0.4]}>
          <cylinderGeometry args={[0.02, 0.02, 1.0, 6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      </group>

      {/* Parked EV in driveway charging */}
      <Suspense fallback={null}>
        <ParkedCarModel
          model={hc.connectedEvModel}
          position={[1.8, 0.05, 1.2]}
          rotation={[0, 0.2, 0]}
        />
      </Suspense>

      {/* Selection Ring */}
      {isSelected && (
        <mesh position={[0, 0.06, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.8, 3.2, 32]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
      )}

      {/* 3D Floating Pin Badge */}
      <Html position={[1.8, 2.2, 1.2]} center distanceFactor={26} zIndexRange={[100, 0]}>
        <div
          onClick={(e) => {
            e.stopPropagation();
            selectHomeCharger(hc.homeId);
          }}
          className={`cursor-pointer px-2 py-0.5 rounded-full border backdrop-blur-md transition-all select-none text-[10px] font-medium flex items-center gap-1 shadow-sm ${
            isSelected
              ? 'bg-blue-600 text-white border-blue-400 ring-2 ring-blue-300'
              : 'bg-white/95 text-slate-800 border-slate-200 hover:border-blue-400'
          }`}
          style={{ whiteSpace: 'nowrap' }}
        >
          <span>🏠</span>
          <span>{hc.homeId}</span>
          <span className="text-[9px] font-mono text-emerald-600 font-semibold">
            ⚡ {hc.batteryPct}%
          </span>
        </div>
      </Html>
    </group>
  );
}

export function HomeChargers3D() {
  const homeChargers = useDigitalTwinStore((s) => s.homeChargers);

  return (
    <group name="HomeChargersLayer">
      {homeChargers.map((hc) => (
        <HomeChargerItem key={hc.homeId} hc={hc} />
      ))}
    </group>
  );
}

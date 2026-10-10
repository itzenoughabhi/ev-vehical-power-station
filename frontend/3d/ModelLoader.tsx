'use client';

import React, { Suspense } from 'react';
import { useGLTF, Clone } from '@react-three/drei';

interface GLBModelProps {
  path: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
  castShadow?: boolean;
  receiveShadow?: boolean;
  onClick?: (e: any) => void;
  onPointerOver?: (e: any) => void;
  onPointerOut?: (e: any) => void;
}

function InnerGLBModel({
  path,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
  castShadow = true,
  receiveShadow = true,
  onClick,
  onPointerOver,
  onPointerOut,
}: GLBModelProps) {
  const { scene } = useGLTF(path);

  return (
    <group
      position={position}
      rotation={rotation}
      scale={typeof scale === 'number' ? [scale, scale, scale] : scale}
      onClick={onClick}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
    >
      <Clone object={scene} castShadow={castShadow} receiveShadow={receiveShadow} />
    </group>
  );
}

export function GLBModel(props: GLBModelProps) {
  return (
    <Suspense fallback={null}>
      <InnerGLBModel {...props} />
    </Suspense>
  );
}

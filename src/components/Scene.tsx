"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Points, PointMaterial } from "@react-three/drei";

const Scene = () => {
  const count = 5000;
  const [positions] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 10;
    }
    return [positions];
  }, [count]);

  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 75 }}
      gl={{ antialias: false }}
      dpr={[1, 1.5]}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#111111",
      }}
    >
      <Points positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#6699ff"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;

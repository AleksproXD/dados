import React, { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber/native';
import { useGLTF } from '@react-three/drei/native';
import * as THREE from 'three';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import type { GLTF } from 'three-stdlib';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

interface DiceModelProps {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

type GLTFResult = GLTF & {
  nodes: Record<string, THREE.Mesh>;
  materials: Record<string, THREE.Material>;
};

function DiceModel({ value, isRolling, onRollComplete }: DiceModelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(require('../../assets/3d/Dice.glb')) as unknown as GLTFResult;
  const rotationVelocity = useRef({ x: 0, y: 0, z: 0 });
  const targetRotation = useRef<THREE.Euler>(new THREE.Euler(0, 0, 0));
  const isTransitioning = useRef(false);

  // Rotaciones para cada cara del dado (ajustadas para tu modelo)
  const rotations: { [key: number]: [number, number, number] } = {
    1: [0, 0, 0],                    // Cara 1 al frente
    2: [0, Math.PI / 2, 0],          // Cara 2 (rotar 90° en Y)
    3: [0, Math.PI, 0],              // Cara 3 (rotar 180° en Y)
    4: [0, -Math.PI / 2, 0],         // Cara 4 (rotar -90° en Y)
    5: [Math.PI / 2, 0, 0],          // Cara 5 (rotar 90° en X)
    6: [-Math.PI / 2, 0, 0],         // Cara 6 (rotar -90° en X)
  };

  // Inicializar el modelo
  useEffect(() => {
    if (gltf?.scene && groupRef.current) {
      // Centrar el modelo
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      gltf.scene.position.set(-center.x, -center.y, -center.z);
      
      // Escalar - MÁS PEQUEÑO para que se vea mejor
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 1.8 / maxDim; // Reducido de 2.5 a 1.8
      groupRef.current.scale.setScalar(scale);
      
      console.log('✅ Modelo cargado y configurado');
      console.log('📏 Tamaño:', size);
      console.log('🔍 Escala:', scale);
    }
  }, [gltf]);

  // Manejar el cambio de valor
  useEffect(() => {
    if (!isRolling && groupRef.current) {
      const [x, y, z] = rotations[value];
      targetRotation.current = new THREE.Euler(x, y, z);
      isTransitioning.current = true;
    }
  }, [value, isRolling]);

  // Manejar finalización del lanzamiento
  useEffect(() => {
    if (isRolling && groupRef.current) {
      // Iniciar velocidad de rotación aleatoria
      rotationVelocity.current = {
        x: (Math.random() - 0.5) * 0.4,
        y: (Math.random() - 0.5) * 0.4,
        z: (Math.random() - 0.5) * 0.4,
      };
      
      // Llamar onRollComplete después de que termine la animación
      const timer = setTimeout(() => {
        console.log('⏱️ Timer completado, llamando onRollComplete');
        if (onRollComplete) {
          onRollComplete();
        }
      }, 1500); // 1.5 segundos de animación
      
      return () => clearTimeout(timer);
    }
  }, [isRolling, onRollComplete]);

  // Animación de cada frame
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isRolling) {
      // Rotación rápida mientras se lanza
      groupRef.current.rotation.x += rotationVelocity.current.x;
      groupRef.current.rotation.y += rotationVelocity.current.y;
      groupRef.current.rotation.z += rotationVelocity.current.z;
      
      // Reducir velocidad gradualmente
      rotationVelocity.current.x *= 0.98;
      rotationVelocity.current.y *= 0.98;
      rotationVelocity.current.z *= 0.98;
    } else if (isTransitioning.current) {
      // Transición suave a la rotación objetivo
      const lerpFactor = 0.15;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(
        groupRef.current.rotation.x,
        targetRotation.current.x,
        lerpFactor
      );
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation.current.y,
        lerpFactor
      );
      groupRef.current.rotation.z = THREE.MathUtils.lerp(
        groupRef.current.rotation.z,
        targetRotation.current.z,
        lerpFactor
      );

      // Verificar si llegamos al objetivo
      const diffX = Math.abs(groupRef.current.rotation.x - targetRotation.current.x);
      const diffY = Math.abs(groupRef.current.rotation.y - targetRotation.current.y);
      const diffZ = Math.abs(groupRef.current.rotation.z - targetRotation.current.z);
      
      if (diffX < 0.01 && diffY < 0.01 && diffZ < 0.01) {
        groupRef.current.rotation.set(
          targetRotation.current.x,
          targetRotation.current.y,
          targetRotation.current.z
        );
        isTransitioning.current = false;
      }
    }
  });

  if (!gltf?.scene) {
    console.warn('⚠️ Modelo no cargado aún');
    return null;
  }

  return (
    <group ref={groupRef}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function LoadingFallback() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01;
      meshRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  );
}

export default function Dice3D({ value, isRolling, onRollComplete }: Dice3DProps) {
  return (
    <View style={styles.container}>
      <Canvas
        camera={{ 
          position: [0, 0, 10], // Aumentado de 7 a 10 para alejar más
          fov: 45, // Reducido de 50 a 45 para menos distorsión
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true,
          alpha: true,
        }}
      >
        {/* Iluminación mejorada */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
        <directionalLight position={[-5, -5, -5]} intensity={0.5} />
        <pointLight position={[0, 0, 5]} intensity={0.8} />
        
        <Suspense fallback={<LoadingFallback />}>
          <DiceModel 
            value={value} 
            isRolling={isRolling}
            onRollComplete={onRollComplete}
          />
        </Suspense>
      </Canvas>
      
      {isRolling && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#00d4ff" />
        </View>
      )}
    </View>
  );
}

// Precargar el modelo
useGLTF.preload(require('../../assets/3d/Dice.glb'));

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    position: 'absolute',
    bottom: 10,
    right: 10,
  },
});
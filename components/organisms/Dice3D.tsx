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
  const rollCompleted = useRef(false);

  // Rotaciones corregidas para cada cara del dado
  // Estas rotaciones están calibradas para que el número visible coincida con el value
  const rotations: { [key: number]: [number, number, number] } = {
    1: [0, 0, 0],                           // Cara 1 frontal
    6: [Math.PI, 0, 0],                     // Cara 6 opuesta a 1
    2: [0, -Math.PI / 2, 0],                // Cara 2 derecha
    5: [0, Math.PI / 2, 0],                 // Cara 5 izquierda
    3: [Math.PI / 2, 0, 0],                 // Cara 3 arriba
    4: [-Math.PI / 2, 0, 0],                // Cara 4 abajo
  };

  // Inicializar el modelo SOLO UNA VEZ
  useEffect(() => {
    if (gltf?.scene && groupRef.current && !groupRef.current.userData.initialized) {
      // Centrar el modelo en el origen
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      
      // Centrar exactamente en el origen para rotación correcta
      gltf.scene.position.set(-center.x, -center.y, -center.z);
      
      // Escalar apropiadamente - no muy grande
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2.2 / maxDim;
      groupRef.current.scale.setScalar(scale);
      
      // Posición inicial del dado (cara 1 visible)
      groupRef.current.rotation.set(0, 0, 0);
      
      // Marcar como inicializado
      groupRef.current.userData.initialized = true;
      
      console.log('✅ Dado inicializado correctamente');
      console.log('📏 Dimensiones:', size);
      console.log('🎯 Centro:', center);
      console.log('🔍 Escala aplicada:', scale);
    }
  }, [gltf]);

  // Manejar inicio del lanzamiento
  useEffect(() => {
    if (isRolling && groupRef.current) {
      rollCompleted.current = false;
      
      // Velocidad de rotación aleatoria fuerte
      rotationVelocity.current = {
        x: (Math.random() - 0.5) * 0.6,
        y: (Math.random() - 0.5) * 0.6,
        z: (Math.random() - 0.5) * 0.6,
      };
      
      console.log('🎲 Iniciando lanzamiento con velocidad:', rotationVelocity.current);
    }
  }, [isRolling]);

  // Manejar cambio de valor (después del lanzamiento)
  useEffect(() => {
    if (!isRolling && groupRef.current && !rollCompleted.current) {
      const [x, y, z] = rotations[value];
      targetRotation.current = new THREE.Euler(x, y, z);
      isTransitioning.current = true;
      rollCompleted.current = true;
      
      console.log(`🎯 Transicionando a cara ${value}:`, { x, y, z });
    }
  }, [value, isRolling]);

  // Animación de cada frame
  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isRolling) {
      // Rotación rápida mientras se lanza - ALREDEDOR DEL CENTRO
      groupRef.current.rotation.x += rotationVelocity.current.x;
      groupRef.current.rotation.y += rotationVelocity.current.y;
      groupRef.current.rotation.z += rotationVelocity.current.z;
      
      // Reducir velocidad gradualmente
      rotationVelocity.current.x *= 0.97;
      rotationVelocity.current.y *= 0.97;
      rotationVelocity.current.z *= 0.97;
      
      // Llamar onRollComplete cuando la velocidad sea muy baja
      const totalVelocity = Math.abs(rotationVelocity.current.x) + 
                           Math.abs(rotationVelocity.current.y) + 
                           Math.abs(rotationVelocity.current.z);
      
      if (totalVelocity < 0.05 && onRollComplete) {
        console.log('⏱️ Velocidad baja, finalizando lanzamiento');
        onRollComplete();
      }
    } else if (isTransitioning.current) {
      // Transición suave a la rotación objetivo
      const lerpFactor = 0.12;
      
      // Interpolar cada eje de rotación
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
        // Forzar rotación exacta
        groupRef.current.rotation.set(
          targetRotation.current.x,
          targetRotation.current.y,
          targetRotation.current.z
        );
        isTransitioning.current = false;
        console.log('✅ Transición completada');
      }
    }
  });

  if (!gltf?.scene) {
    console.warn('⚠️ Modelo no cargado aún');
    return null;
  }

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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
          position: [0, 0, 8],      // Distancia óptima
          fov: 50,                   // Campo de visión balanceado
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true,
          alpha: true,
        }}
      >
        {/* Iluminación optimizada para ver bien el dado */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} castShadow />
        <directionalLight position={[-3, -3, 3]} intensity={0.4} />
        <pointLight position={[0, 0, 5]} intensity={0.6} />
        
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
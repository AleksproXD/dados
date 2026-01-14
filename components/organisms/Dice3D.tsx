import React, { useRef, useEffect, Suspense, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { Asset } from 'expo-asset';
import { GLTF } from 'three-stdlib';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

type GLTFResult = GLTF & {
  nodes: any;
  materials: any;
};

function DiceModel({ value, isRolling, modelUri }: { value: number; isRolling: boolean; modelUri: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const gltf = useGLTF(modelUri) as GLTFResult;
  const { gl } = useThree();
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    gl.setPixelRatio(1);
  }, [gl]);

  const rotations: { [key: number]: [number, number, number] } = {
    1: [0, 0, 0],
    2: [0, -Math.PI / 2, 0],
    3: [0, Math.PI, 0],
    4: [0, Math.PI / 2, 0],
    5: [-Math.PI / 2, 0, 0],
    6: [Math.PI / 2, 0, 0],
  };

  useEffect(() => {
    if (gltf.scene && groupRef.current && !initialized) {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      
      console.log('📦 Tamaño:', size);
      console.log('📍 Centro:', center);
      
      // CENTRAR completamente
      gltf.scene.position.set(-center.x, -center.y, -center.z);
      
      // ESCALA GIGANTE para que se vea
      const maxDim = Math.max(size.x, size.y, size.z);
      const targetSize = 3.5; // Tamaño grande
      const scale = targetSize / maxDim;
      
      console.log('🎯 Escala:', scale);
      
      groupRef.current.scale.setScalar(scale);
      
      setInitialized(true);
    }
  }, [gltf, initialized]);

  useEffect(() => {
    if (groupRef.current && !isRolling && initialized) {
      const targetRotation = rotations[value];
      groupRef.current.rotation.set(...targetRotation);
      console.log(`🎲 Cara ${value}`);
    }
  }, [value, isRolling, initialized]);

  useFrame(() => {
    if (groupRef.current && isRolling) {
      groupRef.current.rotation.x += 0.2;
      groupRef.current.rotation.y += 0.15;
      groupRef.current.rotation.z += 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

function LoadingDice() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.02;
      meshRef.current.rotation.y += 0.02;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[3, 3, 3]} />
      <meshStandardMaterial color="#00d4ff" />
    </mesh>
  );
}

export default function Dice3D({ value, isRolling, onRollComplete }: Dice3DProps) {
  const [modelUri, setModelUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        const asset = Asset.fromModule(require('../../assets/3d/Dice.glb'));
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        if (uri) {
          setModelUri(uri);
        } else {
          setError('No se pudo cargar');
        }
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar');
      }
    };

    loadModel();
  }, []);

  useEffect(() => {
    if (isRolling) {
      const timer = setTimeout(() => {
        if (onRollComplete) {
          onRollComplete();
        }
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isRolling, onRollComplete]);

  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (!modelUri) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#00d4ff" />
        <Text style={styles.loadingText}>Cargando dado...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Canvas
        camera={{ 
          position: [0, 0, 8],
          fov: 55,
          near: 0.1,
          far: 100
        }}
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
      >
        <ambientLight intensity={1.2} />
        <directionalLight position={[8, 8, 8]} intensity={1.8} />
        <directionalLight position={[-4, -4, -4]} intensity={0.6} />
        <pointLight position={[0, 0, 6]} intensity={1} />
        
        <Suspense fallback={<LoadingDice />}>
          <DiceModel value={value} isRolling={isRolling} modelUri={modelUri} />
        </Suspense>
      </Canvas>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 300,
    height: 300,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#00d4ff',
    fontSize: 14,
    marginTop: 10,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 20,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 14,
    textAlign: 'center',
    padding: 20,
  },
});
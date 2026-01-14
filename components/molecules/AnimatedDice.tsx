import React, { useRef, useEffect } from 'react';
import { Animated } from 'react-native';
import Dice from '../atoms/Dice';

interface AnimatedDiceProps {
  value: number;
  isRolling: boolean;
  onRollComplete?: () => void;
}

export default function AnimatedDice({ value, isRolling, onRollComplete }: AnimatedDiceProps) {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRolling) {
      // Reiniciar valores
      rotateAnim.setValue(0);
      
      Animated.parallel([
        // Animación de escala (rebote)
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            friction: 3,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true,
          }),
        ]),
        // Animación de rotación (2 vueltas completas)
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        // Animación de opacidad (parpadeo)
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 0.3,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        if (onRollComplete) {
          onRollComplete();
        }
      });
    }
  }, [isRolling]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <Animated.View
      style={{
        transform: [
          { rotate: spin },
          { scale: scaleAnim },
        ],
        opacity: opacityAnim,
      }}
    >
      <Dice value={value} />
    </Animated.View>
  );
}
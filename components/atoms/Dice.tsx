import React from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';

const { width } = Dimensions.get('window');
const DICE_SIZE = width * 0.6;

interface DiceProps {
  value: number;
}

type DotPosition = 'topLeft' | 'topRight' | 'middleLeft' | 'center' | 'middleRight' | 'bottomLeft' | 'bottomRight';

export default function Dice({ value }: DiceProps) {
  return (
    <View style={styles.dice}>
      <View style={styles.dotsContainer}>
        {renderDots(value)}
      </View>
    </View>
  );
}

function renderDots(number: number) {
  const dotPositions: { [key: number]: DotPosition[] } = {
    1: ['center'],
    2: ['topLeft', 'bottomRight'],
    3: ['topLeft', 'center', 'bottomRight'],
    4: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
    5: ['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'],
    6: ['topLeft', 'topRight', 'middleLeft', 'middleRight', 'bottomLeft', 'bottomRight'],
  };

  const positionStyles: Record<DotPosition, ViewStyle> = {
    topLeft: styles.topLeft,
    topRight: styles.topRight,
    middleLeft: styles.middleLeft,
    center: styles.center,
    middleRight: styles.middleRight,
    bottomLeft: styles.bottomLeft,
    bottomRight: styles.bottomRight,
  };

  return (
    <>
      {dotPositions[number].map((position, index) => (
        <View key={index} style={[styles.dot, positionStyles[position]]} />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  dice: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    backgroundColor: '#f0f0f0',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  dotsContainer: {
    flex: 1,
    padding: 20,
  },
  dot: {
    position: 'absolute',
    width: DICE_SIZE * 0.15,
    height: DICE_SIZE * 0.15,
    borderRadius: DICE_SIZE * 0.075,
    backgroundColor: '#1a1a2e',
  },
  topLeft: { top: '15%', left: '15%' },
  topRight: { top: '15%', right: '15%' },
  middleLeft: { top: '42.5%', left: '15%' },
  center: { top: '42.5%', left: '42.5%' },
  middleRight: { top: '42.5%', right: '15%' },
  bottomLeft: { bottom: '15%', left: '15%' },
  bottomRight: { bottom: '15%', right: '15%' },
});
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SensorService } from '@/lib/modules/sensors/accelerometer/accelerometer.service';
import { isShaking } from '@/lib/core/logic/motion';
import AnimatedDice from '@/components/molecules/AnimatedDice';
import ScoreDisplay from '@/components/atoms/ScoreDisplay';
import InstructionText from '@/components/atoms/InstructionText';

export default function Index() {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isRolling, setIsRolling] = useState(false);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);

    let counter = 0;
    const interval = setInterval(() => {
      setCurrentNumber(Math.floor(Math.random() * 6) + 1);
      counter++;
      if (counter > 8) {
        clearInterval(interval);
        setCurrentNumber(Math.floor(Math.random() * 6) + 1);
      }
    }, 80);
  };

  const handleRollComplete = () => {
    setIsRolling(false);
  };

  useEffect(() => {
    const subscription = SensorService.subscribe((data) => {
      if (isShaking(data) && !isRolling) {
        rollDice();
      }
    });

    return () => SensorService.unsubscribe(subscription);
  }, [isRolling]);

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <ScoreDisplay score={currentNumber} />
      </View>

      <View style={styles.diceContainer}>
        <AnimatedDice 
          value={currentNumber} 
          isRolling={isRolling}
          onRollComplete={handleRollComplete}
        />
      </View>

      <View style={styles.instructionContainer}>
        <InstructionText isRolling={isRolling} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  scoreContainer: {
    position: 'absolute',
    top: 100,
  },
  diceContainer: {
    marginVertical: 40,
  },
  instructionContainer: {
    position: 'absolute',
    bottom: 80,
  },
});
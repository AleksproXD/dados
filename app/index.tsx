import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { SensorService } from '@/lib/modules/sensors/accelerometer/accelerometer.service';
import { isShaking } from '@/lib/core/logic/motion';
import Dice3D from '@/components/organisms/Dice3D';
import ScoreDisplay from '@/components/atoms/ScoreDisplay';
import InstructionText from '@/components/atoms/InstructionText';

export default function Index() {
  const [currentNumber, setCurrentNumber] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [canRoll, setCanRoll] = useState(true);

  const rollDice = useCallback(() => {
    if (!canRoll || isRolling) {
      console.log('⛔ No se puede lanzar ahora');
      return;
    }
    
    console.log('🎲 Iniciando lanzamiento...');
    setIsRolling(true);
    setCanRoll(false);

    // Generar número aleatorio inmediatamente
    const newNumber = Math.floor(Math.random() * 6) + 1;
    console.log('🎯 Número generado:', newNumber);
    
    // Actualizar el número después de un breve delay para sincronizar con la animación
    setTimeout(() => {
      setCurrentNumber(newNumber);
    }, 600);
  }, [canRoll, isRolling]);

  const handleRollComplete = useCallback(() => {
    console.log('✅ Lanzamiento completado - deteniendo animación');
    setIsRolling(false);
    
    // Permitir otro lanzamiento después de un pequeño delay
    setTimeout(() => {
      console.log('🟢 Listo para otro lanzamiento');
      setCanRoll(true);
    }, 800);
  }, []);

  // Escuchar el acelerómetro
  useEffect(() => {
    const subscription = SensorService.subscribe((data) => {
      if (isShaking(data) && canRoll && !isRolling) {
        console.log('📱 Sacudida detectada!');
        rollDice();
      }
    });

    return () => SensorService.unsubscribe(subscription);
  }, [canRoll, isRolling, rollDice]);

  return (
    <View style={styles.container}>
      <View style={styles.scoreContainer}>
        <ScoreDisplay score={currentNumber} />
      </View>

      <View style={styles.diceContainer}>
        <Dice3D 
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
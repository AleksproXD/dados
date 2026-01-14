import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface InstructionTextProps {
  isRolling: boolean;
}

export default function InstructionText({ isRolling }: InstructionTextProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons 
        name={isRolling ? "dice-multiple" : "cellphone-wireless"} 
        size={28} 
        color="#00d4ff" 
      />
      <Text style={styles.instruction}>
        {isRolling ? 'Lanzando...' : 'Sacude para lanzar'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instruction: {
    fontSize: 20,
    color: '#00d4ff',
    fontWeight: '600',
  },
});
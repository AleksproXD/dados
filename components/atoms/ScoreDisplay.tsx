import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreDisplayProps {
  score: number;
}

export default function ScoreDisplay({ score }: ScoreDisplayProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.score}>{score}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 20,
    padding: 20,
    minWidth: 100,
    alignItems: 'center',
    shadowColor: '#00d4ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  score: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#00d4ff',
  },
});
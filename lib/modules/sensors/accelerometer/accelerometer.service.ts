import { Accelerometer } from 'expo-sensors';

export const SensorService = {
  // Método para iniciar la escucha del hardware
  subscribe: (callback: (data: any) => void) => {
    Accelerometer.setUpdateInterval(100); // 100ms = 10fps (suficiente para UI)
    return Accelerometer.addListener(callback);
  },

  // Limpieza para evitar memory leaks
  unsubscribe: (subscription: any) => {
    if (subscription) subscription.remove();
  }
};
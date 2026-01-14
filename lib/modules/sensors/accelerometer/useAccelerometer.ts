import { useEffect } from 'react';
import { SensorService } from './accelerometer.service';

export const useAccelerometer = (onShake: () => void) => {
  useEffect(() => {
    const subscription = SensorService.subscribe((data) => {
      
      onShake();
    });

    return () => SensorService.unsubscribe(subscription);
  }, [onShake]);
};
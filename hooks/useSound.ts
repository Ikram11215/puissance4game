import { useEffect, useState } from 'react';
import { soundEngine } from '@/lib/sounds/soundEngine';

export function useSound() {
  const [enabled, setEnabled] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('soundsEnabled');
    if (saved !== null) {
      const isEnabled = saved === 'true';
      setEnabled(isEnabled);
      soundEngine.setEnabled(isEnabled);
    }
  }, []);

  const toggleSounds = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    localStorage.setItem('soundsEnabled', String(newValue));
    soundEngine.setEnabled(newValue);
  };

  return {
    enabled,
    toggleSounds,
    playDrop: () => soundEngine.playDrop(),
    playWin: () => soundEngine.playWin(),
    playLose: () => soundEngine.playLose(),
    playDraw: () => soundEngine.playDraw(),
    playGameStart: () => soundEngine.playGameStart(),
    playNotification: () => soundEngine.playNotification(),
    playClick: () => soundEngine.playClick(),
    playError: () => soundEngine.playError(),
  };
}


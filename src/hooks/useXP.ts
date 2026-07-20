import { useCallback } from 'react';
import { XPHistory } from '../types';

interface UseXPProps {
  currentXP: number;
  currentLevel: number;
  xpHistory: XPHistory[];
  setCurrentXP: (val: number) => void;
  setCurrentLevel: (val: number) => void;
  setXpHistory: (val: XPHistory[]) => void;
  playMilestonePing: () => void;
  speakVoiceAnnouncement: (text: string) => void;
}

export function useXP({
  currentXP,
  currentLevel,
  xpHistory,
  setCurrentXP,
  setCurrentLevel,
  setXpHistory,
  playMilestonePing,
  speakVoiceAnnouncement
}: UseXPProps) {

  const handleAwardXP = useCallback((amount: number) => {
    // Record history
    const today = new Date().toISOString().slice(0, 10);
    const existing = xpHistory.find(p => p.date === today);
    if (existing) {
      setXpHistory(xpHistory.map(p => p.date === today ? { ...p, xp: p.xp + amount } : p));
    } else {
      setXpHistory([...xpHistory, { date: today, xp: amount }]);
    }

    let nextXP = currentXP + amount;
    let nextLevel = currentLevel;
    const threshold = nextLevel * 500;

    if (nextXP >= threshold) {
      nextXP -= threshold;
      nextLevel += 1;
      setCurrentLevel(nextLevel);
      playMilestonePing();
      
      setTimeout(() => {
        speakVoiceAnnouncement(`Congratulations. Performance milestone crossed. You have leveled up to Level ${nextLevel}!`);
        alert(`👑 LEVEL UP! You are now Level ${nextLevel}!`);
      }, 100);
    } else if (nextXP < 0) {
      nextXP = 0;
    }

    setCurrentXP(nextXP);
  }, [currentLevel, currentXP, xpHistory, setXpHistory, setCurrentLevel, setCurrentXP, playMilestonePing, speakVoiceAnnouncement]);

  return { handleAwardXP };
}

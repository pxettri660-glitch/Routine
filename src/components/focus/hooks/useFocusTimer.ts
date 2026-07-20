import { useState, useEffect } from 'react';
import { FocusSession } from '../../../types';

export function useFocusTimer(
  mode: 'pomodoro' | 'stopwatch',
  focusSessions: FocusSession[],
  setFocusSessions: (val: FocusSession[]) => void,
  onAwardXP?: (amount: number) => void
) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const finishSession = (durationSeconds: number) => {
    if (durationSeconds <= 0 || !startTime) return;
    const now = Date.now();
    const newSession: FocusSession = {
      id: now.toString(),
      startTime: startTime,
      endTime: now,
      duration: durationSeconds,
      date: new Date().toISOString().split('T')[0],
      category: mode === 'pomodoro' ? 'Pomodoro' : 'Stopwatch',
      deviceTimestamp: now,
    };
    
    setFocusSessions([...focusSessions, newSession]);
    setStartTime(null);
    if (onAwardXP) onAwardXP(Math.floor(durationSeconds / 60) * 2); 
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive) {
      if (!startTime) setStartTime(Date.now());

      if (mode === 'pomodoro' && timeLeft > 0) {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev - 1);
        }, 1000);
      } else if (mode === 'stopwatch') {
        interval = setInterval(() => {
          setTimeLeft((prev) => prev + 1);
        }, 1000);
      } else if (mode === 'pomodoro' && timeLeft === 0) {
        setIsActive(false);
        finishSession(25 * 60);
        if (isFullscreen && document.fullscreenElement) document.exitFullscreen();
        setIsFullscreen(false);
        alert('Focus session completed!');
      }
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, onAwardXP, isFullscreen, startTime, focusSessions, setFocusSessions]);

  const toggleTimer = async () => {
    if (!isActive && !isFullscreen) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.warn("Fullscreen API failed", err);
      }
      setIsActive(true);
    } else if (isActive) {
      if (isFullscreen) {
        try {
          if (document.fullscreenElement) await document.exitFullscreen();
          setIsFullscreen(false);
        } catch (err) {
          console.warn("Fullscreen exit failed", err);
        }
      }
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  };

  const resetTimer = async () => {
    if (mode === 'stopwatch' && startTime) {
      const duration = Math.floor((Date.now() - startTime) / 1000);
      finishSession(duration);
    }
    setIsActive(false);
    setStartTime(null);
    setTimeLeft(mode === 'pomodoro' ? 25 * 60 : 0);
    if (isFullscreen) {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  return {
    timeLeft,
    setTimeLeft,
    isActive,
    isFullscreen,
    toggleTimer,
    resetTimer,
    formatTime
  };
}

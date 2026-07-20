import { useMemo } from 'react';
import { FocusSession } from '../../../types';

export function useFocusStats(sessions: FocusSession[]) {
  return useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = yesterdayDate.toISOString().split('T')[0];
    
    let todayTime = 0, yesterdayTime = 0, last7DaysTime = 0, last30DaysTime = 0, monthlyTime = 0, yearlyTime = 0;
    let totalTime = 0;
    let longestSession = 0;
    
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    sessions.forEach(s => {
      const sDate = new Date(s.date);
      const d = s.duration;
      totalTime += d;
      
      if (d > longestSession) longestSession = d;
      if (s.date === today) todayTime += d;
      if (s.date === yesterday) yesterdayTime += d;
      
      const diffDays = Math.floor((now.getTime() - sDate.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays <= 7) last7DaysTime += d;
      if (diffDays <= 30) last30DaysTime += d;
      if (sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear) monthlyTime += d;
      if (sDate.getFullYear() === currentYear) yearlyTime += d;
    });

    let currentStreak = 0;
    let longestStreak = 0;
    
    const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a));
    if (dates.length > 0) {
      let _streak = 1;
      let _maxStreak = 1;
      let checkDate = new Date(dates[0]);
      
      if (dates[0] === today || dates[0] === yesterday) {
        currentStreak = 1;
      }
      
      for (let i = 1; i < dates.length; i++) {
        const prevDate = new Date(dates[i - 1]);
        const currDate = new Date(dates[i]);
        const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));
        
        if (diff === 1) {
          _streak++;
          if (_streak > _maxStreak) _maxStreak = _streak;
          if (i <= currentStreak) currentStreak = _streak; // roughly estimate current streak
        } else {
          _streak = 1;
        }
      }
      longestStreak = _maxStreak;
    }

    return {
      todayTime,
      yesterdayTime,
      last7DaysTime,
      last30DaysTime,
      monthlyTime,
      yearlyTime,
      totalTime,
      currentStreak,
      longestStreak,
      longestSession
    };
  }, [sessions]);
}

export function useBasicFocusStats(focusSessions: FocusSession[]) {
  return useMemo(() => {
    let _streak = 0;
    let _totalFocusTime = 0;
    let _sessionCount = focusSessions.length;
    
    if (_sessionCount > 0) {
      _totalFocusTime = focusSessions.reduce((acc, curr) => acc + curr.duration, 0);
      const uniqueDates = [...new Set(focusSessions.map(s => s.date))].sort((a, b) => b.localeCompare(a));
      
      if (uniqueDates.length > 0) {
        _streak = 1;
        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i - 1]);
          const currDate = new Date(uniqueDates[i]);
          const diff = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 3600 * 24));
          if (diff === 1) {
            _streak++;
          } else {
            break;
          }
        }
      }
    }
    
    let _focusScore = Math.min(100, Math.floor((_streak * 5) + (_totalFocusTime / 60 * 2)));
    if (_sessionCount === 0) _focusScore = 0;
    
    return {
      streak: _streak,
      focusScore: _focusScore,
      sessionCount: _sessionCount,
      totalFocusTime: _totalFocusTime
    };
  }, [focusSessions]);
}

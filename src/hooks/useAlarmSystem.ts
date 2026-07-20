import { useRef } from 'react';

export function useAlarmSystem() {
  const audioContextRef = useRef<AudioContext | null>(null);

  // Native HTML Speech Synthesis announcer loop
  const speakVoiceAnnouncement = (textMessage: string) => {
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel(); // Flush previous stack
        const speech = new SpeechSynthesisUtterance(textMessage);
        speech.rate = 1.0;
        speech.pitch = 1.05;
        speech.volume = 1.0;
        window.speechSynthesis.speak(speech);
      } catch (e) {
        console.warn('Speech Engine not active or waiting gesture permission.', e);
      }
    }
  };

  // Web Audio Synthesizer: aggressive wake-up alarm chime
  const playSoundAlarmBeep = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // high pitch chirp

      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio Synthesis action bypassed or locked by browser sandbox rules.', e);
    }
  };

  // Web Audio Synthesizer: gentle milestone tone
  const playMilestonePing = () => {
    try {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // Clean C5 chord note

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.65);
    } catch (e) {
      console.warn(e);
    }
  };

  return {
    speakVoiceAnnouncement,
    playSoundAlarmBeep,
    playMilestonePing
  };
}

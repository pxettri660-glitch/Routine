import { useState, useRef, useEffect, useCallback } from 'react';

export type SynthType = 'alpha' | 'rain' | 'lofi' | null;

export function useSynthAtmosphere(
  audioElementRef: React.RefObject<HTMLAudioElement | null>,
  setIsPlaying: (playing: boolean) => void
) {
  const [synthType, setSynthType] = useState<SynthType>(null);
  const synthAudioCtxRef = useRef<AudioContext | null>(null);
  const synthOscillatorRef = useRef<OscillatorNode | AudioBufferSourceNode | null>(null);

  const stopSynthAtmosphere = useCallback(() => {
    if (synthOscillatorRef.current) {
      try { synthOscillatorRef.current.stop(); } catch {}
      synthOscillatorRef.current = null;
    }
    if (synthAudioCtxRef.current) {
      synthAudioCtxRef.current.close();
      synthAudioCtxRef.current = null;
    }
    setSynthType(null);
  }, []);

  useEffect(() => {
    return () => {
      stopSynthAtmosphere();
    };
  }, [stopSynthAtmosphere]);

  const startSynthAtmosphere = useCallback((type: 'alpha' | 'rain' | 'lofi') => {
    stopSynthAtmosphere();
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    }
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      synthAudioCtxRef.current = ctx;

      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      if (type === 'alpha') {
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(200, ctx.currentTime);
        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(212, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);

        if (pannerLeft && pannerRight) {
          pannerLeft.pan.setValueAtTime(-1, ctx.currentTime);
          pannerRight.pan.setValueAtTime(1, ctx.currentTime);
          oscLeft.connect(pannerLeft).connect(gain);
          oscRight.connect(pannerRight).connect(gain);
        } else {
          oscLeft.connect(gain);
          oscRight.connect(gain);
        }
        oscLeft.start();
        oscRight.start();
        synthOscillatorRef.current = oscLeft;
      } else if (type === 'rain') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        whiteNoise.connect(filter).connect(gain);
        whiteNoise.start();
        synthOscillatorRef.current = whiteNoise;
      } else if (type === 'lofi') {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 6;
        lfoGain.gain.value = 0.03;

        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);
        lfo.start();

        filter.type = 'peaking';
        filter.frequency.setValueAtTime(350, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);

        osc.connect(filter).connect(gain);
        osc.start();
        synthOscillatorRef.current = osc;
      }

      gain.connect(ctx.destination);
      setSynthType(type);
    } catch (e) {
      console.warn('Audio Synthesis blocked.', e);
    }
  }, [audioElementRef, setIsPlaying, stopSynthAtmosphere]);

  return {
    synthType,
    startSynthAtmosphere,
    stopSynthAtmosphere
  };
}

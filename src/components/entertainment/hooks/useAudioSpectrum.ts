import { useRef, useCallback, useEffect } from 'react';
import { SynthType } from './useSynthAtmosphere';

export function useAudioSpectrum(isPlaying: boolean, synthType: SynthType) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  const animateSpectrum = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      
      const barCount = 32;
      const spacing = width / barCount;
      const now = Date.now() * 0.005;

      for (let i = 0; i < barCount; i++) {
        const x = i * spacing + spacing / 2;
        let amplitude = 4;
        
        if (isPlaying || synthType) {
          amplitude = Math.abs(Math.sin(now + i * 0.2)) * 30 + Math.abs(Math.cos(now * 0.5 + i * 0.1)) * 20;
        }

        const gradient = ctx.createLinearGradient(x, height / 2 - amplitude, x, height / 2 + amplitude);
        gradient.addColorStop(0, '#8b5cf6');
        gradient.addColorStop(0.5, '#ec4899');
        gradient.addColorStop(1, '#f43f5e');

        ctx.strokeStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(x, height / 2 - amplitude);
        ctx.lineTo(x, height / 2 + amplitude);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    if (!animationRef.current) {
      draw();
    }
  }, [isPlaying, synthType]);

  const cancelSpectrumAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (isPlaying || synthType) {
      animateSpectrum();
    } else {
      cancelSpectrumAnimation();
      const canvas = canvasRef.current;
      if (canvas) {
         const ctx = canvas.getContext('2d');
         ctx?.clearRect(0, 0, canvas.width, canvas.height);
         ctx!.lineWidth = 3;
         ctx!.strokeStyle = '#ffffff20';
         ctx?.beginPath();
         ctx?.moveTo(0, canvas.height / 2);
         ctx?.lineTo(canvas.width, canvas.height / 2);
         ctx?.stroke();
      }
    }
    return cancelSpectrumAnimation;
  }, [isPlaying, synthType, animateSpectrum, cancelSpectrumAnimation]);

  return { canvasRef };
}

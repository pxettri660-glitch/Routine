import fs from 'fs';
let content = fs.readFileSync('src/components/entertainment/Entertainment.tsx', 'utf-8');

content = content.replace(
`  // Hook 1: Canvas Spectrum
  const { canvasRef, animateSpectrum, cancelSpectrumAnimation } = useAudioSpectrum(isPlaying, null); // Will update synthType later

  // Hook 2: Synth Atmosphere
  const { synthType, startSynthAtmosphere, stopSynthAtmosphere } = useSynthAtmosphere(
    audioElementRef,
    setIsPlaying,
    animateSpectrum,
    cancelSpectrumAnimation
  );`,
`  // Hook 2: Synth Atmosphere
  const { synthType, startSynthAtmosphere, stopSynthAtmosphere } = useSynthAtmosphere(
    audioElementRef,
    setIsPlaying
  );

  // Hook 1: Canvas Spectrum
  const { canvasRef } = useAudioSpectrum(isPlaying, synthType);`);

fs.writeFileSync('src/components/entertainment/Entertainment.tsx', content);

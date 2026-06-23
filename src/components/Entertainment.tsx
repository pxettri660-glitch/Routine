import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, Music, Upload, VolumeX, Volume2, ListMusic, Sparkles } from 'lucide-react';
import { AudioTrack } from '../types';

interface EntertainmentProps {
  loadedTracks: AudioTrack[];
  onUploadTracks: (tracks: AudioTrack[]) => void;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export default function Entertainment({
  loadedTracks,
  onUploadTracks,
  audioElementRef,
  currentTrackIndex,
  setCurrentTrackIndex,
  isPlaying,
  setIsPlaying,
}: EntertainmentProps) {
  const [synthType, setSynthType] = useState<'alpha' | 'rain' | 'lofi' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Web Audio synth modules
  const synthAudioCtxRef = useRef<AudioContext | null>(null);
  const synthOscillatorRef = useRef<OscillatorNode | null>(null);
  const synthBiquadFilterRef = useRef<BiquadFilterNode | null>(null);
  const synthGainNodeRef = useRef<GainNode | null>(null);

  // Stop synthetic audio when component unmounts
  useEffect(() => {
    return () => {
      stopSynthAtmosphere();
    };
  }, []);

  // Web Audio Atmosphere synthesizers for offline study beats
  const startSynthAtmosphere = (type: 'alpha' | 'rain' | 'lofi') => {
    // Stop existing synth first
    stopSynthAtmosphere();

    // Pause normal audio player if playing
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
        // Binaural beat synthesis - creates focus wave
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const pannerLeft = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const pannerRight = ctx.createStereoPanner ? ctx.createStereoPanner() : null;

        oscLeft.type = 'sine';
        oscLeft.frequency.setValueAtTime(200, ctx.currentTime); // Base Carrier (left)
        
        oscRight.type = 'sine';
        oscRight.frequency.setValueAtTime(212, ctx.currentTime); // Carrier + Alpha gap (12Hz) for right

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

        synthOscillatorRef.current = oscLeft; // Hold onto left osc to destroy later
      } else if (type === 'rain') {
        // Synthesise deep ambient brownian/white background sound
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        let lastOut = 0.0;
        
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Brownian low-pass filter formula
          output[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = output[i];
          output[i] *= 3.5; // Gain coefficient
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(800, ctx.currentTime);

        gain.gain.setValueAtTime(0.25, ctx.currentTime);

        whiteNoise.connect(filter).connect(gain);
        whiteNoise.start();

        // Hold references
        (synthOscillatorRef as any).current = whiteNoise;
      } else if (type === 'lofi') {
        // Lo-fi vinyl crackle + deep rhythmic pad synth
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, ctx.currentTime); // Deep A2 note

        // LFO volume modulation (simulates tape warble)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.value = 6; // Hz
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
      synthGainNodeRef.current = gain;
      synthBiquadFilterRef.current = filter;
      setSynthType(type);

      // Start the animated spectrum simulation on canvas
      animateSpectrum();
    } catch (e) {
      console.warn('Audio Synthesis not fully supported or blocked by user gesture.', e);
    }
  };

  const stopSynthAtmosphere = () => {
    if (synthOscillatorRef.current) {
      try {
        synthOscillatorRef.current.stop();
      } catch {}
      synthOscillatorRef.current = null;
    }
    if (synthAudioCtxRef.current) {
      synthAudioCtxRef.current.close();
      synthAudioCtxRef.current = null;
    }
    setSynthType(null);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  // Canvas visualizer simulation
  const animateSpectrum = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Neon visual spectrum spikes
      ctx.lineWidth = 2.5;
      const barCount = 38;
      const spacing = width / barCount;
      const now = Date.now() * 0.01;

      for (let i = 0; i < barCount; i++) {
        const x = i * spacing + spacing / 2;
        // Generate pseudo amplitude using sine waves
        let amplitude = Math.sin(now + i * 0.15) * 22 + Math.cos(now * 0.6 + i * 0.3) * 14;
        if (!isPlaying && !synthType) {
          amplitude = 2; // Flat line
        } else {
          amplitude = Math.abs(amplitude) + 5;
        }

        if (amplitude > height - 10) amplitude = height - 15;

        // Gradient line colors
        const grad = ctx.createLinearGradient(x, height, x, height - amplitude);
        grad.addColorStop(0, '#10b981'); // Emerald
        grad.addColorStop(0.5, '#06b6d4'); // Cyan
        grad.addColorStop(1, '#a78bfa'); // Violet

        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, height);
        ctx.lineTo(x, height - amplitude);
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  // Run initial spectrum wave draw
  useEffect(() => {
    animateSpectrum();
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, synthType]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newTracks: AudioTrack[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const url = URL.createObjectURL(file);
      newTracks.push({
        id: `uploaded-${Date.now()}-${i}`,
        name: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
        url: url,
      });
    }

    if (newTracks.length > 0) {
      onUploadTracks([...newTracks, ...loadedTracks]);
      // Play first uploaded track
      setCurrentTrackIndex(0);
      setIsPlaying(true);
      stopSynthAtmosphere(); // Stop ambient generator
      
      // Delay slightly to allow state to bind
      setTimeout(() => {
        if (audioElementRef.current) {
          audioElementRef.current.play().catch(() => {});
        }
      }, 100);
    }
  };

  const selectAndPlayTrack = (index: number) => {
    stopSynthAtmosphere(); // Mute background generators
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setTimeout(() => {
      if (audioElementRef.current) {
        audioElementRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const togglePrimaryPlayback = () => {
    if (loadedTracks.length === 0) {
      fileInputRef.current?.click();
      return;
    }

    stopSynthAtmosphere();
    if (isPlaying) {
      audioElementRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    if (loadedTracks.length === 0) return;
    stopSynthAtmosphere();

    let nextIndex = currentTrackIndex;
    if (direction === 'next') {
      nextIndex = (currentTrackIndex + 1) % loadedTracks.length;
    } else {
      nextIndex = (currentTrackIndex - 1 + loadedTracks.length) % loadedTracks.length;
    }

    setCurrentTrackIndex(nextIndex);
    setIsPlaying(true);

    setTimeout(() => {
      if (audioElementRef.current) {
        audioElementRef.current.play().catch(() => {});
      }
    }, 100);
  };

  const activeTrack = loadedTracks[currentTrackIndex];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Deck & Controls */}
      <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-violet-500/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold tracking-wider text-slate-400 flex items-center gap-1.5 uppercase">
            <Music className="w-4 h-4 text-violet-400 animate-spin" />
            SOUND SYSTEM CONSOLE
          </h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            Web Audio Deck V1.5
          </span>
        </div>

        {/* Oscillating Sound Wave Visualizer Core Canvas */}
        <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-3 h-28 flex items-end relative overflow-hidden mb-5">
          <div className="absolute top-2 right-3 font-mono text-[9px] text-emerald-400/70 select-none uppercase tracking-widest flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
            Stereo Spectrum Output
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            width="400"
            height="100"
          />
        </div>

        {/* Core Deck Playback controllers */}
        <div className="space-y-4">
          <div className="text-center sm:text-left">
            <div className="text-xs uppercase font-bold tracking-widest text-violet-400">
              {synthType ? 'Atmosphere Engine Active' : 'PCM Audio stream'}
            </div>
            <h4 className="text-base font-bold text-white truncate mt-1">
              {synthType
                ? `Focus Generator: ${synthType === 'alpha' ? 'Alpha Binaural' : synthType === 'rain' ? 'Brownian Rain' : 'Vinyl Lofi'}`
                : activeTrack
                ? activeTrack.name
                : 'No track loaded. Connect local files below.'}
            </h4>
          </div>

          {/* HTML5 audio element wrapper */}
          <div className="hidden">
            <audio
              ref={audioElementRef}
              src={activeTrack?.url}
              controls
              onEnded={() => skipTrack('next')}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800/60">
            {/* Playback action keys */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => skipTrack('prev')}
                disabled={loadedTracks.length === 0}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-all border border-slate-800 cursor-pointer"
              >
                <SkipForward className="w-4 h-4 text-slate-350 transform rotate-180" />
              </button>

              <button
                onClick={togglePrimaryPlayback}
                className="w-12 h-12 bg-violet-500 hover:bg-violet-400 text-slate-950 font-black rounded-full transition-all flex items-center justify-center shadow-lg hover:shadow-violet-500/20 active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-5 h-5 text-slate-950 fill-slate-950" /> : <Play className="w-5 h-5 text-slate-950 fill-slate-950 ml-0.5" />}
              </button>

              <button
                onClick={() => skipTrack('next')}
                disabled={loadedTracks.length === 0}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 disabled:opacity-40 rounded-xl transition-all border border-slate-800 cursor-pointer"
              >
                <SkipForward className="w-4 h-4 text-slate-350" />
              </button>
            </div>

            {/* Quick-import triggers */}
            <div className="flex flex-wrap gap-2.5 justify-center">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-350 border border-slate-850 rounded-xl transition-all cursor-pointer active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                Upload MP3s
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Atmospheric Focus Beats Center */}
      <div className="lg:col-span-1 space-y-5">
        
        {/* Offline Binaural Generators */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl">
          <h3 className="text-xs font-bold font-mono text-emerald-400 tracking-wider flex items-center gap-2 mb-3.5">
            <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
            SYNTHETIC COGNITIVE BEATS
          </h3>
          <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
            No focus local songs? Activate our real-time browser wave generators. Designed to boost concentration, sleep, study, and math analysis.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => startSynthAtmosphere('alpha')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                synthType === 'alpha'
                  ? 'border-emerald-500/60 bg-emerald-500/[0.04] text-emerald-400 scale-102'
                  : 'border-slate-800 bg-slate-950/20 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <span className="block text-sm">🧠 Alpha Binaural Waves</span>
                <span className="text-[10px] text-slate-500 block font-normal mt-0.5">Focus beat carrier offset 12Hz</span>
              </div>
              {synthType === 'alpha' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>

            <button
              onClick={() => startSynthAtmosphere('rain')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                synthType === 'rain'
                  ? 'border-emerald-500/60 bg-emerald-500/[0.04] text-emerald-400 scale-102'
                  : 'border-slate-800 bg-slate-950/20 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <span className="block text-sm">🌧️ Brownian Rain ASMR</span>
                <span className="text-[10px] text-slate-500 block font-normal mt-0.5">Deep continuous acoustic blocking</span>
              </div>
              {synthType === 'rain' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>

            <button
              onClick={() => startSynthAtmosphere('lofi')}
              className={`w-full p-3 rounded-xl border text-left text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                synthType === 'lofi'
                  ? 'border-emerald-500/60 bg-emerald-500/[0.04] text-emerald-400 scale-102'
                  : 'border-slate-800 bg-slate-950/20 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div>
                <span className="block text-sm">🎵 Tape Warble Lofi</span>
                <span className="text-[10px] text-slate-500 block font-normal mt-0.5">Warm vinyl crackle & rhythmic low chords</span>
              </div>
              {synthType === 'lofi' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
            </button>

            {synthType && (
              <button
                onClick={stopSynthAtmosphere}
                className="w-full text-center text-[10px] font-bold py-1.5 rounded-lg border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/20 text-rose-400 transition-all cursor-pointer uppercase flex items-center justify-center gap-1 mt-2"
              >
                <VolumeX className="w-3.5 h-3.5" />
                Stop Waves Generator
              </button>
            )}
          </div>
        </div>

        {/* Loaded Playlist box */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 shadow-xl max-h-[190px] overflow-hidden flex flex-col">
          <h4 className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mb-3 select-none">
            <ListMusic className="w-4 h-4 text-slate-400" />
            LOADED AUDIO QUEUE ({loadedTracks.length})
          </h4>
          <div className="flex-1 overflow-y-auto space-y-1 pr-1.5 scroll-thin">
            {loadedTracks.length === 0 ? (
              <div className="text-[10px] text-slate-500 text-center py-6 leading-relaxed">
                Your queue is empty.<br />Upload a few MP3 files above from your local folder.
              </div>
            ) : (
              loadedTracks.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => selectAndPlayTrack(i)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-center justify-between group ${
                    currentTrackIndex === i && !synthType
                      ? 'border-violet-500/40 bg-violet-500/[0.04] text-violet-400 hover:bg-violet-500/[0.06] font-bold'
                      : 'border-slate-850 bg-slate-950/20 hover:border-slate-800 hover:bg-slate-900/30 text-slate-400 hover:text-slate-350'
                  }`}
                >
                  <span className="truncate pr-4 flex items-center gap-2">
                    <span className="font-mono text-[10px] opacity-40">{String(i + 1).padStart(2, '0')}</span>
                    {track.name}
                  </span>
                  <Play className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}

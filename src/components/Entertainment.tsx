import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Music, Upload, VolumeX, Volume2, ListMusic, Sparkles, AudioWaveform, Waves, CloudRain, Disc } from 'lucide-react';
import { AudioTrack } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface EntertainmentProps {
  loadedTracks: AudioTrack[];
  onUploadTracks: (tracks: AudioTrack[]) => void;
  audioElementRef: React.RefObject<HTMLAudioElement | null>;
  currentTrackIndex: number;
  setCurrentTrackIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

const Entertainment = React.memo(function Entertainment({
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

  const synthAudioCtxRef = useRef<AudioContext | null>(null);
  const synthOscillatorRef = useRef<OscillatorNode | null>(null);

  useEffect(() => {
    return () => {
      stopSynthAtmosphere();
    };
  }, []);

  const startSynthAtmosphere = (type: 'alpha' | 'rain' | 'lofi') => {
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
        (synthOscillatorRef as any).current = whiteNoise;
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
      animateSpectrum();
    } catch (e) {
      console.warn('Audio Synthesis blocked.', e);
    }
  };

  const stopSynthAtmosphere = () => {
    if (synthOscillatorRef.current) {
      try { synthOscillatorRef.current.stop(); } catch {}
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

  const animateSpectrum = () => {
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
    draw();
  };

  useEffect(() => {
    if (isPlaying && !synthType) {
      animateSpectrum();
    } else if (!isPlaying && !synthType) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
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
  }, [isPlaying, synthType]);


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newTracks: AudioTrack[] = files.map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
      }));
      onUploadTracks(newTracks);
    }
  };

  const playTrack = (index: number) => {
    stopSynthAtmosphere();
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  };

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const toggleLocalPlay = () => {
    if (synthType) stopSynthAtmosphere();
    
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
      } else {
        audioElementRef.current.play().catch(e => console.warn(e));
      }
    }
    setIsPlaying(!isPlaying);
  };

  const nextLocalTrack = () => {
    if (loadedTracks.length === 0) return;
    if (isRepeat) {
      if (audioElementRef.current) {
        audioElementRef.current.currentTime = 0;
        audioElementRef.current.play().catch(e => console.warn(e));
      }
      return;
    }
    if (isShuffle) {
      const nextIdx = Math.floor(Math.random() * loadedTracks.length);
      setCurrentTrackIndex(nextIdx);
    } else {
      setCurrentTrackIndex((currentTrackIndex + 1) % loadedTracks.length);
    }
    setIsPlaying(true);
  };

  const prevLocalTrack = () => {
    if (loadedTracks.length === 0) return;
    setCurrentTrackIndex((currentTrackIndex - 1 + loadedTracks.length) % loadedTracks.length);
    setIsPlaying(true);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = Number(e.target.value);
    setVolume(vol);
    if (audioElementRef.current) {
      audioElementRef.current.volume = vol;
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioElementRef.current && loadedTracks.length > 0) {
      if (isPlaying && !synthType) {
        audioElementRef.current.play().catch(e => console.warn(e));
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying, synthType, loadedTracks.length]);

  return (
    <motion.div 
      className="space-y-6 sm:space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-3">
            <Music className="w-8 h-8 text-rose-500" />
            Media
          </h2>
          <p className="text-sm font-medium opacity-60 tracking-wide uppercase">Audio & Frequencies</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Actual Audio Element */}
        <audio 
          ref={audioElementRef}
          src={loadedTracks.length > 0 && currentTrackIndex >= 0 ? loadedTracks[currentTrackIndex].url : undefined}
          onEnded={nextLocalTrack}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />

        {/* Synth Control Panel */}
        <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
            <AudioWaveform className="w-4 h-4 text-rose-500" /> Neural Synth
          </h3>

          <div className="space-y-4">
             {[
               { id: 'alpha', icon: Waves, title: 'Alpha Binaural', desc: '40Hz Focus Frequency', color: 'indigo' },
               { id: 'rain', icon: CloudRain, title: 'Deep Brownian', desc: 'Filtered Ambient Noise', color: 'emerald' },
               { id: 'lofi', icon: Disc, title: 'Analog Lofi', desc: 'Vinyl crackle & warmth', color: 'orange' }
             ].map((synth) => {
               const isActive = synthType === synth.id;
               return (
                 <button
                   key={synth.id}
                   onClick={() => isActive ? stopSynthAtmosphere() : startSynthAtmosphere(synth.id as any)}
                   className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 border ${
                     isActive 
                       ? `bg-${synth.color}-500/10 border-${synth.color}-500/30 ring-1 ring-${synth.color}-500/20` 
                       : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/5 dark:hover:border-white/10 hover:bg-black/10 dark:hover:bg-white/10'
                   }`}
                 >
                   <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-xl ${isActive ? `bg-${synth.color}-500 text-white shadow-lg` : 'bg-black/5 dark:bg-white/10'}`}>
                       <synth.icon className="w-5 h-5" />
                     </div>
                     <div className="text-left">
                       <h4 className="font-bold text-sm">{synth.title}</h4>
                       <p className="text-[10px] sm:text-xs opacity-60 mt-0.5">{synth.desc}</p>
                     </div>
                   </div>
                   <div className={`w-3 h-3 rounded-full ${isActive ? `bg-${synth.color}-500 animate-pulse` : 'bg-black/20 dark:bg-white/20'}`} />
                 </button>
               )
             })}
          </div>
        </div>

        {/* Local Player */}
        <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
              <ListMusic className="w-4 h-4 text-purple-500" /> Local Player
            </h3>

            <div className="w-full h-32 bg-black/5 dark:bg-white/5 rounded-2xl flex items-center justify-center p-4 border border-black/10 dark:border-white/5 overflow-hidden">
              <canvas ref={canvasRef} width={400} height={100} className="w-full h-full opacity-80" />
            </div>

            <div className="mt-8 flex flex-col items-center">
              <h4 className="text-xl font-bold tracking-tight truncate w-full text-center">
                {loadedTracks.length > 0 && currentTrackIndex >= 0 
                  ? loadedTracks[currentTrackIndex].name 
                  : (synthType ? `${synthType.toUpperCase()} SYNTH ACTIVE` : 'No Media Playing')}
              </h4>
              <p className="text-sm opacity-50 mt-1">
                 {loadedTracks.length > 0 && currentTrackIndex >= 0 ? `Track ${currentTrackIndex + 1} of ${loadedTracks.length}` : 'System Output'}
              </p>
              
              {!synthType && loadedTracks.length > 0 && (
                <div className="w-full mt-6">
                  <input 
                    type="range" 
                    min={0} 
                    max={duration || 100} 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] sm:text-xs font-mono font-medium opacity-50 mt-2">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <button
                onClick={() => setIsShuffle(!isShuffle)}
                disabled={!!synthType}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors disabled:opacity-30 ${isShuffle ? 'text-rose-500 bg-rose-500/10' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                onClick={prevLocalTrack}
                disabled={loadedTracks.length === 0 || !!synthType}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <SkipBack className="w-5 h-5 opacity-70" />
              </button>

              <button
                onClick={toggleLocalPlay}
                disabled={loadedTracks.length === 0 && !synthType}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all shadow-xl ${
                  isPlaying || synthType
                    ? 'bg-gradient-to-br from-rose-500 to-orange-500 text-white shadow-rose-500/30 hover:scale-105' 
                    : 'bg-black/10 dark:bg-white/10 text-black dark:text-white hover:scale-105 opacity-50 hover:opacity-100 disabled:opacity-30 disabled:hover:scale-100 border border-black/10 dark:border-white/10'
                }`}
              >
                {isPlaying || synthType ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
              </button>

              <button
                onClick={nextLocalTrack}
                disabled={loadedTracks.length === 0 || !!synthType}
                className="w-12 h-12 flex items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors disabled:opacity-30"
              >
                <SkipForward className="w-5 h-5 opacity-70" />
              </button>

              <button
                onClick={() => setIsRepeat(!isRepeat)}
                disabled={!!synthType}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors disabled:opacity-30 ${isRepeat ? 'text-rose-500 bg-rose-500/10' : 'text-black/50 dark:text-white/50 hover:bg-black/5 dark:hover:bg-white/5'}`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 w-full px-4 mt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 flex shrink-0 items-center justify-center rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                title="Upload Tracks"
              >
                <Upload className="w-4 h-4 opacity-70" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                accept="audio/*" 
                multiple
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="flex-1 flex items-center gap-2 max-w-[200px] mx-auto opacity-70 hover:opacity-100 transition-opacity">
                {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <input 
                  type="range" 
                  min={0} 
                  max={1} 
                  step={0.01}
                  value={volume} 
                  onChange={handleVolume}
                  className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="p-6 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl">
         <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-purple-500" /> Track Queue
         </h3>
         {loadedTracks.length === 0 ? (
           <div className="py-12 text-center opacity-40">
             <Music className="w-8 h-8 mx-auto mb-3" />
             <p className="text-sm font-bold">No tracks uploaded</p>
           </div>
         ) : (
           <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
             {loadedTracks.map((track, i) => (
               <div 
                 key={track.id}
                 onClick={() => playTrack(i)}
                 className={`flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-colors border ${currentTrackIndex === i && !synthType ? 'bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10' : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/5 dark:hover:border-white/10'}`}
               >
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentTrackIndex === i && !synthType ? 'bg-gradient-to-br from-purple-500 to-rose-500 text-white' : 'bg-black/10 dark:bg-white/10'}`}>
                    <Music className="w-4 h-4" />
                 </div>
                 <span className="font-bold text-sm truncate flex-1">{track.name}</span>
                 {currentTrackIndex === i && !synthType && (
                   <div className="flex gap-1">
                     <span className="w-1 h-3 bg-purple-500 animate-pulse rounded-full" style={{ animationDelay: '0ms' }}></span>
                     <span className="w-1 h-4 bg-rose-500 animate-pulse rounded-full" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-1 h-2 bg-orange-500 animate-pulse rounded-full" style={{ animationDelay: '300ms' }}></span>
                   </div>
                 )}
               </div>
             ))}
           </div>
         )}
      </div>

    </motion.div>
  );
});

export default Entertainment;

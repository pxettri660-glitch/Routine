import React, { useRef } from 'react';
import { ListMusic, Play, Pause, SkipForward, SkipBack, Shuffle, Repeat, Upload, VolumeX, Volume2 } from 'lucide-react';
import { AudioTrack } from '../../../types';
import { SynthType } from '../hooks/useSynthAtmosphere';

interface LocalPlayerProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  loadedTracks: AudioTrack[];
  currentTrackIndex: number;
  synthType: SynthType;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  isRepeat: boolean;
  handleSeek: (time: number) => void;
  handleVolume: (vol: number) => void;
  setIsShuffle: (val: boolean) => void;
  setIsRepeat: (val: boolean) => void;
  nextLocalTrack: () => void;
  prevLocalTrack: () => void;
  toggleLocalPlay: () => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function LocalPlayer({
  canvasRef, loadedTracks, currentTrackIndex, synthType, isPlaying,
  currentTime, duration, volume, isShuffle, isRepeat,
  handleSeek, handleVolume, setIsShuffle, setIsRepeat,
  nextLocalTrack, prevLocalTrack, toggleLocalPlay, handleFileUpload
}: LocalPlayerProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
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
                onChange={(e) => handleSeek(Number(e.target.value))}
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
              onChange={(e) => handleVolume(Number(e.target.value))}
              className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

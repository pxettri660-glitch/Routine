import React, { useCallback } from 'react';
import { Music } from 'lucide-react';
import { AudioTrack } from '../../types';
import { motion } from 'motion/react';
import { useSynthAtmosphere } from './hooks/useSynthAtmosphere';
import { useAudioSpectrum } from './hooks/useAudioSpectrum';
import { useLocalPlayer } from './hooks/useLocalPlayer';
import { SynthPanel } from './components/SynthPanel';
import { LocalPlayer } from './components/LocalPlayer';
import { TrackQueue } from './components/TrackQueue';

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

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const newTracks: AudioTrack[] = files.map(file => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
      }));
      onUploadTracks(newTracks);
    }
  }, [onUploadTracks]);

  // Hook 2: Synth Atmosphere
  const { synthType, startSynthAtmosphere, stopSynthAtmosphere } = useSynthAtmosphere(
    audioElementRef,
    setIsPlaying
  );

  // Hook 1: Canvas Spectrum
  const { canvasRef } = useAudioSpectrum(isPlaying, synthType);

  // Hook 3: Local Player state
  const {
    currentTime, setCurrentTime, duration, setDuration,
    volume, handleVolume, isShuffle, setIsShuffle,
    isRepeat, setIsRepeat, nextLocalTrack, prevLocalTrack,
    handleSeek, toggleLocalPlay
  } = useLocalPlayer(
    loadedTracks, audioElementRef, currentTrackIndex, setCurrentTrackIndex,
    isPlaying, setIsPlaying, synthType, stopSynthAtmosphere
  );

  const playTrack = useCallback((index: number) => {
    stopSynthAtmosphere();
    setCurrentTrackIndex(index);
    setIsPlaying(true);
  }, [stopSynthAtmosphere, setCurrentTrackIndex, setIsPlaying]);

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
        <SynthPanel 
          synthType={synthType} 
          startSynthAtmosphere={startSynthAtmosphere} 
          stopSynthAtmosphere={stopSynthAtmosphere} 
        />

        {/* Local Player */}
        <LocalPlayer 
          canvasRef={canvasRef}
          loadedTracks={loadedTracks}
          currentTrackIndex={currentTrackIndex}
          synthType={synthType}
          isPlaying={isPlaying}
          currentTime={currentTime}
          duration={duration}
          volume={volume}
          isShuffle={isShuffle}
          isRepeat={isRepeat}
          handleSeek={handleSeek}
          handleVolume={handleVolume}
          setIsShuffle={setIsShuffle}
          setIsRepeat={setIsRepeat}
          nextLocalTrack={nextLocalTrack}
          prevLocalTrack={prevLocalTrack}
          toggleLocalPlay={toggleLocalPlay}
          handleFileUpload={handleFileUpload}
        />
      </div>

      {/* Track Queue */}
      <TrackQueue 
        loadedTracks={loadedTracks}
        currentTrackIndex={currentTrackIndex}
        synthType={synthType}
        playTrack={playTrack}
      />
    </motion.div>
  );
});

export default Entertainment;

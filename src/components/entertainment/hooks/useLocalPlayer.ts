import { useState, useCallback, useEffect } from 'react';
import { AudioTrack } from '../../../types';
import { SynthType } from './useSynthAtmosphere';

export function useLocalPlayer(
  loadedTracks: AudioTrack[],
  audioElementRef: React.RefObject<HTMLAudioElement | null>,
  currentTrackIndex: number,
  setCurrentTrackIndex: (index: number) => void,
  isPlaying: boolean,
  setIsPlaying: (playing: boolean) => void,
  synthType: SynthType,
  stopSynthAtmosphere: () => void
) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);

  const nextLocalTrack = useCallback(() => {
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
  }, [loadedTracks.length, isRepeat, isShuffle, currentTrackIndex, setCurrentTrackIndex, setIsPlaying, audioElementRef]);

  const prevLocalTrack = useCallback(() => {
    if (loadedTracks.length === 0) return;
    setCurrentTrackIndex((currentTrackIndex - 1 + loadedTracks.length) % loadedTracks.length);
    setIsPlaying(true);
  }, [loadedTracks.length, currentTrackIndex, setCurrentTrackIndex, setIsPlaying]);

  const handleSeek = (time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolume = (vol: number) => {
    setVolume(vol);
    if (audioElementRef.current) {
      audioElementRef.current.volume = vol;
    }
  };

  const toggleLocalPlay = useCallback(() => {
    if (synthType) stopSynthAtmosphere();
    
    if (audioElementRef.current) {
      if (isPlaying) {
        audioElementRef.current.pause();
      } else {
        audioElementRef.current.play().catch(e => console.warn(e));
      }
    }
    setIsPlaying(!isPlaying);
  }, [synthType, stopSynthAtmosphere, audioElementRef, isPlaying, setIsPlaying]);

  useEffect(() => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = volume;
    }
  }, [volume, audioElementRef]);

  useEffect(() => {
    if (audioElementRef.current && loadedTracks.length > 0) {
      if (isPlaying && !synthType) {
        audioElementRef.current.play().catch(e => console.warn(e));
      } else {
        audioElementRef.current.pause();
      }
    }
  }, [currentTrackIndex, isPlaying, synthType, loadedTracks.length, audioElementRef]);

  return {
    currentTime,
    setCurrentTime,
    duration,
    setDuration,
    volume,
    handleVolume,
    isShuffle,
    setIsShuffle,
    isRepeat,
    setIsRepeat,
    nextLocalTrack,
    prevLocalTrack,
    handleSeek,
    toggleLocalPlay
  };
}

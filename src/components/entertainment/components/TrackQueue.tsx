import React from 'react';
import { ListMusic, Music } from 'lucide-react';
import { AudioTrack } from '../../../types';
import { SynthType } from '../hooks/useSynthAtmosphere';

interface TrackQueueProps {
  loadedTracks: AudioTrack[];
  currentTrackIndex: number;
  synthType: SynthType;
  playTrack: (index: number) => void;
}

export function TrackQueue({ loadedTracks, currentTrackIndex, synthType, playTrack }: TrackQueueProps) {
  return (
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
  );
}

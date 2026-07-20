import React from 'react';
import { Waves, CloudRain, Disc, AudioWaveform } from 'lucide-react';
import { SynthType } from '../hooks/useSynthAtmosphere';

interface SynthPanelProps {
  synthType: SynthType;
  startSynthAtmosphere: (type: 'alpha' | 'rain' | 'lofi') => void;
  stopSynthAtmosphere: () => void;
}

export function SynthPanel({ synthType, startSynthAtmosphere, stopSynthAtmosphere }: SynthPanelProps) {
  const synthOptions = [
    { id: 'alpha', icon: Waves, title: 'Alpha Binaural', desc: '40Hz Focus Frequency', color: 'indigo' },
    { id: 'rain', icon: CloudRain, title: 'Deep Brownian', desc: 'Filtered Ambient Noise', color: 'emerald' },
    { id: 'lofi', icon: Disc, title: 'Analog Lofi', desc: 'Vinyl crackle & warmth', color: 'orange' }
  ] as const;

  return (
    <div className="p-6 sm:p-8 rounded-[2rem] backdrop-blur-2xl border bg-white/[0.03] border-black/5 dark:border-white/10 shadow-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <h3 className="text-sm font-bold uppercase tracking-widest opacity-60 mb-6 flex items-center gap-2">
        <AudioWaveform className="w-4 h-4 text-rose-500" /> Neural Synth
      </h3>
      
      <div className="space-y-4">
        {synthOptions.map((synth) => {
          const isActive = synthType === synth.id;
          return (
            <button
              key={synth.id}
              onClick={() => isActive ? stopSynthAtmosphere() : startSynthAtmosphere(synth.id)}
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
  );
}

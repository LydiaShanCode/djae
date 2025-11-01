import { useMemo } from "react";

interface WaveformProps {
  progress?: number; // 0-100 percentage of track played
  isPlaying?: boolean;
  barCount?: number;
  trackId?: string; // Used to generate consistent waveform per track
}

const Waveform = ({ progress = 0, isPlaying = false, barCount = 80, trackId = "default" }: WaveformProps) => {
  // Generate consistent waveform data based on trackId
  // This simulates the amplitude data from an actual MP3 file
  const barHeights = useMemo(() => {
    // Use trackId to seed consistent "random" heights for each track
    const seed = trackId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    return Array.from({ length: barCount }, (_, i) => {
      // Create a pseudo-random but consistent pattern
      const x = (seed + i) * 0.5;
      const wave1 = Math.sin(x * 0.1) * 30;
      const wave2 = Math.sin(x * 0.3) * 20;
      const wave3 = Math.sin(x * 0.05) * 15;
      const noise = ((seed + i * 7) % 20) - 10;
      
      // Combine waves to create realistic audio-like pattern
      const height = 40 + wave1 + wave2 + wave3 + noise;
      return Math.max(15, Math.min(95, height)); // Clamp between 15-95%
    });
  }, [trackId, barCount]);

  return (
    <div className="relative h-16 rounded-lg overflow-hidden">
      {/* Unplayed section - light grey background with grey bars (full width, behind played section) */}
      <div className="absolute top-0 left-0 w-full h-full bg-gray-100 flex items-center px-2">
        <div className="flex items-center gap-0.5 h-full w-full">
          {barHeights.map((height, i) => (
            <div
              key={`unplayed-${i}`}
              className="flex-1 bg-gray-300 rounded-full"
              style={{
                height: `${height}%`,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      </div>

      {/* Played section - dark grey background with light blue bars (grows with progress) */}
      <div 
        className="absolute top-0 left-0 h-full bg-gray-800 flex items-center px-2 transition-all duration-300 ease-linear overflow-hidden"
        style={{ width: `${progress}%` }}
      >
        <div className="flex items-center gap-0.5 h-full" style={{ width: `${100 / (progress / 100)}%` }}>
          {barHeights.map((height, i) => (
            <div
              key={`played-${i}`}
              className="flex-1 bg-blue-400 rounded-full"
              style={{
                height: `${height}%`,
                opacity: isPlaying ? 1 : 0.7,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Waveform;
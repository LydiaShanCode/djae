interface WaveformProps {
  progress?: number; // 0-100 percentage of track played
  isPlaying?: boolean;
  barCount?: number;
}

const Waveform = ({ progress = 0, isPlaying = false, barCount = 80 }: WaveformProps) => {
  // Generate random heights for waveform bars
  const barHeights = Array.from({ length: barCount }, () => 20 + Math.random() * 80);
  
  // Calculate which bar index represents the current playback position
  const playedBars = Math.floor((progress / 100) * barCount);

  return (
    <div className="relative h-16 rounded-lg overflow-hidden">
      {/* Played section - dark grey background with light blue bars */}
      <div 
        className="absolute top-0 left-0 h-full bg-gray-800 flex items-center px-2 transition-all duration-300"
        style={{ width: `${progress}%` }}
      >
        <div className="flex items-center gap-0.5 h-full w-full">
          {barHeights.slice(0, playedBars).map((height, i) => (
            <div
              key={`played-${i}`}
              className="flex-1 bg-blue-400 rounded-full transition-all duration-150"
              style={{
                height: `${height}%`,
                opacity: isPlaying ? 1 : 0.7,
              }}
            />
          ))}
        </div>
      </div>

      {/* Unplayed section - light grey background with grey bars */}
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
    </div>
  );
};

export default Waveform;
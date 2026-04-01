import { useMemo } from "react";

interface WaveformProps {
  progress?: number;
  isPlaying?: boolean;
  barCount?: number;
  trackId?: string;
  isActive?: boolean;
}

const Waveform = ({
  progress = 0,
  isPlaying = false,
  barCount = 80,
  trackId = "default",
  isActive = false,
}: WaveformProps) => {
  const barHeights = useMemo(() => {
    const seed = trackId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: barCount }, (_, i) => {
      const x = (seed + i) * 0.5;
      const h = 40 + Math.sin(x * 0.1) * 30 + Math.sin(x * 0.3) * 20 + Math.sin(x * 0.05) * 15 + ((seed + i * 7) % 20) - 10;
      return Math.max(15, Math.min(95, h));
    });
  }, [trackId, barCount]);

  const playedCount = Math.round((progress / 100) * barCount);

  return (
    <div
      className="relative h-14 rounded-lg overflow-hidden flex items-center px-2 gap-[2px]"
      style={{ background: "#E8E5E0" }}
    >
      {barHeights.map((height, i) => {
        const played = i < playedCount;
        return (
          <div
            key={i}
            className={`flex-1 rounded-full transition-colors duration-100 ${isPlaying && played ? "animate-pulse" : ""}`}
            style={{
              height: `${height}%`,
              background: played
                ? isActive ? "#E8A020" : "#5C584F"
                : "#B8B4AE",
              animationDelay: isPlaying ? `${(i % 8) * 60}ms` : undefined,
              animationDuration: "1.2s",
            }}
          />
        );
      })}
    </div>
  );
};

export default Waveform;

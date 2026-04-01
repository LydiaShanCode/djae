import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";

interface WaveformProps {
  audioUrl?: string | null;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  isPlaying?: boolean;
  isActive?: boolean;
}

const Waveform = ({ audioUrl, audioRef, isPlaying = false, isActive = false }: WaveformProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    const audio = audioRef?.current;
    if (!container || !audioUrl) return;

    // Destroy any previous instance before creating a new one
    wsRef.current?.destroy();
    wsRef.current = null;

    const ws = WaveSurfer.create({
      container,
      // Connect to existing audio element so playback is shared
      media: audio ?? undefined,
      url: audioUrl,
      waveColor: "#C8C4BE",
      progressColor: isActive ? "#E8A020" : "#5C584F",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      height: 56,
      normalize: true,
      interact: false,
      fetchParams: { mode: "cors" },
    });

    wsRef.current = ws;

    return () => {
      ws.destroy();
      wsRef.current = null;
    };
  // Re-init whenever the track URL changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioUrl]);

  // Keep progress color in sync with active deck state
  useEffect(() => {
    wsRef.current?.setOptions({
      progressColor: isActive ? "#E8A020" : "#5C584F",
    });
  }, [isActive]);

  if (!audioUrl) {
    // Fallback static bars when no audio URL is available
    return (
    <div
      className="relative rounded-lg overflow-hidden flex items-center px-2 gap-[2px]"
      style={{ background: "#E8E5E0", height: "56px", flexShrink: 0 }}
    >
        {Array.from({ length: 80 }, (_, i) => (
          <div
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: `${30 + Math.sin(i * 0.3) * 20 + Math.sin(i * 0.07) * 15}%`,
              background: "#C8C4BE",
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ background: "#E8E5E0", height: "56px", flexShrink: 0 }}
    />
  );
};

export default Waveform;

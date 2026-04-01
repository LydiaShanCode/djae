import { Track } from "@/data/mockPlaylist";
import Waveform from "./Waveform";

interface SongBlockProps {
  track: Track | null;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  progress?: number;
}

const SongBlock = ({ track, isPlaying = false, isCurrentTrack = false, progress = 0 }: SongBlockProps) => {
  if (!track) {
    return (
      <div
        className="rounded-2xl p-6 min-h-[180px] flex items-center justify-center"
        style={{
          background: "#F0EDE8",
          border: "1px solid #D0CCC6",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ fontSize: "12px", color: "#B8B4AE" }}>No track loaded</p>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-5 transition-all duration-300"
      style={{
        background: "#F0EDE8",
        border: isCurrentTrack ? "1px solid #E8A020" : "1px solid #D0CCC6",
        boxShadow: isCurrentTrack
          ? "0 0 16px rgba(232,160,32,0.18), 0 1px 4px rgba(0,0,0,0.08)"
          : "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      {/* Album art thumbnail + track info */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: "1px solid #D0CCC6" }}
        >
          <img
            src={track.albumArtUrl}
            alt={track.album}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-normal truncate" style={{ color: "#2A2825", lineHeight: 1.2 }}>
            {track.title}
          </h3>
          <p className="truncate mt-0.5" style={{ fontSize: "13px", color: "#8A8680" }}>
            {track.artist}
          </p>
        </div>
      </div>

      {/* KEY / BPM badges */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ fontSize: "9px", color: "#B8B4AE", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            key
          </span>
          <span
            className="px-2 py-0.5 rounded font-mono"
            style={{ fontSize: "11px", color: "#5C584F", background: "#E8E5E0", border: "1px solid #D0CCC6" }}
          >
            10B
          </span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span style={{ fontSize: "9px", color: "#B8B4AE", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            bpm
          </span>
          <span
            className="px-2 py-0.5 rounded font-mono"
            style={{ fontSize: "11px", color: "#5C584F", background: "#E8E5E0", border: "1px solid #D0CCC6" }}
          >
            79
          </span>
        </div>
        {isCurrentTrack && (
          <div className="ml-auto flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isPlaying ? "#E8A020" : "#C8C4BE",
                boxShadow: isPlaying ? "0 0 5px rgba(232,160,32,0.7)" : "none",
              }}
            />
            <span
              style={{ fontSize: "9px", color: isPlaying ? "#E8A020" : "#B8B4AE", letterSpacing: "0.1em", textTransform: "uppercase" }}
            >
              {isPlaying ? "playing" : "cued"}
            </span>
          </div>
        )}
      </div>

      {/* Waveform */}
      <Waveform
        progress={isCurrentTrack ? progress : 0}
        isPlaying={isPlaying && isCurrentTrack}
        trackId={track.id}
        isActive={isCurrentTrack}
      />
    </div>
  );
};

export default SongBlock;

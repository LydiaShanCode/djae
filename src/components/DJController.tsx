import { useRef } from "react";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Track } from "@/data/mockPlaylist";
import VinylDeck from "./VinylDeck";
import SongBlock from "./SongBlock";
import EQVisualizer from "./EQVisualizer";

interface DJControllerProps {
  currentTrack: Track | null;
  nextTrack: Track | null;
  upcomingTracks: Track[];
  isPlaying: boolean;
  activeDeck: "left" | "right";
  playlistTitle?: string;
  playlistImage?: string;
  recordingTime?: string;
  currentProgress?: number;
  onPlayPause?: () => void;
  onSkip?: () => void;
  onPrevious?: () => void;
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  /** Fixed ref for Deck A (left turntable) — passed to left SongBlock waveform */
  audioRefA?: React.RefObject<HTMLAudioElement | null>;
  /** Fixed ref for Deck B (right turntable) — passed to right SongBlock waveform */
  audioRefB?: React.RefObject<HTMLAudioElement | null>;
  crossfaderPos?: number;
  onCrossfaderChange?: (pos: number) => void;
  /** Called when user commits crossfade to one side (releases fader at edge) */
  onCrossfadeCommit?: (deck: "a" | "b") => void;
}


const DJController = ({
  currentTrack,
  nextTrack,
  isPlaying,
  activeDeck,
  playlistTitle = "My Playlist",
  playlistImage,
  recordingTime = "0:00:00",
  currentProgress = 0,
  onPlayPause,
  onSkip,
  onPrevious,
  audioRef,
  audioRefA,
  audioRefB,
  crossfaderPos = 0,
  onCrossfaderChange,
  onCrossfadeCommit,
}: DJControllerProps) => {
  const faderTrackRef = useRef<HTMLDivElement>(null);

  // Display active deck is purely based on fader position — left dominates below 50%, right above.
  // This is independent of which deck is "committed" so visuals always follow the fader smoothly.
  const displayActiveDeck: "left" | "right" = crossfaderPos < 50 ? "left" : "right";

  const leftDeckTrack = activeDeck === "left" ? currentTrack : nextTrack;
  const rightDeckTrack = activeDeck === "right" ? currentTrack : nextTrack;
  const leftDeckPlaying = displayActiveDeck === "left" && isPlaying;
  const rightDeckPlaying = displayActiveDeck === "right" && isPlaying;

  return (
    <div
      className="rounded-3xl p-6 md:p-8"
      style={{
        background: "#F5F2EE",
        boxShadow: "0 2px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
        border: "1px solid #D8D5D0",
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        {/* Playing from chip */}
        <div
          className="flex items-center gap-2 pl-2.5 pr-1 py-1 rounded-full h-[26px]"
          style={{ border: "1px solid #D0CCC6", background: "#ECEAE6" }}
        >
          <span style={{ fontSize: "10px", color: "#8A8680", letterSpacing: "0.06em" }}>
            playing from
          </span>
          <div className="w-px h-2.5" style={{ background: "#C8C4BE" }} />
          <div className="flex items-center gap-1.5 pr-1">
            {playlistImage && (
              <img src={playlistImage} alt="" className="w-4 h-4 rounded-full object-cover" />
            )}
            <span style={{ fontSize: "10px", color: "#5C584F", fontWeight: 600 }}>
              {playlistTitle}
            </span>
          </div>
        </div>

        {/* REC / timer */}
        <div
          className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full h-[26px]"
          style={{ border: "1px solid #D0CCC6", background: "#ECEAE6" }}
        >
          {/* LED dot */}
          <div className="relative w-5 h-5 flex items-center justify-center">
            {isPlaying && (
              <div
                className="absolute inset-0 rounded-full animate-ping"
                style={{ background: "rgba(220,50,50,0.25)" }}
              />
            )}
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: isPlaying ? "#DC3232" : "#B8B4AE",
                boxShadow: isPlaying ? "0 0 6px rgba(220,50,50,0.6)" : "none",
              }}
            />
          </div>
          <span
            className="font-mono tabular-nums"
            style={{ fontSize: "10px", color: "#5C584F" }}
          >
            {recordingTime}
          </span>
        </div>
      </div>

      {/* Deck cards + center mixer */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-4 mb-8">
        <div className="min-w-0 overflow-hidden">
        <SongBlock
          track={activeDeck === "left" ? currentTrack : nextTrack}
          isPlaying={leftDeckPlaying}
          isCurrentTrack={displayActiveDeck === "left"}
          progress={activeDeck === "left" ? currentProgress : 0}
          audioRef={audioRefA ?? audioRef}
        />
        </div>

        {/* Center mixer */}
        <div className="flex flex-col items-center justify-between gap-5 px-2">
          {/* EQ Visualizer */}
          <EQVisualizer isPlaying={isPlaying} audioRef={audioRef} />

          {/* Full-width crossfader */}
          <div className="w-full flex flex-col gap-1.5">
            <div
              ref={faderTrackRef}
              className="relative w-full h-12 rounded-xl cursor-ew-resize select-none touch-none"
              style={{
                background: "#DEDBD6",
                boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.15), inset -1px -1px 3px rgba(255,255,255,0.8)",
              }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                const rect = e.currentTarget.getBoundingClientRect();
                // Clamp to 99 during drag — 100 is reserved for the release commit
                const pos = Math.max(0, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
                onCrossfaderChange?.(pos);
              }}
              onPointerMove={(e) => {
                if (!e.buttons) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = Math.max(0, Math.min(99, ((e.clientX - rect.left) / rect.width) * 100));
                onCrossfaderChange?.(pos);
              }}
              onPointerUp={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = ((e.clientX - rect.left) / rect.width) * 100;
                if (pos >= 95 && activeDeck === "left") {
                  // Committing to Deck B — fader stays on right, idle Deck A will load next song
                  onCrossfaderChange?.(99);
                  onCrossfadeCommit?.("b");
                } else if (pos <= 5 && activeDeck === "right") {
                  // Committing back to Deck A — fader stays on left, idle Deck B will load next song
                  onCrossfaderChange?.(1);
                  onCrossfadeCommit?.("a");
                }
              }}
            >
              {/* Groove track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-1.5 rounded-full"
                style={{ background: "#C8C4BE", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.2)" }}
              />
              {/* Filled portion showing mix position */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-3 h-1.5 rounded-full pointer-events-none"
                style={{
                  width: `calc((100% - 24px) * ${crossfaderPos / 100})`,
                  background: crossfaderPos > 50 ? "#E8A020" : "#8A8680",
                  opacity: 0.6,
                }}
              />
              {/* Fader handle — pill capsule */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-14 h-9 rounded-xl flex flex-col items-center justify-center gap-1 pointer-events-none"
                style={{
                  left: `calc(4px + (100% - 64px) * ${crossfaderPos} / 100)`,
                  background: "linear-gradient(160deg, #ECEAE6 0%, #DEDBD6 100%)",
                  border: "1px solid #C8C4BE",
                  boxShadow: "2px 2px 6px rgba(0,0,0,0.18), -1px -1px 4px rgba(255,255,255,0.9)",
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="w-6 rounded-full" style={{ height: "1.5px", background: "#B8B4AE" }} />
                ))}
              </div>
            </div>
            {/* A / B labels — highlight based on fader position */}
            <div className="flex justify-between px-1">
              <span style={{
                fontSize: "9px",
                letterSpacing: "0.1em",
                fontWeight: crossfaderPos < 30 ? 700 : 400,
                color: crossfaderPos < 30 ? "#E8A020" : "#B8B4AE",
                transition: "color 0.15s, font-weight 0.15s",
              }}>A</span>
              <span style={{
                fontSize: "9px",
                letterSpacing: "0.1em",
                fontWeight: crossfaderPos > 70 ? 700 : 400,
                color: crossfaderPos > 70 ? "#E8A020" : "#B8B4AE",
                transition: "color 0.15s, font-weight 0.15s",
              }}>B</span>
            </div>
          </div>

          {/* Transport controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrevious}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "#ECEAE6",
                border: "1px solid #D0CCC6",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.12), -1px -1px 3px rgba(255,255,255,0.9)",
              }}
            >
              <SkipBack className="w-3.5 h-3.5" style={{ color: "#5C584F" }} fill="currentColor" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={{
                background: isPlaying
                  ? "linear-gradient(135deg, #E8A020 0%, #C8880A 100%)"
                  : "linear-gradient(135deg, #3D3A35 0%, #1A1816 100%)",
                boxShadow: "3px 3px 8px rgba(0,0,0,0.22), -1px -1px 4px rgba(255,255,255,0.7)",
              }}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 text-white" fill="currentColor" />
              ) : (
                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
              )}
            </button>

            <button
              onClick={onSkip}
              className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              style={{
                background: "#ECEAE6",
                border: "1px solid #D0CCC6",
                boxShadow: "2px 2px 5px rgba(0,0,0,0.12), -1px -1px 3px rgba(255,255,255,0.9)",
              }}
            >
              <SkipForward className="w-3.5 h-3.5" style={{ color: "#5C584F" }} fill="currentColor" />
            </button>
          </div>
        </div>

        <div className="min-w-0 overflow-hidden">
        <SongBlock
          track={activeDeck === "right" ? currentTrack : nextTrack}
          isPlaying={rightDeckPlaying}
          isCurrentTrack={displayActiveDeck === "right"}
          progress={activeDeck === "right" ? currentProgress : 0}
          audioRef={audioRefB ?? audioRef}
        />
        </div>
      </div>

      {/* Turntable decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <VinylDeck track={leftDeckTrack} isPlaying={leftDeckPlaying} side="left" />
        <VinylDeck track={rightDeckTrack} isPlaying={rightDeckPlaying} side="right" />
      </div>
    </div>
  );
};

export default DJController;

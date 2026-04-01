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
}: DJControllerProps) => {
  const leftDeckTrack = activeDeck === "left" ? currentTrack : nextTrack;
  const rightDeckTrack = activeDeck === "right" ? currentTrack : nextTrack;
  const leftDeckPlaying = activeDeck === "left" && isPlaying;
  const rightDeckPlaying = activeDeck === "right" && isPlaying;

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
          isCurrentTrack={activeDeck === "left"}
          progress={activeDeck === "left" ? currentProgress : 0}
          audioRef={activeDeck === "left" ? audioRef : undefined}
        />
        </div>

        {/* Center mixer */}
        <div className="flex flex-col items-center justify-between gap-5 px-2">
          {/* EQ Visualizer */}
          <EQVisualizer isPlaying={isPlaying} audioRef={audioRef} />

          {/* Full-width crossfader */}
          <div className="w-full flex flex-col gap-1.5">
            <div
              className="relative w-full h-12 rounded-xl"
              style={{
                background: "#DEDBD6",
                boxShadow: "inset 2px 2px 6px rgba(0,0,0,0.15), inset -1px -1px 3px rgba(255,255,255,0.8)",
              }}
            >
              {/* Groove track */}
              <div
                className="absolute top-1/2 -translate-y-1/2 left-3 right-3 h-1.5 rounded-full"
                style={{ background: "#C8C4BE", boxShadow: "inset 1px 1px 3px rgba(0,0,0,0.2)" }}
              />
              {/* Fader handle — pill capsule */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-14 h-9 rounded-xl transition-all duration-300 flex flex-col items-center justify-center gap-1"
                style={{
                  left: activeDeck === "left" ? "4px" : "calc(100% - 60px)",
                  background: "linear-gradient(160deg, #ECEAE6 0%, #DEDBD6 100%)",
                  border: "1px solid #C8C4BE",
                  boxShadow: "2px 2px 6px rgba(0,0,0,0.18), -1px -1px 4px rgba(255,255,255,0.9)",
                }}
              >
                {/* Grip lines */}
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-6 rounded-full"
                    style={{ height: "1.5px", background: "#B8B4AE" }}
                  />
                ))}
              </div>
            </div>
            {/* A / B labels */}
            <div className="flex justify-between px-1">
              <span style={{ fontSize: "9px", color: "#999", letterSpacing: "0.1em" }}>A</span>
              <span style={{ fontSize: "9px", color: "#999", letterSpacing: "0.1em" }}>B</span>
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
          isCurrentTrack={activeDeck === "right"}
          progress={activeDeck === "right" ? currentProgress : 0}
          audioRef={activeDeck === "right" ? audioRef : undefined}
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

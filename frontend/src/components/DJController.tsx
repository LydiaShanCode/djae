import { Track } from "@/data/mockPlaylist";
import VinylDeck from "./VinylDeck";
import SongBlock from "./SongBlock";

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
}

const DJController = ({ 
  currentTrack,
  nextTrack,
  upcomingTracks, 
  isPlaying,
  activeDeck,
  playlistTitle = "Performative Male",
  playlistImage,
  recordingTime = "1:00:49",
  currentProgress = 0
}: DJControllerProps) => {
  // Determine which track goes on which deck based on active deck
  const leftDeckTrack = activeDeck === "left" ? currentTrack : nextTrack;
  const rightDeckTrack = activeDeck === "right" ? currentTrack : nextTrack;
  
  // Determine which deck is playing
  const leftDeckPlaying = activeDeck === "left" && isPlaying;
  const rightDeckPlaying = activeDeck === "right" && isPlaying;

  // For the song blocks, show current track on active side, next track on inactive side
  const leftBlockTrack = activeDeck === "left" ? currentTrack : nextTrack;
  const rightBlockTrack = activeDeck === "right" ? currentTrack : nextTrack;

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 shadow-lg">
      {/* Header - Playing from and Live Badge */}
      <div className="flex items-center justify-between mb-6">
        {/* Playing from chip - 30px height, 3px padding on right (icon side) */}
        <div className="flex items-center gap-2 pl-3 pr-[3px] py-1.5 border border-gray-200 rounded-full bg-white h-[30px]">
          <span className="text-xs text-gray-500">Playing from</span>
          <div className="w-px h-3 bg-gray-200"></div>
          <div className="flex items-center gap-1.5">
            <img 
              src={playlistImage || currentTrack?.albumArtUrl || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=100&h=100&fit=crop"} 
              alt={playlistTitle}
              className="w-4 h-4 rounded-full object-cover"
            />
            <span className="text-xs font-medium text-gray-900">{playlistTitle}</span>
          </div>
        </div>
        
        {/* Live Badge - 30px height, 3px padding on left (icon side) */}
        <div className="flex items-center gap-2 pl-[3px] pr-3 py-1.5 border border-gray-200 rounded-full bg-white h-[30px]">
          <div className="relative flex items-center justify-center">
            {/* Outer glow ring - only visible when playing */}
            {isPlaying && (
              <div className="absolute inset-0 w-6 h-6 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                <div className="w-full h-full rounded-full bg-red-500/30 animate-ping"></div>
              </div>
            )}
            {/* Inner glow ring - always red */}
            <div className="relative w-5 h-5 rounded-full flex items-center justify-center bg-red-500/20">
              {/* Red dot - always red */}
              <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
            </div>
          </div>
          <span className="text-xs font-mono text-gray-600 tabular-nums">{recordingTime}</span>
        </div>
      </div>

      {/* Track Info Cards and Center Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 mb-8">
        {/* Left Track Card */}
        <SongBlock 
          track={leftBlockTrack} 
          isPlaying={leftDeckPlaying} 
          isCurrentTrack={activeDeck === "left"}
          progress={activeDeck === "left" ? currentProgress : 0}
        />

        {/* Center Knobs */}
        <div className="flex flex-col items-center justify-center gap-6 px-8">
          {/* Top Row Knobs */}
          <div className="flex gap-8">
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400">Wub Wub</span>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-neumorphic flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-white shadow-inner"></div>
                <div className="absolute w-1 h-6 bg-gray-400 rounded-full" style={{ transform: 'rotate(45deg)' }}></div>
              </div>
              <span className="text-xs text-gray-400">Bass</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs text-gray-400">Sparkle</span>
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 shadow-neumorphic flex items-center justify-center relative">
                <div className="w-12 h-12 rounded-full bg-white shadow-inner"></div>
                <div className="absolute w-1 h-6 bg-gray-400 rounded-full" style={{ transform: 'rotate(-30deg)' }}></div>
              </div>
              <span className="text-xs text-gray-400">Woosh</span>
            </div>
          </div>

          {/* Crossfader */}
          <div className="w-48 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl shadow-neumorphic-inset flex items-center justify-center p-4">
            <div className="relative w-full h-12 bg-gray-300 rounded-lg shadow-inner">
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-16 h-10 bg-white rounded-lg shadow-lg transition-all duration-300"
                style={{ 
                  left: activeDeck === "left" ? "0%" : "calc(100% - 4rem)"
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Right Track Card */}
        <SongBlock 
          track={rightBlockTrack} 
          isPlaying={rightDeckPlaying} 
          isCurrentTrack={activeDeck === "right"}
          progress={activeDeck === "right" ? currentProgress : 0}
        />
      </div>

      {/* Turntable Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <VinylDeck track={leftDeckTrack} isPlaying={leftDeckPlaying} side="left" />
        <VinylDeck track={rightDeckTrack} isPlaying={rightDeckPlaying} side="right" />
      </div>
    </div>
  );
};

export default DJController;
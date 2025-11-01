import { Track } from "@/data/mockPlaylist";
import VinylDeck from "./VinylDeck";

interface DJControllerProps {
  currentTrack: Track | null;
  upcomingTracks: Track[];
  isPlaying: boolean;
  playlistTitle?: string;
  playlistImage?: string;
  recordingTime?: string;
}

const DJController = ({ 
  currentTrack, 
  upcomingTracks, 
  isPlaying,
  playlistTitle = "Performative Male",
  playlistImage,
  recordingTime = "1:00:49"
}: DJControllerProps) => {
  const nextTrack = upcomingTracks[0] || null;

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
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
          {currentTrack && (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {currentTrack.title}
              </h3>
              <p className="text-lg text-gray-400 mb-3">{currentTrack.artist}</p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-100 rounded">10B</span>
                <span className="px-2 py-1 bg-gray-100 rounded">79</span>
              </div>
              
              {/* Waveform */}
              <div className="mt-4 h-16 bg-gray-900 rounded-lg flex items-center px-2">
                <div className="flex items-center gap-0.5 h-full w-full">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white rounded-full"
                      style={{
                        height: `${20 + Math.random() * 80}%`,
                        opacity: isPlaying && i < 40 ? 1 : 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

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
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-10 bg-white rounded-lg shadow-lg"></div>
            </div>
          </div>
        </div>

        {/* Right Track Card */}
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
          {nextTrack && (
            <>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {nextTrack.title}
              </h3>
              <p className="text-lg text-gray-400 mb-3">{nextTrack.artist}</p>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-100 rounded">10B</span>
                <span className="px-2 py-1 bg-gray-100 rounded">79</span>
              </div>
              
              {/* Waveform */}
              <div className="mt-4 h-16 bg-gray-200 rounded-lg flex items-center px-2">
                <div className="flex items-center gap-0.5 h-full w-full">
                  {Array.from({ length: 80 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gray-400 rounded-full"
                      style={{
                        height: `${20 + Math.random() * 80}%`,
                        opacity: 0.3,
                      }}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Turntable Decks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <VinylDeck track={currentTrack} isPlaying={isPlaying} side="left" />
        <VinylDeck track={nextTrack} isPlaying={false} side="right" />
      </div>
    </div>
  );
};

export default DJController;
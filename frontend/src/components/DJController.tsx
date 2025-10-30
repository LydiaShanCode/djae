import { Track } from "@/data/mockPlaylist";
import VinylDeck from "./VinylDeck";

interface DJControllerProps {
  currentTrack: Track | null;
  upcomingTracks: Track[];
  isPlaying: boolean;
}

const DJController = ({ currentTrack, upcomingTracks, isPlaying }: DJControllerProps) => {
  const nextTrack = upcomingTracks[0] || null;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-neumorphic">
      {/* Recording indicator */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-sm text-gray-600">1:00:49</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left Deck */}
        <div>
          <VinylDeck track={currentTrack} isPlaying={isPlaying} side="left" />
        </div>

        {/* Center Mixer Controls */}
        <div className="flex flex-col items-center gap-6">
          {/* Top buttons grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 shadow-sm"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-200 to-blue-300 shadow-sm"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Crossfader */}
          <div className="w-full max-w-xs">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl p-4 shadow-neumorphic-inset">
              <div className="relative h-32 flex items-center">
                {/* Vertical faders */}
                <div className="flex gap-8 justify-center w-full">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="relative h-full w-8">
                      <div className="absolute inset-0 bg-gray-300 rounded-full shadow-inner"></div>
                      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-10 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-lg shadow-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom buttons grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-sm"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex gap-1">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="w-3 h-3 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 shadow-sm"
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Deck */}
        <div>
          <VinylDeck track={nextTrack} isPlaying={false} side="right" />
        </div>
      </div>
    </div>
  );
};

export default DJController;
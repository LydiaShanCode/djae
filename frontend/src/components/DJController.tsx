import { Track } from "@/data/mockPlaylist";
import { Music } from "lucide-react";

interface DJControllerProps {
  currentTrack: Track | null;
  upcomingTracks: Track[];
}

const DJController = ({ currentTrack, upcomingTracks }: DJControllerProps) => {
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-8 shadow-2xl border border-gray-700">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Now Playing - Left Deck */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-400 font-semibold text-sm uppercase tracking-wider">
              Now Playing
            </span>
          </div>
          
          {currentTrack ? (
            <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 rounded-lg p-6 border-2 border-purple-500/50 shadow-lg">
              <div className="aspect-square mb-4 rounded-lg overflow-hidden shadow-xl">
                <img
                  src={currentTrack.albumArtUrl}
                  alt={currentTrack.album}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 truncate">
                {currentTrack.title}
              </h3>
              <p className="text-purple-300 text-lg truncate">{currentTrack.artist}</p>
              <p className="text-gray-400 text-sm mt-1 truncate">{currentTrack.album}</p>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg p-6 border-2 border-gray-700 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <Music className="w-16 h-16 mx-auto mb-3 opacity-30" />
                <p>No track loaded</p>
              </div>
            </div>
          )}
        </div>

        {/* Up Next - Right Deck */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-blue-400 font-semibold text-sm uppercase tracking-wider">
              Up Next
            </span>
          </div>

          <div className="space-y-3">
            {upcomingTracks.length > 0 ? (
              upcomingTracks.slice(0, 3).map((track, index) => (
                <div
                  key={track.id}
                  className="bg-gray-800/60 rounded-lg p-4 border border-gray-700 hover:border-blue-500/50 transition-all"
                >
                  <div className="flex gap-4">
                    <div className="relative">
                      <img
                        src={track.albumArtUrl}
                        alt={track.album}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="absolute -top-2 -left-2 bg-blue-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold truncate">
                        {track.title}
                      </h4>
                      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 h-full flex items-center justify-center">
                <p className="text-gray-500 text-center">No upcoming tracks</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DJController;
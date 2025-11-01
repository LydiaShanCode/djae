import { Track } from "@/data/mockPlaylist";

interface VinylDeckProps {
  track: Track | null;
  isPlaying: boolean;
  side: "left" | "right";
}

const VinylDeck = ({ track, isPlaying, side }: VinylDeckProps) => {
  return (
    <div className="relative">
      {/* Turntable Base */}
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-3xl p-8 shadow-xl">
        {/* Control Button (top left) */}
        <div className="absolute top-6 left-6 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        </div>

        {/* Vinyl Record */}
        <div className="relative w-72 h-72 mx-auto">
          {/* Outer ring - vinyl */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl">
            {/* Grooves effect */}
            <div className="absolute inset-3 rounded-full border-2 border-gray-700 opacity-20"></div>
            <div className="absolute inset-6 rounded-full border-2 border-gray-700 opacity-15"></div>
            <div className="absolute inset-9 rounded-full border-2 border-gray-700 opacity-10"></div>
            
            {/* Album art */}
            {track && (
              <div className="absolute inset-16 rounded-full overflow-hidden shadow-2xl border-4 border-gray-900">
                <img
                  src={track.albumArtUrl}
                  alt={track.album}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                  style={{ animationDuration: '4s' }}
                />
              </div>
            )}
            
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full shadow-xl flex items-center justify-center border-4 border-gray-800">
              <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Tonearm */}
        <div className={`absolute ${side === "left" ? "right-8" : "left-8"} top-1/2 -translate-y-1/2`}>
          <div className="relative w-40 h-2">
            {/* Arm base */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full shadow-lg"></div>
            
            {/* Arm */}
            <div 
              className="absolute right-5 top-1/2 -translate-y-1/2 w-32 h-2 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-lg origin-right"
              style={{ transform: `translateY(-50%) rotate(${side === "left" ? "-30deg" : "30deg"})` }}
            >
              {/* Needle head */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full shadow-md">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-3 bg-gray-700"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Play indicator */}
        <div className="absolute bottom-6 left-6">
          <div className={`w-4 h-4 rounded-full ${isPlaying ? 'bg-pink-500' : 'bg-gray-400'} shadow-lg`}></div>
        </div>
      </div>
    </div>
  );
};

export default VinylDeck;
import { Track } from "@/data/mockPlaylist";

interface VinylDeckProps {
  track: Track | null;
  isPlaying: boolean;
  side: "left" | "right";
}

const VinylDeck = ({ track, isPlaying, side }: VinylDeckProps) => {
  return (
    <div className="relative">
      {/* Track Info */}
      {track && (
        <div className="mb-3 md:mb-4 text-center">
          <h3 className="text-base md:text-xl font-bold text-gray-800 mb-1 truncate px-2">
            {track.title}
          </h3>
          <p className="text-sm md:text-base text-gray-500 truncate px-2">{track.artist}</p>
          <div className="flex items-center justify-center gap-3 md:gap-4 mt-2 text-xs md:text-sm text-gray-400">
            <span>10B</span>
            <span>79</span>
          </div>
        </div>
      )}

      {/* Waveform */}
      <div className="mb-4 md:mb-6 h-8 md:h-12 flex items-center justify-center px-2">
        <div className="flex items-center gap-0.5 h-full max-w-full overflow-hidden">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gray-300 rounded-full flex-shrink-0"
              style={{
                height: `${Math.random() * 100}%`,
                opacity: isPlaying && i < 20 ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Turntable Base */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-neumorphic">
        {/* Control Button (top left) */}
        <div className="absolute top-3 left-3 md:top-6 md:left-6 w-6 h-6 md:w-8 md:h-8 bg-white rounded-full shadow-neumorphic-inset flex items-center justify-center">
          <div className="w-3 h-3 md:w-4 md:h-4 bg-gray-300 rounded-full"></div>
        </div>

        {/* Vinyl Record */}
        <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-vinyl">
            {/* Grooves effect */}
            <div className="absolute inset-2 rounded-full border-2 border-gray-700 opacity-30"></div>
            <div className="absolute inset-4 rounded-full border-2 border-gray-700 opacity-20"></div>
            <div className="absolute inset-6 rounded-full border-2 border-gray-700 opacity-10"></div>
            
            {/* Album art */}
            {track && (
              <div className="absolute inset-8 sm:inset-10 md:inset-12 rounded-full overflow-hidden shadow-lg">
                <img
                  src={track.albumArtUrl}
                  alt={track.album}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                  style={{ animationDuration: '3s' }}
                />
              </div>
            )}
            
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-2 h-2 md:w-3 md:h-3 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Tonearm */}
        <div className={`absolute ${side === "left" ? "right-4 md:right-8" : "left-4 md:left-8"} top-1/2 -translate-y-1/2`}>
          <div className="relative w-20 md:w-32 h-2">
            {/* Arm base */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-lg"></div>
            
            {/* Arm */}
            <div 
              className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-16 md:w-24 h-1 md:h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-md origin-right"
              style={{ transform: `translateY(-50%) rotate(${side === "left" ? "-25deg" : "25deg"})` }}
            >
              {/* Needle */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-1.5 md:w-2 md:h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Play indicator */}
        <div className="absolute bottom-3 md:bottom-6 left-1/2 -translate-x-1/2">
          <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${isPlaying ? 'bg-pink-500' : 'bg-gray-400'} shadow-lg`}></div>
        </div>
      </div>
    </div>
  );
};

export default VinylDeck;
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
        <div className="mb-4 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-1">{track.title}</h3>
          <p className="text-gray-500">{track.artist}</p>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-400">
            <span>10B</span>
            <span>79</span>
          </div>
        </div>
      )}

      {/* Waveform */}
      <div className="mb-6 h-12 flex items-center justify-center">
        <div className="flex items-center gap-0.5 h-full">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gray-300 rounded-full"
              style={{
                height: `${Math.random() * 100}%`,
                opacity: isPlaying && i < 30 ? 1 : 0.3,
              }}
            />
          ))}
        </div>
      </div>

      {/* Turntable Base */}
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 shadow-neumorphic">
        {/* Control Button (top left) */}
        <div className="absolute top-6 left-6 w-8 h-8 bg-white rounded-full shadow-neumorphic-inset flex items-center justify-center">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        </div>

        {/* Vinyl Record */}
        <div className="relative w-64 h-64 mx-auto">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-black shadow-vinyl">
            {/* Grooves effect */}
            <div className="absolute inset-2 rounded-full border-2 border-gray-700 opacity-30"></div>
            <div className="absolute inset-4 rounded-full border-2 border-gray-700 opacity-20"></div>
            <div className="absolute inset-6 rounded-full border-2 border-gray-700 opacity-10"></div>
            
            {/* Album art */}
            {track && (
              <div className="absolute inset-12 rounded-full overflow-hidden shadow-lg">
                <img
                  src={track.albumArtUrl}
                  alt={track.album}
                  className={`w-full h-full object-cover ${isPlaying ? 'animate-spin-slow' : ''}`}
                  style={{ animationDuration: '3s' }}
                />
              </div>
            )}
            
            {/* Center label */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full shadow-lg flex items-center justify-center">
              <div className="w-3 h-3 bg-gray-800 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Tonearm */}
        <div className={`absolute ${side === "left" ? "right-8" : "left-8"} top-1/2 -translate-y-1/2`}>
          <div className="relative w-32 h-2">
            {/* Arm base */}
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full shadow-lg"></div>
            
            {/* Arm */}
            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-1.5 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full shadow-md origin-right"
              style={{ transform: `translateY(-50%) rotate(${side === "left" ? "-25deg" : "25deg"})` }}
            >
              {/* Needle */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Play indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-pink-500' : 'bg-gray-400'} shadow-lg`}></div>
        </div>
      </div>
    </div>
  );
};

export default VinylDeck;
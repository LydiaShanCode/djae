import { Track } from "@/data/mockPlaylist";

interface VinylDiskProps {
  track: Track | null;
  isPlaying: boolean;
}

const VinylDisk = ({ track, isPlaying }: VinylDiskProps) => {
  return (
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
  );
};

export default VinylDisk;
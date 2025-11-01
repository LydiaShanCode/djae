import { Track } from "@/data/mockPlaylist";
import VinylDisk from "./VinylDisk";
import Stylus from "./Stylus";

interface DiskPlayerProps {
  track: Track | null;
  isPlaying: boolean;
  side: "left" | "right";
}

const DiskPlayer = ({ track, isPlaying, side }: DiskPlayerProps) => {
  return (
    <div className="relative">
      {/* Turntable Base with noise effect */}
      <div className="relative bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100 rounded-3xl p-8 shadow-xl overflow-hidden">
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        {/* Control Button (top left) */}
        <div className="absolute top-6 left-6 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center z-10">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
        </div>

        {/* Vinyl Disk */}
        <VinylDisk track={track} isPlaying={isPlaying} />

        {/* Stylus */}
        <Stylus isPlaying={isPlaying} side={side} />

        {/* Play indicator */}
        <div className="absolute bottom-6 left-6">
          <div className={`w-4 h-4 rounded-full ${isPlaying ? 'bg-pink-500' : 'bg-gray-400'} shadow-lg`}></div>
        </div>
      </div>
    </div>
  );
};

export default DiskPlayer;
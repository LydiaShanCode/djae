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
      <div
        className="relative rounded-3xl p-8 shadow-xl overflow-hidden"
        style={{ background: "linear-gradient(135deg, #ECEAE6 0%, #DEDBD6 100%)" }}
      >
        {/* Brushed metal noise */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
          }}
        />

        {/* Control button */}
        <div
          className="absolute top-6 left-6 w-7 h-7 rounded-full flex items-center justify-center z-10 shadow-md"
          style={{ background: "#DEDBD6", border: "1px solid #C8C4BE" }}
        >
          <div className="w-3 h-3 rounded-full" style={{ background: "#B8B4AE" }} />
        </div>

        {/* Vinyl platter */}
        <VinylDisk track={track} isPlaying={isPlaying} />

        {/* Stylus arm */}
        <Stylus isPlaying={isPlaying} side={side} />

        {/* Amber LED indicator */}
        <div className="absolute bottom-6 left-6">
          <div
            className="w-3 h-3 rounded-full shadow-lg transition-colors duration-300"
            style={{
              background: isPlaying ? "#E8A020" : "#C8C4BE",
              boxShadow: isPlaying ? "0 0 8px rgba(232,160,32,0.6)" : "none",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DiskPlayer;

import { Track } from "@/data/mockPlaylist";
import Waveform from "./Waveform";

interface SongBlockProps {
  track: Track | null;
  isPlaying?: boolean;
  isCurrentTrack?: boolean;
  progress?: number; // 0-100 percentage
}

const SongBlock = ({ track, isPlaying = false, isCurrentTrack = false, progress = 0 }: SongBlockProps) => {
  if (!track) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 min-h-[200px]">
        <p className="text-gray-400 text-center">No track loaded</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6">
      <h3 className="text-2xl font-normal text-gray-900 mb-1">
        {track.title}
      </h3>
      <p className="text-lg text-gray-400 mb-3">{track.artist}</p>
      <div className="flex items-center gap-3 text-sm text-gray-600">
        <span className="px-2 py-1 bg-gray-100 rounded">10B</span>
        <span className="px-2 py-1 bg-gray-100 rounded">79</span>
      </div>
      
      {/* Waveform */}
      <div className="mt-4">
        <Waveform 
          progress={isCurrentTrack ? progress : 0} 
          isPlaying={isPlaying && isCurrentTrack}
          trackId={track.id}
        />
      </div>
    </div>
  );
};

export default SongBlock;
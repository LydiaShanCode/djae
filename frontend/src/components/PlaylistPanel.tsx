import { useState } from "react";
import { Track, formatDuration, formatTotalDuration } from "@/data/mockPlaylist";
import { GripVertical, Music } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlaylistPanelProps {
  playlistTitle: string;
  tracks: Track[];
  totalDuration: number;
  currentTrackId: string | null;
  onReorder: (newTracks: Track[]) => void;
  onTrackSelect: (trackIndex: number) => void;
}

const PlaylistPanel = ({
  playlistTitle,
  tracks,
  totalDuration,
  currentTrackId,
  onReorder,
  onTrackSelect,
}: PlaylistPanelProps) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newTracks = [...tracks];
    const [draggedTrack] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(dropIndex, 0, draggedTrack);

    onReorder(newTracks);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const currentTrack = tracks.find(t => t.id === currentTrackId);

  return (
    <div className="bg-white rounded-2xl md:rounded-3xl shadow-neumorphic h-full flex flex-col overflow-hidden">
      {/* Now Playing Card */}
      {currentTrack && (
        <div className="p-4 border-b border-gray-200">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl md:rounded-2xl p-3 flex items-center gap-3 md:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg md:rounded-xl overflow-hidden shadow-lg flex-shrink-0">
              <img
                src={currentTrack.albumArtUrl}
                alt={currentTrack.album}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 mb-1">Now Playing:</p>
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-800 truncate">
                {currentTrack.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 truncate">{currentTrack.artist}</p>
            </div>
          </div>
        </div>
      )}

      {/* Track List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-1">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              onClick={() => onTrackSelect(index)}
              className={`
                w-full group flex items-center gap-2 sm:gap-2.5 md:gap-3 p-3 rounded-lg md:rounded-xl transition-all cursor-move
                ${currentTrackId === track.id 
                  ? 'bg-gray-100' 
                  : 'hover:bg-gray-50'
                }
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${dragOverIndex === index && draggedIndex !== index ? 'border-t-2 border-blue-400' : ''}
              `}
            >
              {/* Drag Handle */}
              <div className="text-gray-300 group-hover:text-gray-400 transition-colors flex-shrink-0">
                <GripVertical className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
              </div>

              {/* Album Art */}
              <img
                src={track.albumArtUrl}
                alt={track.album}
                className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-md md:rounded-lg object-cover flex-shrink-0 shadow-sm"
              />

              {/* Track Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 truncate text-xs sm:text-sm">
                  {track.title}
                </h4>
                <p className="text-gray-500 text-xs truncate">{track.artist}</p>
              </div>

              {/* Metadata - Hidden on very small screens */}
              <div className="hidden sm:flex items-center gap-2 md:gap-3 text-xs text-gray-400 flex-shrink-0">
                <span>10B</span>
                <span>79</span>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistPanel;
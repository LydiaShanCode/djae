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

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl shadow-2xl border border-gray-700 h-full flex flex-col">
      {/* Playlist Header */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-start gap-4">
          <div className="bg-gradient-to-br from-purple-600 to-indigo-600 p-4 rounded-lg">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{playlistTitle}</h2>
            <div className="flex gap-4 text-sm text-gray-400">
              <span>{tracks.length} tracks</span>
              <span>•</span>
              <span>{formatTotalDuration(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Track List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
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
                group relative bg-gray-800/60 rounded-lg p-3 border transition-all cursor-move
                ${currentTrackId === track.id 
                  ? 'border-purple-500 bg-purple-900/30' 
                  : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800'
                }
                ${draggedIndex === index ? 'opacity-50' : ''}
                ${dragOverIndex === index && draggedIndex !== index ? 'border-blue-500 border-t-2' : ''}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Drag Handle */}
                <div className="text-gray-500 group-hover:text-gray-300 transition-colors">
                  <GripVertical className="w-5 h-5" />
                </div>

                {/* Track Number */}
                <div className={`
                  w-8 text-center font-semibold text-sm
                  ${currentTrackId === track.id ? 'text-purple-400' : 'text-gray-500'}
                `}>
                  {index + 1}
                </div>

                {/* Album Art */}
                <img
                  src={track.albumArtUrl}
                  alt={track.album}
                  className="w-12 h-12 rounded object-cover"
                />

                {/* Track Info */}
                <div className="flex-1 min-w-0">
                  <h4 className={`
                    font-semibold truncate
                    ${currentTrackId === track.id ? 'text-purple-300' : 'text-white'}
                  `}>
                    {track.title}
                  </h4>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>

                {/* Duration */}
                <div className="text-gray-400 text-sm">
                  {formatDuration(track.duration)}
                </div>
              </div>

              {/* Now Playing Indicator */}
              {currentTrackId === track.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500 rounded-l-lg"></div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistPanel;
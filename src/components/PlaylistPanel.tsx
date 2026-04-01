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
    <div
      className="rounded-2xl md:rounded-3xl h-full flex flex-col overflow-hidden"
      style={{
        background: "#F5F2EE",
        border: "1px solid #D0CCC6",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
      }}
    >
      {/* Channel strip header */}
      <div
        className="flex items-center px-4 py-2.5"
        style={{ borderBottom: "1px solid #D0CCC6" }}
      >
        <span style={{ fontSize: "9px", color: "#B8B4AE", letterSpacing: "0.14em", textTransform: "uppercase" }}>
          queue — {tracks.length} tracks
        </span>
      </div>

      {/* Track List */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {tracks.map((track, index) => {
            const isActive = currentTrackId === track.id;
            return (
              <div
                key={track.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                onClick={() => onTrackSelect(index)}
                className={`
                  relative w-full flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all
                  ${draggedIndex === index ? "opacity-40" : ""}
                  ${dragOverIndex === index && draggedIndex !== index ? "border-t border-amber-400" : ""}
                `}
                style={{
                  background: isActive ? "#EDE9E2" : "transparent",
                  borderBottom: "1px solid #EAE7E2",
                }}
              >
                {/* Amber channel strip LED */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full transition-all duration-300"
                  style={{
                    background: isActive ? "#E8A020" : "transparent",
                    boxShadow: isActive ? "0 0 6px rgba(232,160,32,0.5)" : "none",
                  }}
                />

                {/* Channel number */}
                <span
                  className="font-mono flex-shrink-0 w-5 text-right"
                  style={{ fontSize: "10px", color: isActive ? "#E8A020" : "#C8C4BE" }}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {/* Drag handle */}
                <div className="flex-shrink-0" style={{ color: "#D0CCC6" }}>
                  <GripVertical className="w-3 h-3" />
                </div>

                {/* Album art */}
                <img
                  src={track.albumArtUrl}
                  alt={track.album}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                  style={{ border: "1px solid #D0CCC6" }}
                />

                {/* Track info */}
                <div className="flex-1 min-w-0">
                  <p
                    className="truncate font-medium"
                    style={{ fontSize: "12px", color: isActive ? "#2A2825" : "#5C584F" }}
                  >
                    {track.title}
                  </p>
                  <p className="truncate" style={{ fontSize: "10px", color: "#8A8680" }}>
                    {track.artist}
                  </p>
                </div>

                {/* BPM / key */}
                <div
                  className="hidden sm:flex flex-col items-end gap-0.5 flex-shrink-0"
                  style={{ fontSize: "9px", color: "#B8B4AE", fontVariantNumeric: "tabular-nums" }}
                >
                  <span>10B</span>
                  <span>79</span>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default PlaylistPanel;
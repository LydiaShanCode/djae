import { Track } from "@/data/mockPlaylist";
import DiskPlayer from "./DiskPlayer";

interface VinylDeckProps {
  track: Track | null;
  isPlaying: boolean;
  side: "left" | "right";
}

const VinylDeck = ({ track, isPlaying, side }: VinylDeckProps) => {
  return <DiskPlayer track={track} isPlaying={isPlaying} side={side} />;
};

export default VinylDeck;
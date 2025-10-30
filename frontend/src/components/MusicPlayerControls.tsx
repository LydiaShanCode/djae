import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MusicPlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onSkip: () => void;
  onPrevious: () => void;
}

const MusicPlayerControls = ({
  isPlaying,
  onPlayPause,
  onSkip,
  onPrevious,
}: MusicPlayerControlsProps) => {
  return (
    <div className="bg-white rounded-3xl p-6 shadow-neumorphic">
      <div className="flex items-center justify-center gap-4">
        <Button
          onClick={onPrevious}
          size="lg"
          variant="ghost"
          className="w-12 h-12 rounded-full hover:bg-gray-100"
        >
          <SkipBack className="w-6 h-6 text-gray-800" fill="currentColor" />
        </Button>
        
        <Button
          onClick={onPlayPause}
          size="lg"
          className="w-16 h-16 rounded-full bg-white shadow-neumorphic hover:shadow-neumorphic-inset"
        >
          {isPlaying ? (
            <Pause className="w-7 h-7 text-gray-800" fill="currentColor" />
          ) : (
            <Play className="w-7 h-7 text-gray-800 ml-1" fill="currentColor" />
          )}
        </Button>
        
        <Button
          onClick={onSkip}
          size="lg"
          variant="ghost"
          className="w-12 h-12 rounded-full hover:bg-gray-100"
        >
          <SkipForward className="w-6 h-6 text-gray-800" fill="currentColor" />
        </Button>
      </div>
    </div>
  );
};

export default MusicPlayerControls;
import { useState, useEffect } from "react";
import { Play, Pause, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { formatDuration } from "@/data/mockPlaylist";

interface MusicPlayerControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  onPlayPause: () => void;
  onSkip: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (volume: number) => void;
}

const MusicPlayerControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSkip,
  onSeek,
  onVolumeChange,
}: MusicPlayerControlsProps) => {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleMuteToggle = () => {
    if (isMuted) {
      onVolumeChange(previousVolume);
      setIsMuted(false);
    } else {
      setPreviousVolume(volume);
      onVolumeChange(0);
      setIsMuted(true);
    }
  };

  useEffect(() => {
    if (volume === 0) {
      setIsMuted(true);
    } else {
      setIsMuted(false);
    }
  }, [volume]);

  return (
    <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl border border-gray-700">
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={(value) => onSeek(value[0])}
            className="cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-400">
            <span>{formatDuration(Math.floor(currentTime))}</span>
            <span>{formatDuration(Math.floor(duration))}</span>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={onPlayPause}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-14 h-14"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" fill="currentColor" />
              ) : (
                <Play className="w-6 h-6 ml-1" fill="currentColor" />
              )}
            </Button>
            <Button
              onClick={onSkip}
              size="lg"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 rounded-full w-12 h-12"
            >
              <SkipForward className="w-5 h-5" />
            </Button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3 w-48">
            <Button
              onClick={handleMuteToggle}
              size="sm"
              variant="ghost"
              className="text-gray-400 hover:text-white"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[volume]}
              max={100}
              step={1}
              onValueChange={(value) => onVolumeChange(value[0])}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayerControls;
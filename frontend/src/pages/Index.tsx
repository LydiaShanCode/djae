import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import DJController from "@/components/DJController";
import MusicPlayerControls from "@/components/MusicPlayerControls";
import PlaylistPanel from "@/components/PlaylistPanel";
import { mockPlaylist, Track, Playlist } from "@/data/mockPlaylist";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const { toast } = useToast();
  const [playlist, setPlaylist] = useState<Playlist>(mockPlaylist);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(70);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = playlist.tracks[currentTrackIndex] || null;
  const upcomingTracks = playlist.tracks.slice(currentTrackIndex + 1);

  // Simulate playback progress
  useEffect(() => {
    if (isPlaying && currentTrack) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= currentTrack.duration) {
            handleSkip();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, currentTrack]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      toast({
        title: "Playback started",
        description: `Now playing: ${currentTrack?.title}`,
      });
    }
  };

  const handleSkip = () => {
    if (currentTrackIndex < playlist.tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      toast({
        title: "Track skipped",
        description: `Now playing: ${playlist.tracks[currentTrackIndex + 1]?.title}`,
      });
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
      toast({
        title: "Playlist ended",
        description: "You've reached the end of the playlist",
      });
    }
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const handlePlaylistImport = (url: string) => {
    // For now, just show a message since we're using mock data
    toast({
      title: "Spotify integration coming soon",
      description: "Currently using mock playlist data for demonstration",
      variant: "default",
    });
  };

  const handleReorder = (newTracks: Track[]) => {
    const newPlaylist = {
      ...playlist,
      tracks: newTracks,
    };
    setPlaylist(newPlaylist);
    toast({
      title: "Playlist reordered",
      description: "Track order has been updated",
    });
  };

  const handleTrackSelect = (trackIndex: number) => {
    setCurrentTrackIndex(trackIndex);
    setCurrentTime(0);
    setIsPlaying(true);
    toast({
      title: "Track selected",
      description: `Now playing: ${playlist.tracks[trackIndex]?.title}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950">
      <Header onPlaylistImport={handlePlaylistImport} />
      
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - DJ Controller and Player Controls */}
          <div className="lg:col-span-2 space-y-6">
            <DJController
              currentTrack={currentTrack}
              upcomingTracks={upcomingTracks}
            />
            
            <MusicPlayerControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={currentTrack?.duration || 0}
              volume={volume}
              onPlayPause={handlePlayPause}
              onSkip={handleSkip}
              onSeek={handleSeek}
              onVolumeChange={handleVolumeChange}
            />
          </div>

          {/* Right Column - Playlist Panel */}
          <div className="lg:col-span-1">
            <PlaylistPanel
              playlistTitle={playlist.title}
              tracks={playlist.tracks}
              totalDuration={playlist.totalDuration}
              currentTrackId={currentTrack?.id || null}
              onReorder={handleReorder}
              onTrackSelect={handleTrackSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
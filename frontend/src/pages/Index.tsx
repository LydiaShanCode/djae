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
  const [recordingTime, setRecordingTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTrack = playlist.tracks[currentTrackIndex] || null;
  const upcomingTracks = playlist.tracks.slice(currentTrackIndex + 1);
  const playlistImage = playlist.tracks[0]?.albumArtUrl;

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

  // Recording timer
  useEffect(() => {
    if (isPlaying) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isPlaying]);

  const formatRecordingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

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

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0);
      toast({
        title: "Previous track",
        description: `Now playing: ${playlist.tracks[currentTrackIndex - 1]?.title}`,
      });
    }
  };

  const handlePlaylistImport = (url: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Header onPlaylistImport={handlePlaylistImport} />
      
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left Column - DJ Controller and Player Controls */}
          <div className="lg:col-span-3 space-y-4 md:space-y-6">
            <DJController
              currentTrack={currentTrack}
              upcomingTracks={upcomingTracks}
              isPlaying={isPlaying}
              playlistTitle={playlist.title}
              playlistImage={playlistImage}
              recordingTime={formatRecordingTime(recordingTime)}
            />
            
            <MusicPlayerControls
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              onSkip={handleSkip}
              onPrevious={handlePrevious}
            />
          </div>

          {/* Right Column - Playlist Panel */}
          <div className="lg:col-span-1 min-h-[400px] lg:min-h-0">
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
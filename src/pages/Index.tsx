import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import DJController from "@/components/DJController";
import PlaylistPanel from "@/components/PlaylistPanel";
import { mockPlaylist, Track, Playlist } from "@/data/mockPlaylist";
import { useToast } from "@/hooks/use-toast";
import { extractJamendoId, fetchJamendoPlaylist, isJamendoConfigured } from "@/lib/jamendo";

const Index = () => {
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize HTML audio element once
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  const DEFAULT_PLAYLIST_URL = "https://www.jamendo.com/playlist/500332577/midnight-jazz";

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const isPlayingRef = useRef(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeDeck, setActiveDeck] = useState<"left" | "right">("left");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-load the default playlist on mount
  useEffect(() => {
    if (!isJamendoConfigured()) {
      setPlaylist(mockPlaylist);
      setIsLoadingDefault(false);
      return;
    }
    const parsed = extractJamendoId(DEFAULT_PLAYLIST_URL);
    if (!parsed) {
      setPlaylist(mockPlaylist);
      setIsLoadingDefault(false);
      return;
    }
    fetchJamendoPlaylist(parsed.id, parsed.type)
      .then((imported) => {
        setPlaylist(imported);
      })
      .catch(() => {
        setPlaylist(mockPlaylist);
      })
      .finally(() => {
        setIsLoadingDefault(false);
      });
  }, []);

  // Keep ref in sync so effects can read current playing state without stale closure
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Update audio src and attach ended listener when track changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const currentTrack = playlist?.tracks[currentTrackIndex] || null;
    const previewUrl = currentTrack?.previewUrl ?? null;

    audio.pause();
    audio.src = previewUrl ?? "";

    // If already playing (e.g. user hit skip mid-song), resume on the new track
    if (isPlayingRef.current && previewUrl) {
      audio.play().catch(() => {
        // Autoplay blocked or src invalid — keep UI state as-is
      });
    }

    const handleEnded = () => {
      handleSkip();
    };

    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex, playlist?.tracks]);

  const currentTrack = playlist?.tracks[currentTrackIndex] || null;
  const nextTrack = playlist?.tracks[currentTrackIndex + 1] || null;
  const upcomingTracks = playlist?.tracks.slice(currentTrackIndex + 1) ?? [];
  const playlistImage = playlist?.tracks[0]?.albumArtUrl;

  const isPlaylistEmpty = !playlist || playlist.tracks.length === 0;

  const currentProgress = currentTrack
    ? (currentTime / currentTrack.duration) * 100
    : 0;

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
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = async () => {
    const audio = audioRef.current;
    const previewUrl = currentTrack?.previewUrl ?? null;

    if (previewUrl && audio) {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        try {
          await audio.play();
          setIsPlaying(true);
        } catch {
          setIsPlaying(!isPlaying);
        }
      }
    } else {
      if (!isPlaying) {
        toast({
          title: "No preview available",
          description: "No preview available for this track",
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSkip = () => {
    audioRef.current?.pause();
    if (currentTrackIndex < (playlist?.tracks.length ?? 0) - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setCurrentTime(0);
      setActiveDeck(activeDeck === "left" ? "right" : "left");
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
    audioRef.current?.pause();
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setCurrentTime(0);
      setActiveDeck(activeDeck === "left" ? "right" : "left");
    }
  };

  const [isImporting, setIsImporting] = useState(false);

  const handlePlaylistImport = async (url: string) => {
    if (!isJamendoConfigured()) {
      toast({
        title: "Jamendo not configured",
        description: "Add VITE_JAMENDO_CLIENT_ID to your .env.local file.",
        variant: "destructive",
      });
      return;
    }

    const parsed = extractJamendoId(url);
    if (!parsed) {
      toast({
        title: "Invalid URL",
        description: "Paste a Jamendo album (jamendo.com/album/...) or playlist (jamendo.com/list/p...) URL.",
        variant: "destructive",
      });
      return;
    }

    setIsImporting(true);
    try {
      const imported = await fetchJamendoPlaylist(parsed.id, parsed.type);
      audioRef.current?.pause();
      setIsPlaying(false);
      setPlaylist(imported);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      toast({
        title: "Playlist loaded",
        description: `"${imported.title}" — ${imported.trackCount} tracks`,
      });
    } catch (err: any) {
      toast({
        title: "Import failed",
        description: err.message ?? "Could not load playlist.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReorder = (newTracks: Track[]) => {
    if (!playlist) return;
    setPlaylist({ ...playlist, tracks: newTracks });
    toast({
      title: "Playlist reordered",
      description: "Track order has been updated",
    });
  };

  const handleTrackSelect = (trackIndex: number) => {
    audioRef.current?.pause();
    setCurrentTrackIndex(trackIndex);
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveDeck(trackIndex % 2 === 0 ? "left" : "right");
    toast({
      title: "Track selected",
      description: `Now playing: ${playlist?.tracks[trackIndex]?.title}`,
    });
  };

  return (
    <div className="min-h-screen" style={{ background: "#E0DDD8" }}>
      <Header
        onPlaylistImport={handlePlaylistImport}
        isImporting={isImporting}
        playlistTitle={playlist?.title}
        playlistImage={playlistImage}
      />

      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {isLoadingDefault ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md space-y-4">
              <div className="text-6xl mb-4 animate-spin">🎵</div>
              <h2 className="text-2xl font-bold text-gray-800">Loading Playlist…</h2>
              <p className="text-gray-600">Fetching Midnight Jazz from Jamendo.</p>
            </div>
          </div>
        ) : isPlaylistEmpty ? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md space-y-4">
              <div className="text-6xl mb-4">🎵</div>
              <h2 className="text-2xl font-bold" style={{ color: "#5C584F" }}>No Tracks Loaded</h2>
              <p style={{ color: "#8A8680" }}>Add tracks to your playlist to get started.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:items-start">
            <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col">
              <DJController
                currentTrack={currentTrack}
                nextTrack={nextTrack}
                upcomingTracks={upcomingTracks}
                isPlaying={isPlaying}
                activeDeck={activeDeck}
                playlistTitle={playlist?.title}
                playlistImage={playlistImage}
                recordingTime={formatRecordingTime(recordingTime)}
                currentProgress={currentProgress}
                onPlayPause={handlePlayPause}
                onSkip={handleSkip}
                onPrevious={handlePrevious}
                audioRef={audioRef}
              />
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
              <div className="h-[600px] lg:h-[calc(100vh-12rem)]">
                <PlaylistPanel
                  playlistTitle={playlist?.title ?? ""}
                  tracks={playlist?.tracks ?? []}
                  totalDuration={playlist?.totalDuration ?? 0}
                  currentTrackId={currentTrack?.id || null}
                  onReorder={handleReorder}
                  onTrackSelect={handleTrackSelect}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;

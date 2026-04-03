import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import DJController from "@/components/DJController";
import PlaylistPanel from "@/components/PlaylistPanel";
import { Signature } from "@/components/Signature";
import { mockPlaylist, Track, Playlist } from "@/data/mockPlaylist";
import { useToast } from "@/hooks/use-toast";
import { extractJamendoId, fetchJamendoPlaylist, isJamendoConfigured } from "@/lib/jamendo";

const DEFAULT_PLAYLIST_URL = "https://www.jamendo.com/playlist/500608471/beatmaker-s-arena";

const Index = () => {
  const { toast } = useToast();

  // Deck A = left turntable, Deck B = right turntable — fixed physical positions
  const audioRefA = useRef<HTMLAudioElement | null>(null);
  const audioRefB = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRefA.current = new Audio();
    audioRefB.current = new Audio();
    return () => {
      audioRefA.current?.pause(); audioRefA.current = null;
      audioRefB.current?.pause(); audioRefB.current = null;
    };
  }, []);

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [isLoadingDefault, setIsLoadingDefault] = useState(true);

  // Each deck independently tracks which track it is loaded with
  const [deckAIndex, setDeckAIndex] = useState(0);
  const [deckBIndex, setDeckBIndex] = useState(1);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);

  // "activeDeck" = the dominant/playing deck from the listener's perspective
  // After a full crossfade to B, activeDeck becomes "b" and stays there.
  // The fader does NOT snap back — it stays wherever the user released it.
  const [activeDeck, setActiveDeck] = useState<"a" | "b">("a");

  // 0 = full A, 100 = full B — persists after crossfade commit (no snap-back)
  const [crossfaderPos, setCrossfaderPos] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stable refs so event-listener callbacks always see the latest values
  const activeDeckRef = useRef<"a" | "b">("a");
  const handleCommitRef = useRef<((deck: "a" | "b") => void) | null>(null);

  // Auto-load the default Jamendo playlist on mount, fall back to mock data on any failure
  useEffect(() => {
    const configured = isJamendoConfigured();
    const parsed = configured ? extractJamendoId(DEFAULT_PLAYLIST_URL) : null;
    localStorage.setItem('djae_debug_143206', JSON.stringify({ step: 'start', configured, parsed, url: DEFAULT_PLAYLIST_URL, ts: Date.now() }));
    if (!parsed) {
      setPlaylist(mockPlaylist);
      setIsLoadingDefault(false);
      return;
    }
    fetchJamendoPlaylist(parsed.id, parsed.type)
      .then((result) => {
        localStorage.setItem('djae_debug_143206', JSON.stringify({ step: 'success', title: result.title, trackCount: result.trackCount, hasTracks: result.tracks?.length > 0, firstPreview: result.tracks?.[0]?.previewUrl?.slice(0, 60), ts: Date.now() }));
        setPlaylist(result);
      })
      .catch((err) => {
        localStorage.setItem('djae_debug_143206', JSON.stringify({ step: 'error', error: String(err), ts: Date.now() }));
        setPlaylist(mockPlaylist);
      })
      .finally(() => setIsLoadingDefault(false));
  }, []);

  // Keep callback refs fresh every render so event listeners never use stale closures
  useEffect(() => {
    activeDeckRef.current = activeDeck;
    handleCommitRef.current = handleCrossfadeCommit;
  });

  // Apply constant-power crossfade volumes whenever the fader moves
  useEffect(() => {
    const pos = crossfaderPos / 100;
    if (audioRefA.current) audioRefA.current.volume = Math.cos(pos * (Math.PI / 2));
    if (audioRefB.current) audioRefB.current.volume = Math.sin(pos * (Math.PI / 2));
  }, [crossfaderPos]);

  // Load Deck A's track; pre-roll if already playing
  useEffect(() => {
    const audio = audioRefA.current;
    if (!audio || !playlist) return;
    const track = playlist.tracks[deckAIndex] ?? null;
    const url = track?.previewUrl ?? "";
    audio.pause();
    audio.src = url;
    audio.volume = Math.cos((crossfaderPos / 100) * (Math.PI / 2));
    if (url && isPlaying) audio.play().catch(() => {});

    const onEnded = () => {
      if (activeDeckRef.current === "a") handleCommitRef.current?.("b");
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  // isPlaying and crossfaderPos intentionally excluded: only reload when the track changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckAIndex, playlist?.tracks]);

  // Load Deck B's track; always pre-roll silently so it's ready when fader moves
  useEffect(() => {
    const audio = audioRefB.current;
    if (!audio || !playlist) return;
    const track = playlist.tracks[deckBIndex] ?? null;
    const url = track?.previewUrl ?? "";
    audio.pause();
    audio.src = url;
    audio.volume = Math.sin((crossfaderPos / 100) * (Math.PI / 2));
    if (url && isPlaying) audio.play().catch(() => {});

    const onEnded = () => {
      if (activeDeckRef.current === "b") handleCommitRef.current?.("a");
    };
    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deckBIndex, playlist?.tracks]);

  // Start/stop both audio elements when isPlaying toggles
  useEffect(() => {
    if (isPlaying) {
      if (audioRefA.current?.src) audioRefA.current.play().catch(() => {});
      if (audioRefB.current?.src) audioRefB.current.play().catch(() => {});
    } else {
      audioRefA.current?.pause();
      audioRefB.current?.pause();
    }
  }, [isPlaying]);

  // Derived track values
  const deckATrack = playlist?.tracks[deckAIndex] || null;
  const deckBTrack = playlist?.tracks[deckBIndex] || null;
  // currentTrack = whichever deck is dominant (for progress display, recording timer)
  const currentTrack = activeDeck === "a" ? deckATrack : deckBTrack;
  // nextTrack = the idle deck (used by DJController for the inactive card)
  const nextTrack = activeDeck === "a" ? deckBTrack : deckATrack;
  const playlistImage = playlist?.tracks[0]?.albumArtUrl;
  const isPlaylistEmpty = !playlist || playlist.tracks.length === 0;
  const currentProgress = currentTrack ? (currentTime / currentTrack.duration) * 100 : 0;

  // Map activeDeck to left/right for DJController's existing logic
  const djActiveDeck: "left" | "right" = activeDeck === "a" ? "left" : "right";

  // Playlist highlight follows fader position (A side = left deck A, B side = right deck B)
  const displayTrackId = crossfaderPos < 50
    ? (deckATrack?.id || null)
    : (deckBTrack?.id || null);

  // Simulate playback progress timer
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying]);

  // Recording timer
  useEffect(() => {
    if (isPlaying) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
    }
    return () => { if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current); };
  }, [isPlaying]);

  const formatRecordingTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      audioRefA.current?.pause();
      audioRefB.current?.pause();
      setIsPlaying(false);
    } else {
      const activeAudio = activeDeck === "a" ? audioRefA.current : audioRefB.current;
      const idleAudio = activeDeck === "a" ? audioRefB.current : audioRefA.current;
      if (activeAudio?.src) {
        try {
          await activeAudio.play();
          if (idleAudio?.src) idleAudio.play().catch(() => {});
          setIsPlaying(true);
        } catch {
          setIsPlaying(true);
        }
      } else {
        toast({ title: "No preview available", description: "No preview available for this track" });
      }
    }
  };

  // Skip: advance active deck to next track; idle deck pre-loads the one after
  const handleSkip = () => {
    const total = playlist?.tracks.length ?? 0;
    if (activeDeck === "a") {
      const nextA = deckAIndex + 1;
      if (nextA < total) {
        audioRefA.current?.pause();
        setDeckAIndex(nextA);
        setDeckBIndex(Math.min(nextA + 1, total - 1));
        setCurrentTime(0);
      } else {
        audioRefA.current?.pause();
        audioRefB.current?.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        toast({ title: "Playlist ended", description: "You've reached the end of the playlist" });
      }
    } else {
      const nextB = deckBIndex + 1;
      if (nextB < total) {
        audioRefB.current?.pause();
        setDeckBIndex(nextB);
        setDeckAIndex(Math.min(nextB + 1, total - 1));
        setCurrentTime(0);
      } else {
        audioRefA.current?.pause();
        audioRefB.current?.pause();
        setIsPlaying(false);
        setCurrentTime(0);
        toast({ title: "Playlist ended", description: "You've reached the end of the playlist" });
      }
    }
  };

  const handlePrevious = () => {
    if (activeDeck === "a" && deckAIndex > 0) {
      const newA = deckAIndex - 1;
      audioRefA.current?.pause();
      setDeckAIndex(newA);
      setDeckBIndex(Math.min(newA + 1, (playlist?.tracks.length ?? 1) - 1));
      setCurrentTime(0);
    } else if (activeDeck === "b" && deckBIndex > 0) {
      const newB = deckBIndex - 1;
      audioRefB.current?.pause();
      setDeckBIndex(newB);
      setDeckAIndex(Math.max(0, newB - 1));
      setCurrentTime(0);
    }
  };

  /**
   * Called when the user releases the crossfader at an edge, or a track ends naturally.
   * - Sets the committed deck as the new active deck.
   * - After a brief cooldown, quietly loads the next upcoming track into the now-idle deck.
   *   The cooldown prevents jarring src changes while the disc is still animating.
   */
  const handleCrossfadeCommit = (deck: "a" | "b") => {
    if (activeDeckRef.current === deck) return; // already on this side
    setActiveDeck(deck);
    activeDeckRef.current = deck;
    setCurrentTime(0);

    // Capture indices now — setTimeout closure must not rely on future state
    const capturedAIdx = deckAIndex;
    const capturedBIdx = deckBIndex;
    const total = playlist?.tracks.length ?? 0;

    setTimeout(() => {
      if (deck === "b") {
        // B is now active with capturedBIdx → load capturedBIdx+1 into idle Deck A
        const nextForA = capturedBIdx + 1;
        if (nextForA < total) setDeckAIndex(nextForA);
      } else {
        // A is now active with capturedAIdx → load capturedAIdx+1 into idle Deck B
        const nextForB = capturedAIdx + 1;
        if (nextForB < total) setDeckBIndex(nextForB);
      }
    }, 800); // 800 ms cooldown before idle deck swaps its song
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
      audioRefA.current?.pause();
      audioRefB.current?.pause();
      setIsPlaying(false);
      setPlaylist(imported);
      setActiveDeck("a");
      setDeckAIndex(0);
      setDeckBIndex(Math.min(1, imported.tracks.length - 1));
      setCurrentTime(0);
      setCrossfaderPos(0);
      toast({ title: "Playlist loaded", description: `"${imported.title}" — ${imported.trackCount} tracks` });
    } catch (err: any) {
      toast({ title: "Import failed", description: err.message ?? "Could not load playlist.", variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  const handleReorder = (newTracks: Track[]) => {
    if (!playlist) return;
    setPlaylist({ ...playlist, tracks: newTracks });
    toast({ title: "Playlist reordered", description: "Track order has been updated" });
  };

  const handleTrackSelect = (trackIndex: number) => {
    audioRefA.current?.pause();
    audioRefB.current?.pause();
    // Always load selected track onto Deck A (left), next track on Deck B (right)
    setActiveDeck("a");
    activeDeckRef.current = "a";
    setDeckAIndex(trackIndex);
    setDeckBIndex(Math.min(trackIndex + 1, (playlist?.tracks.length ?? 1) - 1));
    setCurrentTime(0);
    setCrossfaderPos(0);
    setIsPlaying(false);
    toast({ title: "Track selected", description: `Now playing: ${playlist?.tracks[trackIndex]?.title}` });
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
                upcomingTracks={[]}
                isPlaying={isPlaying}
                activeDeck={djActiveDeck}
                playlistTitle={playlist?.title}
                playlistImage={playlistImage}
                recordingTime={formatRecordingTime(recordingTime)}
                currentProgress={currentProgress}
                onPlayPause={handlePlayPause}
                onSkip={handleSkip}
                onPrevious={handlePrevious}
                audioRef={activeDeck === "a" ? audioRefA : audioRefB}
                audioRefA={audioRefA}
                audioRefB={audioRefB}
                crossfaderPos={crossfaderPos}
                onCrossfaderChange={setCrossfaderPos}
                onCrossfadeCommit={handleCrossfadeCommit}
              />
            </div>

            <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
              <div className="h-[600px] lg:h-[calc(100vh-12rem)]">
                <PlaylistPanel
                  playlistTitle={playlist?.title ?? ""}
                  tracks={playlist?.tracks ?? []}
                  totalDuration={playlist?.totalDuration ?? 0}
                  currentTrackId={displayTrackId}
                  onReorder={handleReorder}
                  onTrackSelect={handleTrackSelect}
                />
              </div>
            </div>
          </div>
        )}
      </div>
      <footer className="py-6 px-4 md:px-6">
        <Signature />
      </footer>
    </div>
  );
};

export default Index;

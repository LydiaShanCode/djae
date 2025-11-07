import { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import DJController from "@/components/DJController";
import MusicPlayerControls from "@/components/MusicPlayerControls";
import PlaylistPanel from "@/components/PlaylistPanel";
import { mockPlaylist, Track, Playlist } from "@/data/mockPlaylist";
import { useToast } from "@/hooks/use-toast";
import { getApiUrl } from "@/config/api";

// Spotify SDK types
interface SpotifyPlayer {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: string, callback: (data: any) => void): void;
  removeListener(event: string, callback?: (data: any) => void): void;
  getCurrentState(): Promise<SpotifyPlaybackState | null>;
  setName(name: string): Promise<void>;
  getVolume(): Promise<number>;
  setVolume(volume: number): Promise<void>;
  pause(): Promise<void>;
  resume(): Promise<void>;
  togglePlay(): Promise<void>;
  seek(position_ms: number): Promise<void>;
  previousTrack(): Promise<void>;
  nextTrack(): Promise<void>;
  activateElement(): Promise<void>;
}

interface SpotifyPlaybackState {
  context: {
    uri: string;
    metadata: any;
  };
  disallows: {
    pausing: boolean;
    skipping_prev: boolean;
  };
  paused: boolean;
  position: number;
  repeat_mode: number;
  shuffle: boolean;
  track_window: {
    current_track: SpotifyTrack;
    previous_tracks: SpotifyTrack[];
    next_tracks: SpotifyTrack[];
  };
}

interface SpotifyTrack {
  uri: string;
  id: string;
  type: string;
  media_type: string;
  name: string;
  is_playable: boolean;
  album: {
    uri: string;
    name: string;
    images: { url: string }[];
  };
  artists: { uri: string; name: string }[];
}

interface SpotifyPlayerInit {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
}

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: {
      Player: new (options: SpotifyPlayerInit) => SpotifyPlayer;
    };
  }
}

const Index = () => {
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  
  // Check for session_id in localStorage on mount
  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (sessionId) {
      setIsLoggedIn(true);
    }
  }, []);
  
  // Initialize with empty playlist
  const [playlist, setPlaylist] = useState<Playlist>({
    id: "",
    title: "No Playlist",
    trackCount: 0,
    totalDuration: 0,
    sourceUrl: "",
    tracks: [],
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeDeck, setActiveDeck] = useState<"left" | "right">("left");
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize Spotify Web Playback SDK
  useEffect(() => {
    const sessionId = localStorage.getItem("session_id");
    if (!sessionId || !isLoggedIn) {
      return;
    }

    // Function to initialize the player
    const initializePlayer = async () => {
      try {
        // Fetch access token from backend
        const response = await fetch(getApiUrl(`/api/v1/auth/token/${sessionId}`));
        if (!response.ok) {
          console.error("Failed to fetch access token");
          toast({
            title: "Authentication Error",
            description: "Failed to retrieve access token. Please log in again.",
            variant: "destructive",
          });
          return;
        }

        const data = await response.json();
        const accessToken = data.access_token;

        // Wait for Spotify SDK to be ready
        if (!window.Spotify) {
          console.log("Waiting for Spotify SDK to load...");
          window.onSpotifyWebPlaybackSDKReady = () => {
            createPlayer(accessToken);
          };
        } else {
          createPlayer(accessToken);
        }
      } catch (error) {
        console.error("Error initializing player:", error);
        toast({
          title: "Player Initialization Error",
          description: "Failed to initialize Spotify player.",
          variant: "destructive",
        });
      }
    };

    // Function to create the Spotify player
    const createPlayer = (token: string) => {
      const spotifyPlayer = new window.Spotify.Player({
        name: "DJ Simulator Web Player",
        getOAuthToken: (cb) => {
          cb(token);
        },
        volume: 0.5,
      });

      // Error handling
      spotifyPlayer.addListener("initialization_error", ({ message }) => {
        console.error("Initialization Error:", message);
      });

      spotifyPlayer.addListener("authentication_error", ({ message }) => {
        console.error("Authentication Error:", message);
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        });
      });

      spotifyPlayer.addListener("account_error", ({ message }) => {
        console.error("Account Error:", message);
        setIsPremium(false);
        toast({
          title: "Premium Required",
          description: "Spotify Premium is required for playback.",
          variant: "destructive",
        });
      });

      spotifyPlayer.addListener("playback_error", ({ message }) => {
        console.error("Playback Error:", message);
      });

      // Ready
      spotifyPlayer.addListener("ready", async ({ device_id }) => {
        console.log("Ready with Device ID", device_id);
        setDeviceId(device_id);
        setIsPremium(true);
        
        // Transfer playback to this device
        try {
          const response = await fetch(getApiUrl("/api/v1/playback/transfer"), {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              device_id: device_id,
              session_id: sessionId
            }),
          });
          
          if (response.ok) {
            console.log("Playback transferred to web player");
            toast({
              title: "Player Ready",
              description: "Spotify player is ready for playback.",
            });
          } else {
            const errorData = await response.json();
            console.error("Failed to transfer playback:", errorData);
            toast({
              title: "Player Ready",
              description: "Spotify player is ready, but playback transfer failed.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error transferring playback:", error);
          toast({
            title: "Player Ready",
            description: "Spotify player is ready for playback.",
          });
        }
      });

      // Not Ready
      spotifyPlayer.addListener("not_ready", ({ device_id }) => {
        console.log("Device ID has gone offline", device_id);
        setDeviceId(null);
      });

      // Player state changed
      spotifyPlayer.addListener("player_state_changed", (state) => {
        if (!state) return;

        console.log("Player state changed:", state);
        
        // Update playing state based on Spotify state
        setIsPlaying(!state.paused);
        
        // Update current time based on position
        setCurrentTime(Math.floor(state.position / 1000));
      });

      // Connect to the player
      spotifyPlayer.connect().then((success) => {
        if (success) {
          console.log("The Web Playback SDK successfully connected to Spotify!");
          setPlayer(spotifyPlayer);
        } else {
          console.error("The Web Playback SDK could not connect to Spotify");
        }
      });
    };

    initializePlayer();

    // Cleanup
    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [isLoggedIn, toast]);

  const currentTrack = playlist.tracks[currentTrackIndex] || null;
  const nextTrack = playlist.tracks[currentTrackIndex + 1] || null;
  const upcomingTracks = playlist.tracks.slice(currentTrackIndex + 1);
  const playlistImage = playlist.tracks[0]?.albumArtUrl;
  
  // Check if playlist is empty
  const isPlaylistEmpty = playlist.tracks.length === 0;

  // Calculate progress percentage
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
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPause = async () => {
    if (player && isPremium && deviceId) {
      try {
        const sessionId = localStorage.getItem("session_id");
        
        // If this is the first play for this playlist, start playback with the playlist URI
        if (!hasStartedPlayback && !isPlaying && sessionId && playlist.id) {
          try {
            const playlistUri = `spotify:playlist:${playlist.id}`;
            console.log("Starting playback with playlist URI:", playlistUri);
            
            const playResponse = await fetch(getApiUrl("/api/v1/playback/play"), {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                device_id: deviceId,
                session_id: sessionId,
                playlist_uri: playlistUri
              }),
            });
            
            if (playResponse.ok) {
              console.log("Playback started successfully on imported playlist");
              setHasStartedPlayback(true);
              // State will be updated by player_state_changed listener
              toast({
                title: "Playback started",
                description: `Now playing: ${playlist.title}`,
              });
            } else {
              const errorData = await playResponse.json();
              console.error("Failed to start playback:", errorData);
              toast({
                title: "Playback Error",
                description: errorData.detail || "Failed to start playback",
                variant: "destructive",
              });
            }
          } catch (playError) {
            console.error("Error starting playback:", playError);
            toast({
              title: "Playback Error",
              description: "Failed to start playback",
              variant: "destructive",
            });
          }
        } else {
          // Subsequent plays: just toggle play/pause
          await player.togglePlay();
          // State will be updated by player_state_changed listener
        }
      } catch (error) {
        console.error("Error toggling playback:", error);
        toast({
          title: "Playback Error",
          description: "Failed to toggle playback",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to simulated playback if no player
      setIsPlaying(!isPlaying);
      if (!isPlaying) {
        toast({
          title: "Playback started",
          description: `Now playing: ${currentTrack?.title}`,
        });
      }
    }
  };

  const handleSkip = async () => {
    if (player && isPremium) {
      try {
        await player.nextTrack();
        // Update UI state
        if (currentTrackIndex < playlist.tracks.length - 1) {
          setCurrentTrackIndex(currentTrackIndex + 1);
          setCurrentTime(0);
          setActiveDeck(activeDeck === "left" ? "right" : "left");
        }
      } catch (error) {
        console.error("Error skipping track:", error);
        toast({
          title: "Skip Error",
          description: "Failed to skip to next track",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to simulated playback
      if (currentTrackIndex < playlist.tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
        setCurrentTime(0);
        setActiveDeck(activeDeck === "left" ? "right" : "left");
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
    }
  };

  const handlePrevious = async () => {
    if (player && isPremium) {
      try {
        await player.previousTrack();
        // Update UI state
        if (currentTrackIndex > 0) {
          setCurrentTrackIndex(currentTrackIndex - 1);
          setCurrentTime(0);
          setActiveDeck(activeDeck === "left" ? "right" : "left");
        }
      } catch (error) {
        console.error("Error going to previous track:", error);
        toast({
          title: "Previous Track Error",
          description: "Failed to go to previous track",
          variant: "destructive",
        });
      }
    } else {
      // Fallback to simulated playback
      if (currentTrackIndex > 0) {
        setCurrentTrackIndex(currentTrackIndex - 1);
        setCurrentTime(0);
        setActiveDeck(activeDeck === "left" ? "right" : "left");
        toast({
          title: "Previous track",
          description: `Now playing: ${playlist.tracks[currentTrackIndex - 1]?.title}`,
        });
      }
    }
  };

  const handlePlaylistImport = async (url: string) => {
    try {
      // Get session_id from localStorage if user is authenticated
      const sessionId = localStorage.getItem("session_id");
      
      const response = await fetch(getApiUrl("/api/v1/playlists/import"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spotify_url: url,
          session_id: sessionId || undefined
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        
        // Handle different error responses
        if (response.status === 400) {
          toast({
            title: "Invalid URL",
            description: errorData.error || "Please provide a valid Spotify playlist URL",
            variant: "destructive",
          });
        } else if (response.status === 404) {
          toast({
            title: "Playlist not found",
            description: errorData.error || "The playlist could not be found or is private",
            variant: "destructive",
          });
        } else if (response.status === 429) {
          toast({
            title: "Rate limit exceeded",
            description: errorData.error || "Too many requests. Please try again later",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error importing playlist",
            description: errorData.error || "An unexpected error occurred",
            variant: "destructive",
          });
        }
        return;
      }

      const data = await response.json();
      
      // Store session_id in localStorage for persistence
      localStorage.setItem("session_id", data.session_id);
      
      // Update playlist state with the imported data
      const importedPlaylist: Playlist = {
        id: data.playlist.id,
        title: data.playlist.title,
        trackCount: data.playlist.track_count,
        totalDuration: data.playlist.total_duration,
        sourceUrl: url,
        tracks: data.playlist.tracks.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.artist,
          album: track.album,
          duration: track.duration,
          albumArtUrl: track.album_art_url,
          spotifyUri: track.spotify_uri,
        })),
      };
      
      setPlaylist(importedPlaylist);
      setCurrentTrackIndex(0);
      setCurrentTime(0);
      setHasStartedPlayback(false); // Reset playback state for new playlist
      
      toast({
        title: "Playlist imported successfully",
        description: `Loaded ${data.playlist.track_count} tracks from "${data.playlist.title}"`,
      });
    } catch (error) {
      toast({
        title: "Network error",
        description: "Failed to connect to the server. Please ensure the backend is running.",
        variant: "destructive",
      });
    }
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
    // Determine which deck should be active based on the track index
    // Even indices = left, odd indices = right
    setActiveDeck(trackIndex % 2 === 0 ? "left" : "right");
    toast({
      title: "Track selected",
      description: `Now playing: ${playlist.tracks[trackIndex]?.title}`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50">
      <Header onPlaylistImport={handlePlaylistImport} isLoggedIn={isLoggedIn} />
      
      <div className="container mx-auto px-4 md:px-6 py-4 md:py-8">
        {isPlaylistEmpty ? (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="max-w-md space-y-4">
              <div className="text-6xl mb-4">🎵</div>
              <h2 className="text-2xl font-bold text-gray-800">No Playlist Connected</h2>
              <p className="text-gray-600">
                Import a Spotify playlist to get started with your DJ session.
                Paste a Spotify playlist URL in the header above.
              </p>
            </div>
          </div>
        ) : (
          // Main Content
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 lg:items-start">
            {/* Left Column - DJ Controller and Player Controls */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6 flex flex-col">
              <DJController
                currentTrack={currentTrack}
                nextTrack={nextTrack}
                upcomingTracks={upcomingTracks}
                isPlaying={isPlaying}
                activeDeck={activeDeck}
                playlistTitle={playlist.title}
                playlistImage={playlistImage}
                recordingTime={formatRecordingTime(recordingTime)}
                currentProgress={currentProgress}
              />
              
              <MusicPlayerControls
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                onSkip={handleSkip}
                onPrevious={handlePrevious}
              />
            </div>

            {/* Right Column - Playlist Panel */}
            <div className="lg:col-span-1 lg:sticky lg:top-24 lg:self-start">
              <div className="h-[600px] lg:h-[calc(100vh-12rem)]">
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
        )}
      </div>
    </div>
  );
};

export default Index;
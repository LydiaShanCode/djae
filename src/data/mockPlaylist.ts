export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  albumArtUrl: string;
  spotifyUri: string;
  previewUrl?: string | null;
}

export interface Playlist {
  id: string;
  title: string;
  trackCount: number;
  totalDuration: number; // in seconds
  sourceUrl: string;
  tracks: Track[];
}

export const mockPlaylist: Playlist = {
  id: "mock-playlist-1",
  title: "Summer Vibes Mix 2024",
  trackCount: 12,
  totalDuration: 2847, // ~47 minutes
  sourceUrl: "https://open.spotify.com/playlist/mock",
  tracks: [
    {
      id: "track-1",
      title: "Blinding Lights",
      artist: "The Weeknd",
      album: "After Hours",
      duration: 200,
      albumArtUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock1",
      previewUrl: null,
    },
    {
      id: "track-2",
      title: "Levitating",
      artist: "Dua Lipa",
      album: "Future Nostalgia",
      duration: 203,
      albumArtUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock2",
      previewUrl: null,
    },
    {
      id: "track-3",
      title: "Save Your Tears",
      artist: "The Weeknd",
      album: "After Hours",
      duration: 215,
      albumArtUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock3",
      previewUrl: null,
    },
    {
      id: "track-4",
      title: "Good 4 U",
      artist: "Olivia Rodrigo",
      album: "SOUR",
      duration: 178,
      albumArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock4",
      previewUrl: null,
    },
    {
      id: "track-5",
      title: "Heat Waves",
      artist: "Glass Animals",
      album: "Dreamland",
      duration: 238,
      albumArtUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock5",
      previewUrl: null,
    },
    {
      id: "track-6",
      title: "Peaches",
      artist: "Justin Bieber ft. Daniel Caesar",
      album: "Justice",
      duration: 198,
      albumArtUrl: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock6",
      previewUrl: null,
    },
    {
      id: "track-7",
      title: "Stay",
      artist: "The Kid LAROI & Justin Bieber",
      album: "F*ck Love 3",
      duration: 141,
      albumArtUrl: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock7",
      previewUrl: null,
    },
    {
      id: "track-8",
      title: "Montero",
      artist: "Lil Nas X",
      album: "MONTERO",
      duration: 137,
      albumArtUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock8",
      previewUrl: null,
    },
    {
      id: "track-9",
      title: "Kiss Me More",
      artist: "Doja Cat ft. SZA",
      album: "Planet Her",
      duration: 208,
      albumArtUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock9",
      previewUrl: null,
    },
    {
      id: "track-10",
      title: "Shivers",
      artist: "Ed Sheeran",
      album: "=",
      duration: 207,
      albumArtUrl: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock10",
      previewUrl: null,
    },
    {
      id: "track-11",
      title: "Industry Baby",
      artist: "Lil Nas X & Jack Harlow",
      album: "MONTERO",
      duration: 212,
      albumArtUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock11",
      previewUrl: null,
    },
    {
      id: "track-12",
      title: "Cold Heart",
      artist: "Elton John & Dua Lipa",
      album: "The Lockdown Sessions",
      duration: 210,
      albumArtUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300&h=300&fit=crop",
      spotifyUri: "spotify:track:mock12",
      previewUrl: null,
    }
  ]
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const formatTotalDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};
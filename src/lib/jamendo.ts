import { Track, Playlist } from "@/data/mockPlaylist";

const CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID as string;
const BASE = "https://api.jamendo.com/v3.0";

type JamendoUrlType = "album" | "playlist";

export function extractJamendoId(
  input: string
): { type: JamendoUrlType; id: string } | null {
  try {
    const url = new URL(input);
    const parts = url.pathname.split("/").filter(Boolean);

    // https://www.jamendo.com/album/24/name-slug  or  /album/24
    if (parts[0] === "album" && parts[1]) {
      return { type: "album", id: parts[1] };
    }

    // https://www.jamendo.com/list/p100268
    // https://www.jamendo.com/playlist/p500608900
    if ((parts[0] === "list" || parts[0] === "playlist") && parts[1]) {
      const id = parts[1].replace(/^p/, "");
      return { type: "playlist", id };
    }
  } catch {}

  // jamen.do short links: https://jamen.do/l/p100268
  try {
    const url = new URL(input);
    if (url.hostname === "jamen.do") {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "l" && parts[1]) {
        const id = parts[1].replace(/^p/, "");
        return { type: "playlist", id };
      }
    }
  } catch {}

  return null;
}

function mapTrack(t: any, albumName?: string, albumImage?: string): Track {
  return {
    id: String(t.id),
    title: t.name,
    artist: t.artist_name ?? "Unknown",
    album: t.album_name ?? albumName ?? "Unknown",
    duration: Number(t.duration),
    albumArtUrl:
      t.image ??
      t.album_image ??
      albumImage ??
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop",
    spotifyUri: t.shorturl ?? t.shareurl ?? "",
    previewUrl: t.audio ?? null,
  };
}

async function fetchAlbumPlaylist(albumId: string): Promise<Playlist> {
  const url =
    `${BASE}/albums/tracks/?client_id=${CLIENT_ID}` +
    `&format=json&limit=200&id=${albumId}&imagesize=500`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Jamendo album");

  const data = await res.json();
  const result = data.results?.[0];
  if (!result) throw new Error("Album not found");

  const tracks: Track[] = (result.tracks ?? []).map((t: any) =>
    mapTrack(t, result.name, result.image)
  );

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);

  return {
    id: String(result.id),
    title: result.name,
    trackCount: tracks.length,
    totalDuration,
    sourceUrl: `https://www.jamendo.com/album/${result.id}`,
    tracks,
  };
}

async function fetchPlaylistTracks(playlistId: string): Promise<Playlist> {
  const url =
    `${BASE}/playlists/tracks/?client_id=${CLIENT_ID}` +
    `&format=json&limit=200&id=${playlistId}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch Jamendo playlist");

  const data = await res.json();
  const result = data.results?.[0];
  if (!result) throw new Error("Playlist not found or is empty");

  const tracks: Track[] = (result.tracks ?? []).map((t: any) => mapTrack(t));

  const totalDuration = tracks.reduce((sum, t) => sum + t.duration, 0);

  return {
    id: String(result.id),
    title: result.name,
    trackCount: tracks.length,
    totalDuration,
    sourceUrl: `https://www.jamendo.com/list/p${result.id}`,
    tracks,
  };
}

export async function fetchJamendoPlaylist(
  id: string,
  type: JamendoUrlType
): Promise<Playlist> {
  if (type === "album") return fetchAlbumPlaylist(id);
  return fetchPlaylistTracks(id);
}

export function isJamendoConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Track(BaseModel):
    """
    Track model representing a single song in the playlist.
    """
    id: str = Field(..., description="Unique track identifier")
    title: str = Field(..., description="Track title")
    artist: str = Field(..., description="Artist name")
    album: str = Field(..., description="Album name")
    duration: int = Field(..., description="Track duration in seconds")
    album_art_url: str = Field(..., description="Album artwork URL")
    spotify_uri: str = Field(..., description="Spotify track URI")


class SessionModel(BaseModel):
    """
    Session model representing a user's DJ session with playlist and playback state.
    """
    session_id: str = Field(..., description="UUID for session identification")
    created_at: datetime = Field(default_factory=datetime.utcnow, description="Session creation timestamp")
    updated_at: datetime = Field(default_factory=datetime.utcnow, description="Last update timestamp")
    spotify_playlist_id: Optional[str] = Field(None, description="Spotify playlist ID")
    playlist_title: Optional[str] = Field(None, description="Playlist name")
    track_count: int = Field(default=0, description="Number of tracks")
    total_duration: int = Field(default=0, description="Total duration in seconds")
    tracks: List[Track] = Field(default_factory=list, description="Array of track objects")
    custom_order: Optional[List[str]] = Field(None, description="Reordered track IDs")
    current_track_index: int = Field(default=0, description="Current playing track index")
    playback_position: int = Field(default=0, description="Current position in seconds")
    is_playing: bool = Field(default=False, description="Playback status")
    active_deck: str = Field(default="left", description="Active vinyl deck (left or right)")
    access_token: Optional[str] = Field(None, description="Spotify OAuth access token")
    refresh_token: Optional[str] = Field(None, description="Spotify OAuth refresh token")
    expires_in: Optional[str] = Field(None, description="Access token expiry time in seconds")

    class Config:
        json_schema_extra = {
            "example": {
                "session_id": "550e8400-e29b-41d4-a716-446655440000",
                "created_at": "2025-11-02T17:41:11.922Z",
                "updated_at": "2025-11-02T17:45:30.123Z",
                "spotify_playlist_id": "37i9dQZF1DXcBWIGoYBM5M",
                "playlist_title": "Summer Vibes Mix 2024",
                "track_count": 12,
                "total_duration": 2847,
                "tracks": [
                    {
                        "id": "track-1",
                        "title": "Blinding Lights",
                        "artist": "The Weeknd",
                        "album": "After Hours",
                        "duration": 200,
                        "album_art_url": "https://...",
                        "spotify_uri": "spotify:track:..."
                    }
                ],
                "custom_order": None,
                "current_track_index": 0,
                "playback_position": 45,
                "is_playing": True,
                "active_deck": "left"
            }
        }
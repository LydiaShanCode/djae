"""
Spotify API service for authentication and data retrieval.
Implements Client Credentials Flow for app-only access to public playlists.
"""

import httpx
import base64
from datetime import datetime, timedelta
from typing import Optional
from config import settings


class SpotifyTokenCache:
    """
    In-memory cache for Spotify access token.
    Stores token and expiry time to avoid unnecessary API calls.
    """
    
    def __init__(self):
        self.access_token: Optional[str] = None
        self.expires_at: Optional[datetime] = None
    
    def is_valid(self) -> bool:
        """
        Check if cached token is still valid.
        
        Returns:
            True if token exists and hasn't expired, False otherwise
        """
        if not self.access_token or not self.expires_at:
            return False
        
        # Add 60 second buffer to avoid using token right at expiry
        return datetime.now() < (self.expires_at - timedelta(seconds=60))
    
    def set_token(self, token: str, expires_in: int):
        """
        Store new token with expiry time.
        
        Args:
            token: Access token from Spotify
            expires_in: Token lifetime in seconds (typically 3600)
        """
        self.access_token = token
        self.expires_at = datetime.now() + timedelta(seconds=expires_in)
    
    def get_token(self) -> Optional[str]:
        """
        Retrieve cached token if valid.
        
        Returns:
            Access token if valid, None otherwise
        """
        if self.is_valid():
            return self.access_token
        return None


# Global token cache instance
_token_cache = SpotifyTokenCache()


async def get_access_token() -> str:
    """
    Get Spotify access token using Client Credentials Flow.
    Uses cached token if available and valid, otherwise requests new token.
    
    Returns:
        Valid Spotify access token
        
    Raises:
        httpx.HTTPStatusError: If token request fails
        ValueError: If credentials are missing or invalid
    """
    # Return cached token if still valid
    cached_token = _token_cache.get_token()
    if cached_token:
        return cached_token
    
    # Validate credentials are configured
    if not settings.spotify_client_id or not settings.spotify_client_secret:
        raise ValueError(
            "Spotify credentials not configured. "
            "Please set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables."
        )
    
    # Prepare credentials for Basic Auth
    credentials = f"{settings.spotify_client_id}:{settings.spotify_client_secret}"
    credentials_b64 = base64.b64encode(credentials.encode()).decode()
    
    # Request new access token
    token_url = "https://accounts.spotify.com/api/token"
    headers = {
        "Authorization": f"Basic {credentials_b64}",
        "Content-Type": "application/x-www-form-urlencoded"
    }
    data = {
        "grant_type": "client_credentials"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(token_url, headers=headers, data=data)
            response.raise_for_status()
            
            token_data = response.json()
            access_token = token_data.get("access_token")
            expires_in = token_data.get("expires_in", 3600)
            
            if not access_token:
                raise ValueError("No access token in Spotify response")
            
            # Cache the new token
            _token_cache.set_token(access_token, expires_in)
            
            return access_token
            
    except httpx.HTTPStatusError as e:
        # Handle specific HTTP errors
        if e.response.status_code == 401:
            raise ValueError(
                "Invalid Spotify credentials. Please check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET."
            ) from e
        elif e.response.status_code == 429:
            raise ValueError(
                "Spotify API rate limit exceeded. Please try again later."
            ) from e
        else:
            raise ValueError(
                f"Failed to get Spotify access token: {e.response.status_code} - {e.response.text}"
            ) from e
    except httpx.RequestError as e:
        raise ValueError(
            f"Network error while requesting Spotify access token: {str(e)}"
        ) from e


async def fetch_playlist(playlist_id: str, access_token: str = None) -> dict:
    """
    Fetch playlist data from Spotify API and transform to internal data model.
    
    Args:
        playlist_id: Spotify playlist ID (extracted from URL)
        access_token: Optional user access token. If not provided, uses client credentials.
        
    Returns:
        Dictionary containing playlist metadata and tracks:
        {
            "id": "spotify_playlist_id",
            "title": "Playlist Name",
            "track_count": 12,
            "total_duration": 2847,
            "tracks": [
                {
                    "id": "track_id",
                    "title": "Song Title",
                    "artist": "Artist Name",
                    "album": "Album Name",
                    "duration": 200,
                    "album_art_url": "https://...",
                    "spotify_uri": "spotify:track:..."
                }
            ]
        }
        
    Raises:
        ValueError: If playlist not found (404) or API error occurs
        httpx.HTTPStatusError: For other HTTP errors
    """
    # Get valid access token (use provided user token or fall back to client credentials)
    if not access_token:
        access_token = await get_access_token()
    
    # Prepare API request
    playlist_url = f"https://api.spotify.com/v1/playlists/{playlist_id}"
    headers = {
        "Authorization": f"Bearer {access_token}"
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(playlist_url, headers=headers)
            response.raise_for_status()
            
            playlist_data = response.json()
            
            # Extract tracks and transform to internal model
            tracks = []
            total_duration = 0
            
            for item in playlist_data.get("tracks", {}).get("items", []):
                track = item.get("track")
                if not track:
                    continue
                
                # Extract track details
                track_id = track.get("id")
                title = track.get("name", "Unknown Title")
                
                # Get first artist name
                artists = track.get("artists", [])
                artist = artists[0].get("name", "Unknown Artist") if artists else "Unknown Artist"
                
                # Get album details
                album = track.get("album", {})
                album_name = album.get("name", "Unknown Album")
                
                # Get album art URL (prefer medium size)
                album_images = album.get("images", [])
                album_art_url = album_images[0].get("url", "") if album_images else ""
                
                # Duration in seconds (Spotify returns milliseconds)
                duration_ms = track.get("duration_ms", 0)
                duration = duration_ms // 1000
                total_duration += duration
                
                # Spotify URI
                spotify_uri = track.get("uri", "")
                
                tracks.append({
                    "id": track_id,
                    "title": title,
                    "artist": artist,
                    "album": album_name,
                    "duration": duration,
                    "album_art_url": album_art_url,
                    "spotify_uri": spotify_uri
                })
            
            # Return transformed playlist data
            return {
                "id": playlist_data.get("id"),
                "title": playlist_data.get("name", "Untitled Playlist"),
                "track_count": len(tracks),
                "total_duration": total_duration,
                "tracks": tracks
            }
            
    except httpx.HTTPStatusError as e:
        # Handle specific HTTP errors
        if e.response.status_code == 404:
            raise ValueError(
                f"Playlist not found. The playlist '{playlist_id}' does not exist or is private."
            ) from e
        elif e.response.status_code == 401:
            raise ValueError(
                "Authentication failed. Please check Spotify credentials."
            ) from e
        elif e.response.status_code == 429:
            raise ValueError(
                "Spotify API rate limit exceeded. Please try again later."
            ) from e
        else:
            raise ValueError(
                f"Failed to fetch playlist: {e.response.status_code} - {e.response.text}"
            ) from e
    except httpx.RequestError as e:
        raise ValueError(
            f"Network error while fetching playlist: {str(e)}"
        ) from e


async def transfer_playback(device_id: str, access_token: str) -> dict:
    """
    Transfer playback to a specific device using Spotify's Transfer Playback API.
    
    Args:
        device_id: The Spotify device ID to transfer playback to
        access_token: User's Spotify access token (required for playback control)
        
    Returns:
        Dictionary with success status
        
    Raises:
        ValueError: If transfer fails or access token is invalid
    """
    if not access_token:
        raise ValueError("User access token is required for playback transfer")
    
    # Prepare API request
    transfer_url = "https://api.spotify.com/v1/me/player"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "device_ids": [device_id],
        "play": False  # Don't start playing automatically
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(transfer_url, headers=headers, json=data)
            
            # 204 No Content is the success response for this endpoint
            if response.status_code == 204:
                return {"success": True, "message": "Playback transferred successfully"}
            
            response.raise_for_status()
            return {"success": True, "message": "Playback transferred successfully"}
            
    except httpx.HTTPStatusError as e:
        # Handle specific HTTP errors
        if e.response.status_code == 401:
            raise ValueError(
                "Authentication failed. Please log in again."
            ) from e
        elif e.response.status_code == 403:
            raise ValueError(
                "Forbidden. User may not have Spotify Premium."
            ) from e
        elif e.response.status_code == 404:
            raise ValueError(
                "Device not found. Please ensure the Spotify player is active."
            ) from e
        elif e.response.status_code == 429:
            raise ValueError(
                "Spotify API rate limit exceeded. Please try again later."
            ) from e
        else:
            raise ValueError(
                f"Failed to transfer playback: {e.response.status_code} - {e.response.text}"
            ) from e
    except httpx.RequestError as e:
        raise ValueError(
            f"Network error while transferring playback: {str(e)}"
        ) from e


async def start_playback(device_id: str, playlist_uri: str, access_token: str) -> dict:
    """
    Start playback of a specific playlist on a device using Spotify's Start/Resume Playback API.
    
    Args:
        device_id: The Spotify device ID to play on
        playlist_uri: The Spotify playlist URI (e.g., "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M")
        access_token: User's Spotify access token (required for playback control)
        
    Returns:
        Dictionary with success status
        
    Raises:
        ValueError: If playback start fails or access token is invalid
    """
    if not access_token:
        raise ValueError("User access token is required for playback control")
    
    # Prepare API request
    play_url = f"https://api.spotify.com/v1/me/player/play?device_id={device_id}"
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    data = {
        "context_uri": playlist_uri
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.put(play_url, headers=headers, json=data)
            
            # 204 No Content is the success response for this endpoint
            if response.status_code == 204:
                return {"success": True, "message": "Playback started successfully"}
            
            response.raise_for_status()
            return {"success": True, "message": "Playback started successfully"}
            
    except httpx.HTTPStatusError as e:
        # Handle specific HTTP errors
        if e.response.status_code == 401:
            raise ValueError(
                "Authentication failed. Please log in again."
            ) from e
        elif e.response.status_code == 403:
            raise ValueError(
                "Forbidden. User may not have Spotify Premium."
            ) from e
        elif e.response.status_code == 404:
            raise ValueError(
                "Device not found or playlist not found. Please ensure the Spotify player is active."
            ) from e
        elif e.response.status_code == 429:
            raise ValueError(
                "Spotify API rate limit exceeded. Please try again later."
            ) from e
        else:
            raise ValueError(
                f"Failed to start playback: {e.response.status_code} - {e.response.text}"
            ) from e
    except httpx.RequestError as e:
        raise ValueError(
            f"Network error while starting playback: {str(e)}"
        ) from e
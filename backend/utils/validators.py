"""
Validators for Spotify playlist URLs and other input validation.
"""
import re
from typing import Optional


def extract_playlist_id(url: str) -> str:
    """
    Extract Spotify playlist ID from a Spotify URL.
    
    Supports the following formats:
    - https://open.spotify.com/playlist/{id}
    - https://open.spotify.com/playlist/{id}?si=...
    
    Args:
        url: Spotify playlist URL string
        
    Returns:
        str: Extracted playlist ID
        
    Raises:
        ValueError: If URL format is invalid or playlist ID cannot be extracted
    """
    if not url or not isinstance(url, str):
        raise ValueError("URL must be a non-empty string")
    
    # Regex pattern to match Spotify playlist URLs
    # Matches: https://open.spotify.com/playlist/{playlist_id} with optional query params
    pattern = r'https://open\.spotify\.com/playlist/([a-zA-Z0-9]+)(?:\?.*)?$'
    
    match = re.match(pattern, url.strip())
    
    if not match:
        raise ValueError(
            "Invalid Spotify playlist URL format. "
            "Expected format: https://open.spotify.com/playlist/{playlist_id}"
        )
    
    playlist_id = match.group(1)
    
    if not playlist_id:
        raise ValueError("Could not extract playlist ID from URL")
    
    return playlist_id
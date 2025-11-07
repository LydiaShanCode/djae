"""
Playlist management endpoints for importing and managing Spotify playlists.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any
from utils.validators import extract_playlist_id
from services.spotify import fetch_playlist
from repositories.session_repo import create_session, get_session, update_session
from database import check_database_connection


router = APIRouter(prefix="/api/v1/playlists", tags=["playlists"])


class PlaylistImportRequest(BaseModel):
    """Request model for playlist import endpoint."""
    spotify_url: str = Field(..., description="Spotify playlist URL")
    session_id: str = Field(None, description="Optional session ID for authenticated requests")


class PlaylistImportResponse(BaseModel):
    """Response model for playlist import endpoint."""
    session_id: str = Field(..., description="Generated session ID")
    playlist: Dict[str, Any] = Field(..., description="Playlist data")


@router.options("/import")
async def import_playlist_options():
    """Handle CORS preflight requests for playlist import."""
    return {}


@router.post("/import", response_model=PlaylistImportResponse, status_code=status.HTTP_201_CREATED)
async def import_playlist(request: PlaylistImportRequest):
    """
    Import a Spotify playlist by URL.
    
    This endpoint:
    1. Validates the Spotify playlist URL
    2. Extracts the playlist ID
    3. Fetches playlist data from Spotify API (using user's access token if session_id provided)
    4. Creates a new session in the database
    5. Returns the session ID and playlist data
    
    Args:
        request: PlaylistImportRequest containing spotify_url and optional session_id
        
    Returns:
        PlaylistImportResponse with session_id and playlist data
        
    Raises:
        HTTPException 400: Invalid URL format
        HTTPException 401: Invalid or expired session
        HTTPException 404: Playlist not found or private
        HTTPException 429: Spotify API rate limit exceeded
        HTTPException 503: Network error or service unavailable
    """
    print(f"[DEBUG] /api/v1/playlists/import - Request received")
    print(f"[DEBUG] spotify_url: {request.spotify_url}")
    print(f"[DEBUG] session_id: {request.session_id}")
    
    # Step 1: Validate URL and extract playlist ID
    print(f"[DEBUG] Step 1: Extracting playlist ID from URL")
    try:
        playlist_id = extract_playlist_id(request.spotify_url)
        print(f"[DEBUG] Extracted playlist_id: {playlist_id}")
    except ValueError as e:
        # Invalid URL format
        print(f"[DEBUG] ValueError during URL validation: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Step 2: Get user's access token if session_id is provided
    print(f"[DEBUG] Step 2: Checking for OAuth session")
    print(f"[DEBUG] session_id provided: {request.session_id}")
    
    access_token = None
    if request.session_id:
        session = await get_session(request.session_id)
        if not session:
            print(f"[DEBUG] OAuth session not found for session_id: {request.session_id}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired session. Please log in again."
            )
        access_token = session.access_token if hasattr(session, 'access_token') else None
        print(f"[DEBUG] Retrieved access_token: {access_token[:20] if access_token else None}...")
    else:
        print(f"[DEBUG] No session_id provided, will use client credentials")
    
    # Step 3: Fetch playlist data from Spotify API (with user token if available)
    print(f"[DEBUG] Step 3: Fetching playlist data from Spotify")
    print(f"[DEBUG] Using access_token: {'Yes (user token)' if access_token else 'No (will use client credentials)'}")
    
    try:
        playlist_data = await fetch_playlist(playlist_id, access_token=access_token)
        print(f"[DEBUG] Successfully fetched playlist data")
        print(f"[DEBUG] Playlist title: {playlist_data.get('title')}")
        print(f"[DEBUG] Track count: {playlist_data.get('track_count')}")
    except ValueError as e:
        # Handle Spotify API errors
        print(f"[DEBUG] ValueError during playlist fetch: {str(e)}")
        error_message = str(e)
        
        # Determine appropriate status code based on error message
        if "not found" in error_message.lower() or "private" in error_message.lower():
            status_code = status.HTTP_404_NOT_FOUND
        elif "rate limit" in error_message.lower():
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        elif "authentication" in error_message.lower() or "credentials" in error_message.lower():
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
            error_message = "Spotify service configuration error. Please contact support."
        else:
            status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        
        raise HTTPException(
            status_code=status_code,
            detail=error_message
        )
    except Exception as e:
        # Catch any unexpected errors
        print(f"[DEBUG] Unexpected exception during playlist fetch: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[DEBUG] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Failed to fetch playlist: {str(e)}"
        )
    
    # Check database connection before attempting to create session
    print(f"[DEBUG] Checking database connection...")
    db_connected = await check_database_connection()
    print(f"[DEBUG] Database connected: {db_connected}")
    
    if not db_connected:
        print(f"[DEBUG] Database not connected - raising 503 error")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable. Please try again later."
        )
    
    # Step 4: Update existing session or create new one
    print(f"[DEBUG] Step 4: Updating or creating database session")
    try:
        playlist_updates = {
            "spotify_playlist_id": playlist_data["id"],
            "playlist_title": playlist_data["title"],
            "track_count": playlist_data["track_count"],
            "total_duration": playlist_data["total_duration"],
            "tracks": playlist_data["tracks"]
        }
        print(f"[DEBUG] Playlist data prepared: {list(playlist_updates.keys())}")
        
        # If session_id was provided and is valid, update the existing session
        if request.session_id:
            print(f"[DEBUG] Updating existing session: {request.session_id}")
            updated_session = await update_session(request.session_id, playlist_updates)
            if updated_session:
                session_id = request.session_id
                print(f"[DEBUG] Successfully updated existing session with playlist data")
            else:
                print(f"[DEBUG] Session not found, creating new session instead")
                session_id = await create_session(playlist_updates)
                print(f"[DEBUG] Database session created successfully with session_id: {session_id}")
        else:
            # No session_id provided, create a new session
            print(f"[DEBUG] No session_id provided, creating new session")
            session_id = await create_session(playlist_updates)
            print(f"[DEBUG] Database session created successfully with session_id: {session_id}")
    except Exception as e:
        # Database error
        print(f"[DEBUG] Exception during session creation: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[DEBUG] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create session: {str(e)}"
        )
    
    # Step 5: Return response with session_id and playlist data
    print(f"[DEBUG] Step 5: Returning response")
    return PlaylistImportResponse(
        session_id=session_id,
        playlist=playlist_data
    )


@router.get("/sessions/{session_id}/playlist", status_code=status.HTTP_200_OK)
async def get_session_playlist(session_id: str):
    """
    Retrieve the current playlist for a session.
    
    This endpoint:
    1. Retrieves the session from the database using the session_id
    2. Returns the playlist data including the current track order
    3. Handles the case where the session is not found (404 error)
    
    Args:
        session_id: The UUID of the session to retrieve
        
    Returns:
        Dict containing playlist data with current track order
        
    Raises:
        HTTPException 404: Session not found
        HTTPException 503: Database connection unavailable
    """
    print(f"[DEBUG] GET /api/v1/sessions/{session_id}/playlist - Request received")
    
    # Check database connection
    print(f"[DEBUG] Checking database connection...")
    db_connected = await check_database_connection()
    print(f"[DEBUG] Database connected: {db_connected}")
    
    if not db_connected:
        print(f"[DEBUG] Database not connected - raising 503 error")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database connection unavailable. Please try again later."
        )
    
    # Retrieve session from database
    print(f"[DEBUG] Retrieving session from database...")
    session = await get_session(session_id)
    
    if not session:
        print(f"[DEBUG] Session not found: {session_id}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session not found: {session_id}"
        )
    
    print(f"[DEBUG] Session found: {session.playlist_title}")
    print(f"[DEBUG] Track count: {session.track_count}")
    
    # Build playlist response with current track order
    tracks = session.tracks
    
    # If custom_order exists, reorder tracks accordingly
    if session.custom_order:
        print(f"[DEBUG] Custom order exists, reordering tracks")
        track_dict = {track.id: track for track in tracks}
        tracks = [track_dict[track_id] for track_id in session.custom_order if track_id in track_dict]
    
    # Convert Track models to dictionaries
    tracks_data = [track.model_dump() for track in tracks]
    
    playlist_data = {
        "id": session.spotify_playlist_id,
        "title": session.playlist_title,
        "track_count": session.track_count,
        "total_duration": session.total_duration,
        "tracks": tracks_data
    }
    
    print(f"[DEBUG] Returning playlist data")
    return {"playlist": playlist_data}
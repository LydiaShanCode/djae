"""
Playback control endpoints for managing Spotify playback.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from services.spotify import transfer_playback, start_playback
from repositories.session_repo import get_session


router = APIRouter(prefix="/api/v1/playback", tags=["playback"])


class TransferPlaybackRequest(BaseModel):
    """Request model for transfer playback endpoint."""
    device_id: str = Field(..., description="Spotify device ID to transfer playback to")
    session_id: str = Field(..., description="User session ID")


class TransferPlaybackResponse(BaseModel):
    """Response model for transfer playback endpoint."""
    success: bool = Field(..., description="Whether the transfer was successful")
    message: str = Field(..., description="Status message")


class PlayPlaybackRequest(BaseModel):
    """Request model for play playback endpoint."""
    device_id: str = Field(..., description="Spotify device ID to play on")
    session_id: str = Field(..., description="User session ID")
    playlist_uri: str = Field(..., description="Spotify playlist URI (e.g., spotify:playlist:...)")


class PlayPlaybackResponse(BaseModel):
    """Response model for play playback endpoint."""
    success: bool = Field(..., description="Whether playback started successfully")
    message: str = Field(..., description="Status message")


@router.post("/transfer", response_model=TransferPlaybackResponse, status_code=status.HTTP_200_OK)
async def transfer_playback_endpoint(request: TransferPlaybackRequest):
    """
    Transfer Spotify playback to the web player device.
    
    This endpoint:
    1. Validates the session and retrieves the user's access token
    2. Calls Spotify's Transfer Playback API to set the active device
    3. Returns success status
    
    Args:
        request: TransferPlaybackRequest containing device_id and session_id
        
    Returns:
        TransferPlaybackResponse with success status and message
        
    Raises:
        HTTPException 401: Invalid or expired session
        HTTPException 403: User doesn't have Spotify Premium
        HTTPException 404: Device not found
        HTTPException 500: Transfer failed
    """
    print(f"[DEBUG] /api/v1/playback/transfer - Request received")
    print(f"[DEBUG] device_id: {request.device_id}")
    print(f"[DEBUG] session_id: {request.session_id}")
    
    # Step 1: Get user's access token from session
    print(f"[DEBUG] Step 1: Retrieving user session")
    session = await get_session(request.session_id)
    if not session:
        print(f"[DEBUG] Session not found for session_id: {request.session_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again."
        )
    
    access_token = session.access_token if hasattr(session, 'access_token') else None
    if not access_token:
        print(f"[DEBUG] No access token found in session")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No access token found. Please log in again."
        )
    
    print(f"[DEBUG] Retrieved access_token: {access_token[:20]}...")
    
    # Step 2: Transfer playback to the specified device
    print(f"[DEBUG] Step 2: Transferring playback to device {request.device_id}")
    try:
        result = await transfer_playback(request.device_id, access_token)
        print(f"[DEBUG] Transfer successful: {result}")
        return TransferPlaybackResponse(
            success=result["success"],
            message=result["message"]
        )
    except ValueError as e:
        # Handle specific errors from transfer_playback
        print(f"[DEBUG] ValueError during transfer: {str(e)}")
        error_message = str(e)
        
        if "Authentication failed" in error_message or "log in again" in error_message:
            status_code = status.HTTP_401_UNAUTHORIZED
        elif "Forbidden" in error_message or "Premium" in error_message:
            status_code = status.HTTP_403_FORBIDDEN
        elif "Device not found" in error_message:
            status_code = status.HTTP_404_NOT_FOUND
        elif "rate limit" in error_message.lower():
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        
        raise HTTPException(
            status_code=status_code,
            detail=error_message
        )
    except Exception as e:
        # Catch any unexpected errors
        print(f"[DEBUG] Unexpected exception during transfer: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[DEBUG] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to transfer playback: {str(e)}"
        )


@router.post("/play", response_model=PlayPlaybackResponse, status_code=status.HTTP_200_OK)
async def play_playback_endpoint(request: PlayPlaybackRequest):
    """
    Start playback of a specific playlist on the web player device.
    
    This endpoint:
    1. Validates the session and retrieves the user's access token
    2. Calls Spotify's Start/Resume Playback API to play the specified playlist
    3. Returns success status
    
    Args:
        request: PlayPlaybackRequest containing device_id, session_id, and playlist_uri
        
    Returns:
        PlayPlaybackResponse with success status and message
        
    Raises:
        HTTPException 401: Invalid or expired session
        HTTPException 403: User doesn't have Spotify Premium
        HTTPException 404: Device or playlist not found
        HTTPException 500: Playback start failed
    """
    print(f"[DEBUG] /api/v1/playback/play - Request received")
    print(f"[DEBUG] device_id: {request.device_id}")
    print(f"[DEBUG] session_id: {request.session_id}")
    print(f"[DEBUG] playlist_uri: {request.playlist_uri}")
    
    # Step 1: Get user's access token from session
    print(f"[DEBUG] Step 1: Retrieving user session")
    session = await get_session(request.session_id)
    if not session:
        print(f"[DEBUG] Session not found for session_id: {request.session_id}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session. Please log in again."
        )
    
    access_token = session.access_token if hasattr(session, 'access_token') else None
    if not access_token:
        print(f"[DEBUG] No access token found in session")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No access token found. Please log in again."
        )
    
    print(f"[DEBUG] Retrieved access_token: {access_token[:20]}...")
    
    # Step 2: Start playback on the specified device with the playlist
    print(f"[DEBUG] Step 2: Starting playback on device {request.device_id} with playlist {request.playlist_uri}")
    try:
        result = await start_playback(request.device_id, request.playlist_uri, access_token)
        print(f"[DEBUG] Playback started successfully: {result}")
        return PlayPlaybackResponse(
            success=result["success"],
            message=result["message"]
        )
    except ValueError as e:
        # Handle specific errors from start_playback
        print(f"[DEBUG] ValueError during playback start: {str(e)}")
        error_message = str(e)
        
        if "Authentication failed" in error_message or "log in again" in error_message:
            status_code = status.HTTP_401_UNAUTHORIZED
        elif "Forbidden" in error_message or "Premium" in error_message:
            status_code = status.HTTP_403_FORBIDDEN
        elif "not found" in error_message:
            status_code = status.HTTP_404_NOT_FOUND
        elif "rate limit" in error_message.lower():
            status_code = status.HTTP_429_TOO_MANY_REQUESTS
        else:
            status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        
        raise HTTPException(
            status_code=status_code,
            detail=error_message
        )
    except Exception as e:
        # Catch any unexpected errors
        print(f"[DEBUG] Unexpected exception during playback start: {type(e).__name__}: {str(e)}")
        import traceback
        print(f"[DEBUG] Traceback: {traceback.format_exc()}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to start playback: {str(e)}"
        )
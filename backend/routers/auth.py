"""
Spotify OAuth authentication router.
Implements Authorization Code Flow for user authentication and token management.
"""

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse
import httpx
import secrets
from typing import Dict
from urllib.parse import urlencode
from config import settings
from repositories.session_repo import create_session, get_session, update_session


router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


@router.get("/login")
async def login():
    """
    Redirect user to Spotify authorization page.
    
    Initiates the OAuth Authorization Code Flow by redirecting the user
    to Spotify's authorization endpoint with required scopes.
    
    Returns:
        RedirectResponse to Spotify authorization page
    """
    print("[LOGIN] /login endpoint called")
    
    # DEBUG: Log the redirect URI being used
    print(f"[DEBUG] Configured SPOTIFY_REDIRECT_URI: {settings.spotify_redirect_uri}")
    
    # Generate random state for CSRF protection
    state = secrets.token_urlsafe(16)
    
    # Store state in session (in production, use secure session storage)
    # For now, we'll pass it through the OAuth flow
    
    # Required scopes for Spotify playback
    scopes = [
        "streaming",                    # Play music in the Web Playback SDK
        "user-read-email",             # Read user's email
        "user-read-private",           # Read user's subscription details
        "user-read-playback-state",    # Read user's playback state
        "user-modify-playback-state",  # Control playback
        "playlist-read-private",       # Read private playlists
        "playlist-read-collaborative"  # Read collaborative playlists
    ]
    
    # Build authorization URL
    auth_params = {
        "client_id": settings.spotify_client_id,
        "response_type": "code",
        "redirect_uri": settings.spotify_redirect_uri,
        "state": state,
        "scope": " ".join(scopes)
    }
    
    # Construct query string with proper URL encoding
    query_string = urlencode(auth_params)
    auth_url = f"https://accounts.spotify.com/authorize?{query_string}"
    
    print(f"[LOGIN] Constructed Spotify authorization URL: {auth_url}")
    print(f"[LOGIN] Redirecting user to Spotify for authorization")
    
    return RedirectResponse(url=auth_url)


@router.get("/callback")
async def callback(code: str = None, state: str = None, error: str = None):
    """
    Handle callback from Spotify after user authorization.
    
    Exchanges the authorization code for access and refresh tokens,
    then stores them securely associated with the user's session.
    
    Args:
        code: Authorization code from Spotify
        state: State parameter for CSRF protection
        error: Error message if authorization failed
        
    Returns:
        Success response with session information
        
    Raises:
        HTTPException: If authorization fails or token exchange fails
    """
    print("[CALLBACK] /callback endpoint called")
    print(f"[CALLBACK] Received parameters - code: {'present' if code else 'missing'}, state: {state}, error: {error}")
    
    # Check for authorization errors
    if error:
        raise HTTPException(
            status_code=400,
            detail=f"Spotify authorization failed: {error}"
        )
    
    if not code:
        raise HTTPException(
            status_code=400,
            detail="No authorization code received from Spotify"
        )
    
    # TODO: Verify state parameter matches what we sent (CSRF protection)
    # In production, retrieve stored state from session and compare
    
    # Exchange authorization code for access token
    token_url = "https://accounts.spotify.com/api/token"
    
    token_data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": settings.spotify_redirect_uri,
        "client_id": settings.spotify_client_id,
        "client_secret": settings.spotify_client_secret
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                token_url,
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            
            token_response = response.json()
            
            # Extract tokens
            access_token = token_response.get("access_token")
            refresh_token = token_response.get("refresh_token")
            expires_in = token_response.get("expires_in", 3600)
            
            if not access_token or not refresh_token:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid token response from Spotify"
                )
            
            # Create session in database with OAuth tokens
            session_data = {
                "access_token": access_token,
                "refresh_token": refresh_token,
                "expires_in": str(expires_in)
            }
            
            print(f"[CALLBACK] Creating session with data: access_token={'present' if access_token else 'missing'}, refresh_token={'present' if refresh_token else 'missing'}, expires_in={expires_in}")
            session_id = await create_session(session_data)
            print(f"[CALLBACK] Session created with session_id: {session_id}")
            
            # Redirect to frontend callback page with session_id
            frontend_callback_url = f"{settings.frontend_url}/auth/callback?session_id={session_id}"
            print(f"[CALLBACK] Successfully exchanged code for tokens")
            print(f"[CALLBACK] Generated session_id: {session_id}")
            print(f"[CALLBACK] Redirecting to frontend: {frontend_callback_url}")
            
            return RedirectResponse(url=frontend_callback_url)
            
    except httpx.HTTPStatusError as e:
        error_detail = "Failed to exchange authorization code for tokens"
        if e.response.status_code == 400:
            error_detail = "Invalid authorization code or redirect URI"
        elif e.response.status_code == 401:
            error_detail = "Invalid client credentials"
        
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"{error_detail}: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Network error while contacting Spotify: {str(e)}"
        )


@router.post("/refresh")
async def refresh_token(session_id: str):
    """
    Use refresh token to obtain a new access token.
    
    When the access token expires, this endpoint uses the stored refresh token
    to obtain a new access token without requiring user re-authentication.
    
    Args:
        session_id: Session identifier containing the refresh token
        
    Returns:
        New access token and expiry information
        
    Raises:
        HTTPException: If session not found or token refresh fails
    """
    # Retrieve session from database
    session = await get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please authenticate again."
        )
    
    refresh_token = session.refresh_token if hasattr(session, 'refresh_token') else None
    if not refresh_token:
        raise HTTPException(
            status_code=400,
            detail="No refresh token found in session"
        )
    
    # Request new access token using refresh token
    token_url = "https://accounts.spotify.com/api/token"
    
    token_data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
        "client_id": settings.spotify_client_id,
        "client_secret": settings.spotify_client_secret
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                token_url,
                data=token_data,
                headers={"Content-Type": "application/x-www-form-urlencoded"}
            )
            response.raise_for_status()
            
            token_response = response.json()
            
            # Extract new access token
            new_access_token = token_response.get("access_token")
            expires_in = token_response.get("expires_in", 3600)
            
            # Spotify may optionally return a new refresh token
            new_refresh_token = token_response.get("refresh_token")
            
            if not new_access_token:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid token response from Spotify"
                )
            
            # Update session in database with new tokens
            updates = {
                "access_token": new_access_token,
                "expires_in": str(expires_in)
            }
            
            if new_refresh_token:
                updates["refresh_token"] = new_refresh_token
            
            await update_session(session_id, updates)
            
            return {
                "success": True,
                "access_token": new_access_token,
                "expires_in": expires_in,
                "message": "Access token refreshed successfully"
            }
            
    except httpx.HTTPStatusError as e:
        error_detail = "Failed to refresh access token"
        if e.response.status_code == 400:
            error_detail = "Invalid refresh token"
        elif e.response.status_code == 401:
            error_detail = "Invalid client credentials"
        
        raise HTTPException(
            status_code=e.response.status_code,
            detail=f"{error_detail}: {e.response.text}"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=503,
            detail=f"Network error while contacting Spotify: {str(e)}"
        )


@router.get("/token/{session_id}")
async def get_token(session_id: str):
    """
    Retrieve the access token for a given session.
    
    This endpoint is used by the frontend to obtain the access token
    needed to initialize the Spotify Web Playback SDK.
    
    Args:
        session_id: Session identifier
        
    Returns:
        Access token for the session
        
    Raises:
        HTTPException: If session not found or no access token available
    """
    print(f"[GET_TOKEN] Retrieving token for session_id: {session_id}")
    
    # Retrieve session from database
    session = await get_session(session_id)
    if not session:
        print(f"[GET_TOKEN] Session not found: {session_id}")
        raise HTTPException(
            status_code=404,
            detail="Session not found. Please authenticate again."
        )
    
    access_token = session.access_token if hasattr(session, 'access_token') else None
    if not access_token:
        print(f"[GET_TOKEN] No access token found in session: {session_id}")
        raise HTTPException(
            status_code=400,
            detail="No access token found in session. Please authenticate."
        )
    
    print(f"[GET_TOKEN] Successfully retrieved access token for session: {session_id}")
    
    return {
        "access_token": access_token,
        "session_id": session_id
    }
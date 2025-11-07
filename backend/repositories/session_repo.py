from typing import Optional, Dict, Any
from datetime import datetime
import uuid
import asyncio
from database import get_database
from models.session import SessionModel


async def create_session(playlist_data: Dict[str, Any]) -> str:
    """
    Create a new session in the database with playlist data.
    
    Args:
        playlist_data: Dictionary containing playlist information including:
            - spotify_playlist_id: Spotify playlist ID
            - playlist_title: Playlist name
            - track_count: Number of tracks
            - total_duration: Total duration in seconds
            - tracks: List of track dictionaries
            - access_token: Spotify OAuth access token (optional)
            - refresh_token: Spotify OAuth refresh token (optional)
            - expires_in: Token expiry time in seconds (optional)
    
    Returns:
        str: The generated session_id
    """
    try:
        db = get_database()
    except Exception as e:
        raise Exception(f"Database not connected: {str(e)}")
    
    sessions_collection = db.sessions
    
    # Generate a new session ID
    session_id = str(uuid.uuid4())
    
    print(f"[CREATE_SESSION] Generated session_id: {session_id}")
    print(f"[CREATE_SESSION] Received playlist_data keys: {list(playlist_data.keys())}")
    
    # Create session document
    session_doc = {
        "session_id": session_id,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "spotify_playlist_id": playlist_data.get("spotify_playlist_id"),
        "playlist_title": playlist_data.get("playlist_title"),
        "track_count": playlist_data.get("track_count", 0),
        "total_duration": playlist_data.get("total_duration", 0),
        "tracks": playlist_data.get("tracks", []),
        "custom_order": None,
        "current_track_index": 0,
        "playback_position": 0,
        "is_playing": False,
        "active_deck": "left",
        "access_token": playlist_data.get("access_token"),
        "refresh_token": playlist_data.get("refresh_token"),
        "expires_in": playlist_data.get("expires_in")
    }
    
    print(f"[CREATE_SESSION] Session document to insert: access_token={'present' if session_doc.get('access_token') else 'missing'}, refresh_token={'present' if session_doc.get('refresh_token') else 'missing'}")
    
    # Insert into database with timeout
    try:
        await asyncio.wait_for(
            sessions_collection.insert_one(session_doc),
            timeout=5.0
        )
        print(f"[CREATE_SESSION] Successfully inserted session into database")
    except asyncio.TimeoutError:
        raise Exception("Database operation timed out")
    except Exception as e:
        raise Exception(f"Failed to insert session into database: {str(e)}")
    
    return session_id


async def get_session(session_id: str) -> Optional[SessionModel]:
    """
    Retrieve a session from the database by session_id.
    
    Args:
        session_id: The UUID of the session to retrieve
    
    Returns:
        SessionModel if found, None otherwise
    """
    db = get_database()
    sessions_collection = db.sessions
    
    print(f"[GET_SESSION] Looking up session_id: {session_id}")
    
    # Find session by session_id
    session_doc = await sessions_collection.find_one({"session_id": session_id})
    
    if session_doc is None:
        print(f"[GET_SESSION] Session not found in database")
        return None
    
    print(f"[GET_SESSION] Session found: access_token={'present' if session_doc.get('access_token') else 'missing'}, refresh_token={'present' if session_doc.get('refresh_token') else 'missing'}")
    
    # Remove MongoDB's _id field before converting to Pydantic model
    session_doc.pop("_id", None)
    
    # Convert to Pydantic model
    return SessionModel(**session_doc)


async def update_session(session_id: str, updates: Dict[str, Any]) -> Optional[SessionModel]:
    """
    Update a session in the database with the provided updates.
    
    Args:
        session_id: The UUID of the session to update
        updates: Dictionary of fields to update
    
    Returns:
        Updated SessionModel if found, None otherwise
    """
    db = get_database()
    sessions_collection = db.sessions
    
    # Add updated_at timestamp to updates
    updates["updated_at"] = datetime.utcnow()
    
    # Update the session
    result = await sessions_collection.update_one(
        {"session_id": session_id},
        {"$set": updates}
    )
    
    if result.matched_count == 0:
        return None
    
    # Retrieve and return the updated session
    return await get_session(session_id)


async def delete_session(session_id: str) -> bool:
    """
    Delete a session from the database.
    
    Args:
        session_id: The UUID of the session to delete
    
    Returns:
        bool: True if session was deleted, False if not found
    """
    db = get_database()
    sessions_collection = db.sessions
    
    # Delete the session
    result = await sessions_collection.delete_one({"session_id": session_id})
    
    return result.deleted_count > 0
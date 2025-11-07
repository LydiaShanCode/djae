import requests
import json
from urllib.parse import urlparse, parse_qs

# Base URL for the API
BASE_URL = "http://localhost:8000/api/v1"

def simulate_oauth_login():
    """
    Simulate the OAuth login flow to get a valid session_id.
    
    This function guides the user through the OAuth flow since it requires
    manual browser interaction with Spotify's authorization page.
    
    Returns:
        str: session_id if successful, None otherwise
    """
    print("\n" + "=" * 60)
    print("OAUTH AUTHENTICATION FLOW")
    print("=" * 60)
    
    # Step 1: Get the Spotify authorization URL
    print("\n[Step 1] Getting Spotify authorization URL...")
    print("-" * 60)
    
    login_url = f"{BASE_URL}/auth/login"
    
    try:
        # Use allow_redirects=False to capture the redirect URL
        response = requests.get(login_url, allow_redirects=False)
        
        if response.status_code in [307, 302, 303]:
            auth_url = response.headers.get('Location')
            print(f"✓ Authorization URL obtained")
            print(f"\nSpotify Authorization URL:\n{auth_url}")
            
            # Step 2: Instruct user to complete OAuth flow
            print("\n[Step 2] Complete OAuth Authorization")
            print("-" * 60)
            print("INSTRUCTIONS:")
            print("1. Copy the URL above and paste it into your browser")
            print("2. Log in to Spotify and authorize the application")
            print("3. After authorization, you will be redirected to a URL like:")
            print("   http://localhost:5139/auth/callback?session_id=<SESSION_ID>")
            print("4. Copy the FULL callback URL from your browser's address bar")
            print()
            
            callback_url = input("Paste the callback URL here: ").strip()
            
            # Step 3: Extract session_id from callback URL
            print("\n[Step 3] Extracting session_id from callback URL...")
            print("-" * 60)
            
            try:
                parsed_url = urlparse(callback_url)
                query_params = parse_qs(parsed_url.query)
                session_id = query_params.get('session_id', [None])[0]
                
                if session_id:
                    print(f"✓ Session ID extracted: {session_id}")
                    
                    # Verify the session is valid by checking if we can get a token
                    print("\n[Step 4] Verifying session...")
                    print("-" * 60)
                    token_url = f"{BASE_URL}/auth/token/{session_id}"
                    token_response = requests.get(token_url)
                    
                    if token_response.status_code == 200:
                        print("✓ Session verified successfully")
                        return session_id
                    else:
                        print(f"❌ Session verification failed: {token_response.status_code}")
                        print(f"Response: {token_response.text}")
                        return None
                else:
                    print("❌ No session_id found in callback URL")
                    return None
                    
            except Exception as e:
                print(f"❌ Failed to parse callback URL: {str(e)}")
                return None
        else:
            print(f"❌ Unexpected response from /login endpoint")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Request failed: {str(e)}")
        return None


def test_get_playlist():
    """
    Test script for GET /api/v1/sessions/{session_id}/playlist endpoint
    
    Steps:
    1. Authenticate via OAuth to get a valid session_id
    2. Create a session by importing a playlist
    3. Retrieve the playlist using the session_id
    4. Print the results
    """
    
    print("=" * 60)
    print("Testing GET /api/v1/sessions/{session_id}/playlist")
    print("=" * 60)
    
    # Step 1: Authenticate to get session_id
    session_id = simulate_oauth_login()
    
    if not session_id:
        print("\n❌ Authentication failed. Cannot proceed with test.")
        return
    
    print("\n" + "=" * 60)
    print("PLAYLIST IMPORT AND RETRIEVAL TEST")
    print("=" * 60)
    
    # Step 2: Import a playlist using the authenticated session
    print("\n[Step 1] Importing playlist via POST /api/v1/playlists/import")
    print("-" * 60)
    
    import_url = f"{BASE_URL}/playlists/import"
    import_payload = {
        "spotify_url": "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
        "session_id": session_id
    }
    
    try:
        import_response = requests.post(import_url, json=import_payload)
        print(f"Status Code: {import_response.status_code}")
        
        if import_response.status_code == 200:
            import_data = import_response.json()
            print(f"Response: {json.dumps(import_data, indent=2)}")
            
            returned_session_id = import_data.get("session_id")
            if not returned_session_id:
                print("\n❌ Error: No session_id in response")
                return
            
            print(f"\n✓ Playlist imported successfully")
            print(f"Session ID: {returned_session_id}")
            
            # Step 3: Get the playlist using the session_id
            print(f"\n[Step 2] Retrieving playlist via GET /api/v1/sessions/{returned_session_id}/playlist")
            print("-" * 60)
            
            playlist_url = f"{BASE_URL}/sessions/{returned_session_id}/playlist"
            playlist_response = requests.get(playlist_url)
            
            print(f"Status Code: {playlist_response.status_code}")
            
            if playlist_response.status_code == 200:
                playlist_data = playlist_response.json()
                print(f"Response: {json.dumps(playlist_data, indent=2)}")
                print("\n✓ Playlist retrieved successfully")
                
                # Print summary
                if "tracks" in playlist_data:
                    track_count = len(playlist_data["tracks"])
                    print(f"\nPlaylist contains {track_count} tracks")
            else:
                print(f"Response: {playlist_response.text}")
                print(f"\n❌ Failed to retrieve playlist")
                
        else:
            print(f"Response: {import_response.text}")
            print(f"\n❌ Failed to import playlist")
            
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Request failed: {str(e)}")
    except json.JSONDecodeError as e:
        print(f"\n❌ Failed to parse JSON response: {str(e)}")
    
    print("\n" + "=" * 60)
    print("Test completed")
    print("=" * 60)


if __name__ == "__main__":
    test_get_playlist()
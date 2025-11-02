
# Backend Development Plan: DJ Simulator with Spotify Integration

## 1️⃣ Executive Summary

**What Will Be Built:**
- FastAPI backend to integrate Spotify Web API for playlist import and track data retrieval
- MongoDB Atlas database to store user sessions and playlist state
- RESTful API endpoints to support DJ simulator frontend features
- Real-time playlist management and playback state synchronization

**Why:**
- Transform static Spotify playlists into interactive DJ experience
- Enable users to import, visualize, and control playlist playback
- Support drag-and-drop playlist reordering with persistent state

**Key Constraints:**
- FastAPI with Python 3.13 (async)
- MongoDB Atlas using Motor and Pydantic v2
- No Docker deployment
- Manual testing after every task via frontend UI
- Single-branch Git workflow (`main` only)
- API base path: `/api/v1/*`

**Sprint Structure:**
- **S0:** Environment setup and frontend connection
- **S1:** Spotify OAuth and playlist import
- **S2:** Playlist management and reordering
- **S3:** Playback state management
- **Total Sprints:** 4 (S0-S3)

---

## 2️⃣ In-Scope & Success Criteria

**In-Scope Features:**
- Spotify playlist URL validation and import
- Fetch playlist metadata and track details from Spotify API
- Store and retrieve playlist sessions in MongoDB Atlas
- Support playlist track reordering
- Manage playback state (current track, position, playing status)
- Empty state handling when no playlist is connected
- Vinyl deck alternation logic (left/right deck switching)
- Real-time playlist panel updates

**Success Criteria:**
- User can paste Spotify playlist URL and see imported tracks
- Empty state displays when no playlist is connected
- First two songs appear on left and right vinyl disks
- Vinyl decks alternate correctly as tracks progress
- Playlist panel shows all tracks with "Now Playing" indicator
- Music player controls (play/pause/skip) function correctly
- All task-level manual tests pass via frontend UI
- Each sprint's code pushed to `main` after verification

---

## 3️⃣ API Design

**Base Path:** `/api/v1`

**Error Envelope:**
```json
{
  "error": "Human-readable error message"
}
```

### Endpoints

#### Health Check
- **GET** `/healthz`
- **Purpose:** Verify backend and MongoDB Atlas connectivity
- **Response:**
  ```json
  {
    "status": "healthy",
    "database": "connected",
    "timestamp": "2025-11-02T17:41:11.922Z"
  }
  ```

#### Import Spotify Playlist
- **POST** `/api/v1/playlists/import`
- **Purpose:** Validate Spotify URL, fetch playlist data, create session
- **Request:**
  ```json
  {
    "spotify_url": "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M"
  }
  ```
- **Response:**
  ```json
  {
    "session_id": "uuid",
    "playlist": {
      "id": "spotify_playlist_id",
      "title": "Summer Vibes Mix 2024",
      "track_count": 12,
      "total_duration": 2847,
      "tracks": [
        {
          "id": "track_id",
          "title": "Blinding Lights",
          "artist": "The Weeknd",
          "album": "After Hours",
          "duration": 200,
          "album_art_url": "https://...",
          "spotify_uri": "spotify:track:..."
        }
      ]
    }
  }
  ```
- **Validation:** URL format must match Spotify playlist pattern

#### Get Session Playlist
- **GET** `/api/v1/sessions/{session_id}/playlist`
- **Purpose:** Retrieve current playlist for session
- **Response:** Same as import response (playlist object)

#### Update Playlist Order
- **PUT** `/api/v1/sessions/{session_id}/playlist/reorder`
- **Purpose:** Save reordered track list
- **Request:**
  ```json
  {
    "track_ids": ["track-2", "track-1", "track-3"]
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "playlist": { /* updated playlist */ }
  }
  ```

#### Get Playback State
- **GET** `/api/v1/sessions/{session_id}/playback`
- **Purpose:** Retrieve current playback state
- **Response:**
  ```json
  {
    "current_track_index": 0,
    "playback_position": 45,
    "is_playing": true,
    "active_deck": "left"
  }
  ```

#### Update Playback State
- **PUT** `/api/v1/sessions/{session_id}/playback`
- **Purpose:** Update playback state (track index, position, playing status)
- **Request:**
  ```json
  {
    "current_track_index": 1,
    "playback_position": 0,
    "is_playing": true,
    "active_deck": "right"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "playback": { /* updated state */ }
  }
  ```

#### Clear Session
- **DELETE** `/api/v1/sessions/{session_id}`
- **Purpose:** Clear session and return to empty state
- **Response:**
  ```json
  {
    "success": true,
    "message": "Session cleared"
  }
  ```

---

## 4️⃣ Data Model (MongoDB Atlas)

### Collection: `sessions`

**Purpose:** Store user session data with playlist and playback state

**Fields:**
- `_id` (ObjectId) — MongoDB auto-generated ID
- `session_id` (str, required) — UUID for session identification
- `created_at` (datetime, required) — Session creation timestamp
- `updated_at` (datetime, required) — Last update timestamp
- `spotify_playlist_id` (str, optional) — Spotify playlist ID
- `playlist_title` (str, optional) — Playlist name
- `track_count` (int, default=0) — Number of tracks
- `total_duration` (int, default=0) — Total duration in seconds
- `tracks` (list[dict], default=[]) — Array of track objects
- `custom_order` (list[str], optional) — Reordered track IDs
- `current_track_index` (int, default=0) — Current playing track index
- `playback_position` (int, default=0) — Current position in seconds
- `is_playing` (bool, default=False) — Playback status
- `active_deck` (str, default="left") — Active vinyl deck ("left" or "right")

**Embedded Track Structure:**
```json
{
  "id": "track_id",
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name",
  "duration": 200,
  "album_art_url": "https://...",
  "spotify_uri": "spotify:track:..."
}
```

**Example Document:**
```json
{
  "_id": ObjectId("..."),
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
  "custom_order": null,
  "current_track_index": 0,
  "playback_position": 45,
  "is_playing": true,
  "active_deck": "left"
}
```

---

## 5️⃣ Frontend Audit & Feature Map

### Screen: Main Application (Index.tsx)

**Route:** `/`

**Purpose:** Single-page DJ simulator interface

**Data Needed:**
- Session ID (generated on playlist import)
- Playlist metadata and tracks
- Current playback state
- Active deck indicator

**Required Backend Endpoints:**
- `POST /api/v1/playlists/import` — Import Spotify playlist
- `GET /api/v1/sessions/{session_id}/playlist` — Fetch playlist
- `PUT /api/v1/sessions/{session_id}/playlist/reorder` — Reorder tracks
- `GET /api/v1/sessions/{session_id}/playback` — Get playback state
- `PUT /api/v1/sessions/{session_id}/playback` — Update playback state
- `DELETE /api/v1/sessions/{session_id}` — Clear session

**Required Models:**
- Session (with embedded playlist and playback state)

**Auth Requirement:** None (single-user session-based)

**Notes:**
- Frontend currently uses mock data from `mockPlaylist.ts`
- Empty state should display when `playlist.tracks.length === 0`
- Vinyl deck alternation logic: left deck plays even-indexed tracks, right deck plays odd-indexed tracks
- "Now Playing" card in playlist panel highlights current track

---

## 6️⃣ Configuration & ENV Vars

**Core Environment Variables:**

- `APP_ENV` — Environment (development, production)
- `PORT` — HTTP port (default: 8000)
- `MONGODB_URI` — MongoDB Atlas connection string
- `SPOTIFY_CLIENT_ID` — Spotify API client ID
- `SPOTIFY_CLIENT_SECRET` — Spotify API client secret
- `SPOTIFY_REDIRECT_URI` — OAuth callback URL (for future auth flow)
- `CORS_ORIGINS` — Allowed frontend URL(s) (e.g., http://localhost:5173)

**Example `.env` file:**
```
APP_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/djsimulator?retryWrites=true&w=majority
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://localhost:8000/api/v1/auth/callback
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## 7️⃣ Background Work

**Not Required for MVP**

All operations are synchronous and complete within request lifecycle. No background tasks needed.

---

## 8️⃣ Integrations

### Spotify Web API

**Purpose:** Fetch playlist metadata and track details

**Authentication:** Client Credentials Flow (app-only access for public playlists)

**Endpoints Used:**
- `GET https://api.spotify.com/v1/playlists/{playlist_id}` — Fetch playlist details

**Flow:**
1. Backend receives Spotify playlist URL from frontend
2. Extract playlist ID from URL using regex
3. Obtain access token using Client Credentials Flow
4. Fetch playlist data from Spotify API
5. Transform response to match internal data model
6. Store in MongoDB Atlas session

**Error Handling:**
- Invalid URL format → Return 400 error
- Private/unavailable playlist → Return 404 error
- Spotify API rate limit → Return 429 error with retry message
- Network errors → Return 503 error

**Extra ENV Vars:**
- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`

---

## 9️⃣ Testing Strategy (Manual via Frontend)

**Validation Method:** All testing performed through frontend UI

**Test Requirements:**
- Every task includes **Manual Test Step** (exact UI action + expected result)
- Every task includes **User Test Prompt** (copy-paste instruction)
- After all tasks in sprint pass → commit and push to `main`
- If any test fails → fix and retest before pushing

**Test Flow:**
1. Start backend server
2. Open frontend in browser
3. Execute test prompt action
4. Verify expected result
5. Mark task complete only if test passes

---

## 🔟 Dynamic Sprint Plan & Backlog

---

## 🧱 S0 – Environment Setup & Frontend Connection

**Objectives:**
- Create FastAPI skeleton with `/api/v1` base path and `/healthz` endpoint
- Connect to MongoDB Atlas using `MONGODB_URI`
- `/healthz` performs DB ping and returns JSON status
- Enable CORS for frontend origin
- Initialize Git repository at root with `main` branch
- Create `.gitignore` file (ignore `__pycache__`, `.env`, `*.pyc`, `venv/`, `.vscode/`)
- Push initial commit to GitHub

**User Stories:**
- As a developer, I need a working FastAPI backend that connects to MongoDB Atlas
- As a developer, I need CORS enabled so frontend can communicate with backend
- As a developer, I need version control set up for code management

**Tasks:**

### Task 1: Initialize FastAPI Project Structure
- Create `backend/` directory at project root
- Create `backend/main.py` with FastAPI app instance
- Create `backend/requirements.txt` with dependencies:
  - `fastapi==0.115.0`
  - `uvicorn[standard]==0.32.0`
  - `motor==3.6.0`
  - `pydantic==2.9.2`
  - `pydantic-settings==2.6.0`
  - `python-dotenv==1.0.1`
  - `httpx==0.27.2`
- Create `backend/.env.example` with all required env vars
- Create `backend/config.py` for settings management using Pydantic Settings

**Manual Test Step:**
- Run `cd backend && pip install -r requirements.txt` → all packages install successfully

**User Test Prompt:**
> "Navigate to the backend directory and run `pip install -r requirements.txt`. Confirm all dependencies install without errors."

---

### Task 2: Implement Health Check Endpoint
- Create `backend/routers/health.py`
- Implement `GET /healthz` endpoint
- Perform MongoDB Atlas connection test
- Return JSON with status, database connectivity, and timestamp

**Manual Test Step:**
- Start backend with `uvicorn main:app --reload --port 8000`
- Open browser to `http://localhost:8000/healthz`
- Verify response shows `{"status": "healthy", "database": "connected", "timestamp": "..."}`

**User Test Prompt:**
> "Start the backend server and navigate to http://localhost:8000/healthz. Confirm you see a JSON response with healthy status and database connected."

---

### Task 3: Configure CORS and MongoDB Connection
- Add CORS middleware to `main.py` with frontend origin from env
- Create `backend/database.py` with Motor async MongoDB client
- Implement connection initialization and health check function
- Test MongoDB Atlas connection on startup

**Manual Test Step:**
- Start backend server
- Open frontend at `http://localhost:5173`
- Open browser DevTools → Network tab
- Refresh page and verify no CORS errors in console

**User Test Prompt:**
> "Start both backend and frontend servers. Open the frontend in your browser and check the console. Confirm there are no CORS-related errors."

---

### Task 4: Initialize Git Repository
- Run `git init` at project root (if not already initialized)
- Set default branch to `main`: `git branch -M main`
- Create `.gitignore` at root with:
  ```
  __pycache__/
  *.pyc
  *.pyo
  .env
  venv/
  .vscode/
  .DS_Store
  *.log
  ```
- Create initial commit with all files
- Create GitHub repository and push to remote

**Manual Test Step:**
- Run `git status` → verify `.env` is ignored
- Run `git log` → verify initial commit exists
- Check GitHub repository → verify code is pushed

**User Test Prompt:**
> "Run `git status` and confirm that .env files are not tracked. Then check your GitHub repository to verify the initial commit is visible."

---

**Definition of Done:**
- Backend runs locally on port 8000
- `/healthz` endpoint returns success with MongoDB Atlas connection status
- CORS enabled for frontend origin
- Git repository initialized with `main` branch
- Initial code pushed to GitHub
- All task tests pass

**Post-Sprint:**
- Commit all changes with message: "S0: Environment setup complete"
- Push to `main` branch

---

## 🧩 S1 – Spotify OAuth and Playlist Import

**Objectives:**
- Implement Spotify Client Credentials authentication
- Create playlist import endpoint that validates URL and fetches data
- Store playlist data in MongoDB Atlas session
- Return session ID to frontend for subsequent requests
- Handle empty state (no playlist connected)

**User Stories:**
- As a user, I want to paste a Spotify playlist URL and see my tracks imported
- As a user, I want to see an empty state when no playlist is connected
- As a developer, I need secure Spotify API integration

**Tasks:**

### Task 1: Implement Spotify Client Credentials Flow
- Create `backend/services/spotify.py`
- Implement `get_access_token()` function using Client Credentials Flow
- Cache token until expiry (3600 seconds)
- Handle authentication errors gracefully

**Manual Test Step:**
- Add print statement in `get_access_token()` to log token
- Start backend and trigger token fetch
- Verify token is logged and not empty

**User Test Prompt:**
> "Start the backend server. The Spotify access token should be fetched automatically. Check the console logs to confirm a valid token is retrieved."

---

### Task 2: Implement Playlist URL Validation and ID Extraction
- Create `backend/utils/validators.py`
- Implement `extract_playlist_id(url: str)` function
- Support formats:
  - `https://open.spotify.com/playlist/{id}`
  - `https://open.spotify.com/playlist/{id}?si=...`
- Return playlist ID or raise validation error

**Manual Test Step:**
- Create test script to validate various URL formats
- Run script and verify correct IDs are extracted
- Verify invalid URLs raise errors

**User Test Prompt:**
> "Run the validation test script. Confirm that valid Spotify URLs return playlist IDs and invalid URLs raise appropriate errors."

---

### Task 3: Implement Spotify Playlist Fetch
- In `backend/services/spotify.py`, create `fetch_playlist(playlist_id: str)` function
- Call Spotify API: `GET https://api.spotify.com/v1/playlists/{playlist_id}`
- Transform response to internal data model
- Extract: playlist title, track count, total duration, tracks array
- Handle API errors (404, 429, 500)

**Manual Test Step:**
- Create test endpoint to fetch a known public playlist
- Call endpoint and verify playlist data is returned correctly
- Verify track details include title, artist, album, duration, album art URL

**User Test Prompt:**
> "Use a tool like Postman or curl to call the test endpoint with a public Spotify playlist ID. Confirm the response includes playlist title and track details."

---

### Task 4: Create Session Model and Database Operations
- Create `backend/models/session.py` with Pydantic v2 models
- Define `SessionModel` with all fields from data model section
- Create `backend/repositories/session_repo.py`
- Implement CRUD operations:
  - `create_session(playlist_data)` → returns session_id
  - `get_session(session_id)` → returns session document
  - `update_session(session_id, updates)` → updates fields
  - `delete_session(session_id)` → removes session

**Manual Test Step:**
- Create test script to perform CRUD operations
- Verify session is created in MongoDB Atlas
- Verify session can be retrieved, updated, and deleted

**User Test Prompt:**
> "Run the CRUD test script. Check MongoDB Atlas to confirm a session document is created, updated, and deleted successfully."

---

### Task 5: Implement Playlist Import Endpoint
- Create `backend/routers/playlists.py`
- Implement `POST /api/v1/playlists/import`
- Validate Spotify URL
- Fetch playlist from Spotify API
- Create session in MongoDB Atlas
- Return session ID and playlist data

**Manual Test Step:**
- Open frontend, paste Spotify playlist URL in header input
- Click submit button
- Verify playlist tracks appear in playlist panel
- Verify first two tracks appear on vinyl disks
- Verify "Now Playing" card shows first track

**User Test Prompt:**
> "Open the frontend and paste a Spotify playlist URL into the input field. Click submit and confirm that the playlist tracks load and the first two songs appear on the vinyl disks."

---

### Task 6: Update Frontend to Use Real API
- In `frontend/src/pages/Index.tsx`, replace mock data with API calls
- Update `handlePlaylistImport()` to call `POST /api/v1/playlists/import`
- Store `session_id` in component state
- Update empty state logic to check if `playlist.tracks.length === 0`
- Display empty state message when no playlist is connected

**Manual Test Step:**
- Open frontend without importing playlist
- Verify empty state is displayed with message
- Import playlist and verify empty state disappears
- Verify tracks load correctly

**User Test Prompt:**
> "Open the frontend without importing a playlist. Confirm an empty state message is displayed. Then import a playlist and verify the tracks load correctly."

---

**Definition of Done:**
- Spotify Client Credentials authentication works
- Playlist import endpoint validates URLs and fetches data
- Sessions are stored in MongoDB Atlas
- Frontend displays empty state when no playlist is connected
- Frontend displays imported playlist tracks
- First two tracks appear on vinyl disks
- All task tests pass

**Post-Sprint:**
- Commit all changes with message: "S1: Spotify playlist import complete"
- Push to `main` branch

---

## 🧱 S2 – Playlist Management and Reordering

**Objectives:**
- Implement playlist retrieval endpoint
- Support drag-and-drop track reordering
- Persist reordered track list in MongoDB Atlas
- Update frontend to sync with backend state

**User Stories:**
- As a user, I want to reorder tracks in my playlist
- As a user, I want my reordered playlist to persist across page refreshes
- As a developer, I need to maintain playlist state consistency

**Tasks:**

### Task 1: Implement Get Session Playlist Endpoint
- In `backend/routers/playlists.py`, implement `GET /api/v1/sessions/{session_id}/playlist`
- Retrieve session from MongoDB Atlas
- Return playlist data with current track order
- Handle session not found error (404)

**Manual Test Step:**
- Import a playlist in frontend
- Refresh the page
- Verify playlist data is retrieved and displayed correctly

**User Test Prompt:**
> "Import a playlist, then refresh the browser page. Confirm the playlist data reloads and displays correctly."

---

### Task 2: Implement Playlist Reorder Endpoint
- In `backend/routers/playlists.py`, implement `PUT /api/v1/sessions/{session_id}/playlist/reorder`
- Accept array of track IDs in new order
- Validate all track IDs exist in original playlist
- Update `custom_order` field in session document
- Return updated playlist

**Manual Test Step:**
- Import playlist in frontend
- Drag a track to a new position in playlist panel
- Verify track moves to new position
- Refresh page and verify new order persists

**User Test Prompt:**
> "Import a playlist and drag a track to a different position. Confirm the track moves. Then refresh the page and verify the new order is maintained."

---

### Task 3: Update Frontend Playlist Reordering
- In `frontend/src/pages/Index.tsx`, update `handleReorder()` function
- Call `PUT /api/v1/sessions/{session_id}/playlist/reorder` with new track order
- Update local state with response
- Handle errors gracefully

**Manual Test Step:**
- Drag multiple tracks to different positions
- Verify each reorder operation succeeds
- Verify playlist panel updates immediately
- Verify playback queue reflects new order

**User Test Prompt:**
> "Drag several tracks to different positions in the playlist. Confirm each move is saved and the playlist updates immediately."

---

### Task 4: Implement Session Retrieval on Page Load
- In `frontend/src/pages/Index.tsx`, add effect to retrieve session on mount
- Check for `session_id` in localStorage
- If exists, call `GET /api/v1/sessions/{session_id}/playlist`
- Load playlist data into state
- If not exists or session expired, show empty state

**Manual Test Step:**
- Import playlist
- Close browser tab
- Reopen frontend
- Verify playlist is restored from session

**User Test Prompt:**
> "Import a playlist, close the browser tab, then reopen the frontend. Confirm your playlist is automatically restored."

---

**Definition of Done:**
- Playlist retrieval endpoint works
- Track reordering persists in MongoDB Atlas
- Frontend syncs reordered tracks with backend
- Playlist state persists across page refreshes
- All task tests pass

**Post-Sprint:**
- Commit all changes with message: "S2: Playlist management and reordering complete"
- Push to `main` branch

---

## 🧱 S3 – Playback State Management

**Objectives:**
- Implement playback state endpoints (get/update)
- Track current track index, playback position, playing status
- Manage vinyl deck alternation (left/right)
- Sync playback state between frontend and backend
- Support music player controls (play/pause/skip/previous)

**User Stories:**
- As a user, I want my playback state to persist across page refreshes
- As a user, I want the vinyl disks to alternate correctly as tracks progress
- As a user, I want the "Now Playing" card to show the current track
- As a user, I want music player controls to work correctly

**Tasks:**

### Task 1: Implement Get Playback State Endpoint
- In `backend/routers/playback.py`, implement `GET /api/v1/sessions/{session_id}/playback`
- Retrieve session from MongoDB Atlas
- Return playback state fields:
  - `current_track_index`
  - `playback_position`
  - `is_playing`
  - `active_deck`
- Handle session not found error (404)

**Manual Test Step:**
- Import playlist and start playback
- Call endpoint using browser or Postman
- Verify playback state is returned correctly

**User Test Prompt:**
> "Import a playlist and start playing. Use a tool like Postman to call the playback state endpoint. Confirm the response shows the current track index and playing status."

---

### Task 2: Implement Update Playback State Endpoint
- In `backend/routers/playback.py`, implement `PUT /api/v1/sessions/{session_id}/playback`
- Accept playback state updates
- Validate track index is within playlist bounds
- Update session document in MongoDB Atlas
- Return updated playback state

**Manual Test Step:**
- Import playlist
- Click play button in frontend
- Verify playback state updates in database
- Click pause and verify state updates again

**User Test Prompt:**
> "Import a playlist and click the play button. Confirm playback starts. Then click pause and verify playback stops."

---

### Task 3: Implement Vinyl Deck Alternation Logic
- In `backend/routers/playback.py`, add logic to calculate `active_deck`
- When track advances, toggle deck: left → right → left → right
- Update `active_deck` field when `current_track_index` changes
- Return updated deck in playback state response

**Manual Test Step:**
- Import playlist with at least 4 tracks
- Start playback and let first track finish (or skip)
- Verify left disk shows track 1, right disk shows track 2
- When track 1 finishes, verify right disk plays track 2, left disk shows track 3
- When track 2 finishes, verify left disk plays track 3, right disk shows track 4

**User Test Prompt:**
> "Import a playlist and start playback. Watch as the first track finishes. Confirm the right vinyl disk starts playing the second track, and the left disk shows the third track in queue."

---

### Task 4: Update Frontend Playback Controls
- In `frontend/src/pages/Index.tsx`, update playback control handlers
- `handlePlayPause()` → call `PUT /api/v1/sessions/{session_id}/playback`
- `handleSkip()` → increment track index and update playback state
- `handlePrevious()` → decrement track index and update playback state
- Update `activeDeck` based on backend response

**Manual Test Step:**
- Import playlist
- Click play → verify playback starts and state updates
- Click skip → verify next track plays and vinyl disks alternate
- Click previous → verify previous track plays and vinyl disks alternate
- Click pause → verify playback stops

**User Test Prompt:**
> "Import a playlist and test all playback controls. Click play, skip forward, skip backward, and pause. Confirm each control works correctly and the vinyl disks alternate properly."

---

### Task 5: Implement Playback State Persistence
- In `frontend/src/pages/Index.tsx`, add effect to restore playback state on mount
- Call `GET /api/v1/sessions/{session_id}/playback`
- Restore `currentTrackIndex`, `isPlaying`, `activeDeck`
- Update UI to reflect restored state

**Manual Test Step:**
- Import playlist and start playback
- Skip to track 3
- Refresh page
- Verify playback state is restored (track 3 is current, correct deck is active)

**User Test Prompt:**
> "Import a playlist, skip to the third track, then refresh the page. Confirm the third track is still the current track and the correct vinyl disk is active."

---

### Task 6: Update "Now Playing" Card in Playlist Panel
- In `frontend/src/components/PlaylistPanel.tsx`, ensure `currentTrackId` prop is used
- Highlight current track in playlist
- Display "Now Playing" card at top of playlist panel
- Update card when track changes

**Manual Test Step:**
- Import playlist and start playback
- Verify "Now Playing" card shows current track
- Skip to next track
- Verify "Now Playing" card updates to new track
- Verify current track is highlighted in playlist

**User Test Prompt:**
> "Import a playlist and start playback. Confirm the 'Now Playing' card shows the current track. Skip to the next track and verify the card updates."

---

### Task 7: Implement Session Clear Endpoint
- In `backend/routers/sessions.py`, implement `DELETE /api/v1/sessions/{session_id}`
- Delete session document from MongoDB Atlas
- Return success response

**Manual Test Step:**
- Import playlist
- Click clear/reset button in frontend (if available)
- Verify session is deleted from database
- Verify frontend returns to empty state

**User Test Prompt:**
> "Import a playlist, then clear the session. Confirm the frontend returns to the empty state and the session is removed from the database."

---

**Definition of Done:**
- Playback state endpoints work correctly
- Vinyl deck alternation logic functions as expected
- Music player controls (play/pause/skip/previous) work
- "Now Playing" card updates correctly
- Playback state persists across page refreshes
- Session clear functionality works
- All task tests pass

**Post-Sprint:**
- Commit all changes with message: "S3: Playback state management complete"
- Push to `main` branch

---

## ✅ STYLE & COMPLIANCE CHECKS

- ✅ Bullets only — no tables or prose
- ✅ Only visible frontend features included
- ✅ Minimal APIs/models aligned with UI
- ✅ MongoDB Atlas only (no local instance)
- ✅ Python 3.13 runtime specified
- ✅ Each task has Manual Test Step and User Test Prompt
- ✅ After all tests pass → commit & push to `main`
- ✅ FastAPI with async Motor and Pydantic v2
- ✅ No Docker deployment
- ✅ API base path: `/api/v1/*`
- ✅ Single-branch Git workflow (`main` only)

---

## 🎯 FINAL NOTES

**Development Order:**
1. Complete S0 (environment setup)
2. Complete S1 (Spotify integration)
3. Complete S2 (playlist management)
4. Complete S3 (playback state)

**Testing Approach:**
- Test each task immediately after implementation
- Use frontend UI for all manual tests
- Fix any failures before moving to next task
-
---
title: Product Requirements Document
app: djae
created: 2025-10-30T13:47:40.702Z
version: 1
source: Deep Mode PRD Generation
---

# PRODUCT REQUIREMENTS DOCUMENT

## EXECUTIVE SUMMARY

**Product Vision:** A web-based DJ simulator that transforms Spotify playlists into an interactive live DJ set experience, allowing users to visualize and control their music as if performing a live set.

**Core Purpose:** Enables music enthusiasts to experience their Spotify playlists in a DJ-style interface with visual feedback, queue management, and playlist reordering capabilities.

**Target Users:** Music enthusiasts, aspiring DJs, and Spotify users who want an engaging way to experience their playlists.

**Key Features:**
- Spotify playlist import via URL (User-Generated Content)
- Live DJ controller visualization showing current and upcoming tracks (System Data)
- Music playback controls (Configuration/System)
- Interactive playlist management with drag-and-drop reordering (User-Generated Content)

**Complexity Assessment:** Simple
- **State Management:** Local (client-side playlist state and playback controls)
- **External Integrations:** 1 (Spotify API - reduces complexity)
- **Business Logic:** Simple (playlist parsing, playback control, reordering)
- **Data Synchronization:** None (local state only)

**MVP Success Metrics:**
- Users can successfully import a Spotify playlist URL
- DJ controller displays current and next tracks accurately
- Music playback controls function correctly
- Users can reorder playlist tracks via drag-and-drop
- Interface matches the provided design screenshot

---

## 1. USERS & PERSONAS

**Primary Persona:**
- **Name:** Alex the Music Enthusiast
- **Context:** Enjoys curating Spotify playlists and wants a more engaging way to experience them
- **Goals:** Transform static playlist listening into an interactive DJ-style experience
- **Needs:** 
  - Easy playlist import from Spotify
  - Visual feedback showing what's playing and coming up next
  - Ability to reorder songs on the fly
  - Authentic DJ controller aesthetic

**Secondary Personas:**
- **Name:** Jordan the Aspiring DJ
- **Context:** Learning DJ skills and wants to practice set planning
- **Goals:** Visualize how tracks flow together in a set
- **Needs:**
  - Clear view of track progression
  - Easy track reordering to experiment with flow
  - Professional-looking DJ interface

---

## 2. FUNCTIONAL REQUIREMENTS

### 2.1 User-Requested Features (All are Priority 0)

**FR-001: Spotify Playlist Import**
- **Description:** Users can input a Spotify playlist URL to load playlist data into the DJ simulator
- **Entity Type:** User-Generated Content (imported playlist becomes user's session data)
- **User Benefit:** Quick access to existing Spotify playlists without manual track entry
- **Primary User:** Alex the Music Enthusiast
- **Lifecycle Operations:**
  - **Create:** User pastes Spotify playlist URL into input field and submits
  - **View:** System displays imported playlist metadata and track list
  - **Edit:** User can import a different playlist (replaces current session)
  - **Delete:** User can clear current playlist and start fresh
  - **List/Search:** Not applicable (single active playlist per session)
  - **Additional:** Validate URL format, handle import errors gracefully
- **Acceptance Criteria:**
  - [ ] Given a valid Spotify playlist URL, when user submits it, then playlist metadata and tracks are displayed
  - [ ] Given an invalid URL, when user submits it, then clear error message is shown
  - [ ] Given a playlist is loaded, when user imports a new playlist, then previous playlist is replaced
  - [ ] Given a playlist is loaded, when user clicks clear/reset, then playlist is removed and interface returns to initial state
  - [ ] System extracts playlist title, track count, and track details from Spotify data

**FR-002: DJ Controller Visualization**
- **Description:** Visual representation of a DJ controller showing the currently playing track and upcoming tracks in the queue
- **Entity Type:** System Data (derived from playlist state)
- **User Benefit:** Provides authentic DJ experience with clear visibility of track progression
- **Primary User:** Alex the Music Enthusiast, Jordan the Aspiring DJ
- **Lifecycle Operations:**
  - **View:** Continuously displays current track and next 2-3 tracks in queue
  - **Additional:** Updates automatically as playback progresses
- **Acceptance Criteria:**
  - [ ] Given a playlist is loaded, when playback starts, then current track is displayed prominently in DJ controller
  - [ ] Given a track is playing, when it ends, then next track moves to "now playing" position
  - [ ] DJ controller shows track title, artist, and album art for current and upcoming tracks
  - [ ] Visual design matches the provided screenshot aesthetic
  - [ ] Queue updates in real-time as tracks progress

**FR-003: Music Playback Controls**
- **Description:** Standard music player controls (play, pause, skip, progress bar, volume) for controlling playback
- **Entity Type:** Configuration/System
- **User Benefit:** Full control over music playback experience
- **Primary User:** All personas
- **Lifecycle Operations:**
  - **View:** Always visible playback controls
  - **Edit:** User can adjust playback state, position, and volume
  - **Additional:** Persist volume preference, show current playback time and duration
- **Acceptance Criteria:**
  - [ ] Given a playlist is loaded, when user clicks play, then first track begins playing
  - [ ] Given a track is playing, when user clicks pause, then playback pauses
  - [ ] Given a track is playing, when user clicks skip, then next track begins playing
  - [ ] Given a track is playing, when user drags progress bar, then playback jumps to selected position
  - [ ] Given any playback state, when user adjusts volume, then audio level changes accordingly
  - [ ] Progress bar shows current position and total duration
  - [ ] Controls are positioned beneath the DJ controller section per screenshot

**FR-004: Interactive Playlist Management**
- **Description:** Display of all playlist tracks with metadata, allowing users to reorder tracks via drag-and-drop
- **Entity Type:** User-Generated Content (user's session playlist order)
- **User Benefit:** Customize track order to create desired flow and experience
- **Primary User:** Alex the Music Enthusiast, Jordan the Aspiring DJ
- **Lifecycle Operations:**
  - **View:** Display complete track list with title, artist, duration, and album art
  - **Edit:** Drag-and-drop to reorder tracks in playlist
  - **Additional:** Show playlist title and metadata (track count, total duration)
- **Acceptance Criteria:**
  - [ ] Given a playlist is loaded, when viewing playlist section, then all tracks are displayed in order
  - [ ] Given the playlist is displayed, when user drags a track, then visual feedback indicates dragging state
  - [ ] Given a track is being dragged, when user drops it in new position, then playlist order updates
  - [ ] Given playlist order changes, when playback reaches reordered section, then tracks play in new order
  - [ ] Playlist section shows playlist title at top
  - [ ] Playlist section shows metadata (total tracks, total duration)
  - [ ] Each track displays: title, artist, duration, album art thumbnail
  - [ ] Playlist section is positioned to the right of main controller area per screenshot

### 2.2 Essential Market Features

**FR-005: Application Header**
- **Description:** Branded header with logo and Spotify URL input field
- **Entity Type:** Configuration/System
- **User Benefit:** Clear branding and easy access to playlist import
- **Primary User:** All personas
- **Lifecycle Operations:**
  - **View:** Persistent header across all application states
- **Acceptance Criteria:**
  - [ ] Given user opens application, when page loads, then header with logo is displayed
  - [ ] Given user is on any screen, when looking at header, then Spotify URL input field is visible
  - [ ] Header design matches provided screenshot
  - [ ] Logo is clearly visible and appropriately sized

**FR-006: Mock Data Mode**
- **Description:** Application functions with mock playlist data before Spotify integration is complete
- **Entity Type:** System Data
- **User Benefit:** Allows testing and demonstration of all features without Spotify API
- **Primary User:** Development and testing
- **Lifecycle Operations:**
  - **View:** Mock playlist automatically loads on application start
  - **Additional:** Mock data includes realistic track information
- **Acceptance Criteria:**
  - [ ] Given application starts without Spotify URL, when page loads, then mock playlist is displayed
  - [ ] Mock data includes at least 10 tracks with titles, artists, durations, and placeholder album art
  - [ ] All features (playback, reordering, DJ controller) work with mock data
  - [ ] Mock playlist has realistic metadata (title, track count, duration)

---

## 3. USER WORKFLOWS

### 3.1 Primary Workflow: DJ Set Experience

**Trigger:** User wants to experience their Spotify playlist as a DJ set

**Outcome:** User successfully imports playlist and controls playback with DJ-style interface

**Steps:**
1. User opens DJ Simulator web application
2. System displays header with logo and Spotify URL input field
3. User pastes Spotify playlist URL into input field
4. User clicks submit/import button
5. System validates URL and fetches playlist data from Spotify
6. System displays playlist metadata in right panel
7. System populates DJ controller with first track as "now playing" and next tracks in queue
8. System displays all tracks in playlist panel on right
9. User clicks play button in music player controls
10. System begins playing first track
11. System updates DJ controller to show current track prominently
12. User sees progress bar advancing and can adjust playback
13. User can skip tracks, pause, or adjust volume as desired
14. System automatically advances to next track when current track ends
15. DJ controller updates to show new current track and queue

**Alternative Paths:**
- If invalid Spotify URL provided, system shows error message and prompts for valid URL
- If Spotify API unavailable, system falls back to mock data mode
- If user imports new playlist while one is playing, system stops current playback and loads new playlist

### 3.2 Entity Management Workflows

**Playlist Session Management Workflow**

**Import Playlist:**
1. User navigates to application (header always visible)
2. User clicks into Spotify URL input field
3. User pastes playlist URL
4. User presses Enter or clicks import button
5. System validates URL format
6. System fetches playlist data
7. System displays success confirmation and loads playlist

**Clear/Reset Playlist:**
1. User clicks clear/reset button (if provided) or imports new URL
2. System stops current playback if active
3. System clears current playlist data
4. System returns to initial state or loads new playlist

**Reorder Playlist Tracks:**
1. User views playlist in right panel
2. User clicks and holds on a track
3. System provides visual feedback (track becomes draggable)
4. User drags track to desired position
5. System shows drop indicator between tracks
6. User releases mouse to drop track
7. System updates playlist order
8. System confirms new order visually
9. Playback queue updates to reflect new order

**Control Playback:**
1. User views music player controls beneath DJ controller
2. User clicks play button
3. System begins playing current track
4. User can click pause to pause playback
5. User can click skip to advance to next track
6. User can drag progress bar to seek within track
7. User can adjust volume slider
8. System updates DJ controller and progress bar in real-time

---

## 4. BUSINESS RULES

### Entity Lifecycle Rules:

**Playlist Session (User-Generated Content):**
- **Who can create:** Any user visiting the application
- **Who can view:** The user who imported the playlist (single-user session)
- **Who can edit:** The user can reorder tracks and import new playlists
- **Who can delete:** The user can clear the current session
- **What happens on deletion:** Session data is cleared, application returns to initial state
- **Related data handling:** Clearing playlist also resets playback state

**Playback State (Configuration/System):**
- **Who can create:** System creates on playlist load
- **Who can view:** Current user
- **Who can edit:** User controls playback through player controls
- **Who can delete:** Cleared when playlist is cleared
- **What happens on deletion:** Playback stops, controls reset
- **Related data handling:** Playback state tied to current playlist session

### Access Control:
- Single-user application (no authentication required for MVP)
- Each browser session is independent
- No data persistence between sessions

### Data Rules:
- **Spotify URL Validation:**
  - Must be valid Spotify playlist URL format
  - Must be accessible/public playlist
- **Track Data:**
  - Track title: Required
  - Artist name: Required
  - Duration: Required
  - Album art: Optional (use placeholder if missing)
- **Playlist Metadata:**
  - Playlist title: Required
  - Track count: Calculated from track list
  - Total duration: Calculated from track durations
- **Playback State:**
  - Current track index: 0 to (track count - 1)
  - Playback position: 0 to track duration
  - Volume: 0 to 100
  - Playing state: boolean (playing/paused)

### Process Rules:
- **Playlist Import:**
  - Validate URL before attempting fetch
  - Show loading state during fetch
  - Handle errors gracefully with user-friendly messages
- **Playback Progression:**
  - Automatically advance to next track when current track ends
  - Update DJ controller queue as tracks progress
  - Stop playback when reaching end of playlist
- **Track Reordering:**
  - Allow drag-and-drop only within playlist panel
  - Update playback queue immediately when order changes
  - Maintain current playback position if reordering doesn't affect currently playing track
- **Mock Data Mode:**
  - Use mock data if no Spotify URL provided
  - Allow all features to function with mock data
  - Clearly indicate when using mock data vs. real Spotify data

---

## 5. DATA REQUIREMENTS

### Core Entities:

**User Session**
- **Type:** System/Configuration
- **Attributes:** session_id, created_timestamp, current_playlist_id
- **Relationships:** has one Playlist
- **Lifecycle:** Created on page load, cleared on page close or reset
- **Retention:** Session-only (no persistence)

**Playlist**
- **Type:** User-Generated Content (imported from Spotify)
- **Attributes:** 
  - playlist_id (from Spotify)
  - title
  - track_count (calculated)
  - total_duration (calculated)
  - source_url (Spotify URL)
  - tracks (array of Track objects)
  - custom_order (array of track indices if reordered)
  - created_timestamp
- **Relationships:** belongs to User Session, has many Tracks
- **Lifecycle:** Created on import, can be replaced by new import, cleared on reset
- **Retention:** Session-only (no persistence)

**Track**
- **Type:** System Data (read-only from Spotify)
- **Attributes:**
  - track_id (from Spotify)
  - title
  - artist
  - album
  - duration (in seconds)
  - album_art_url
  - spotify_uri
  - position_in_playlist (original order)
- **Relationships:** belongs to Playlist
- **Lifecycle:** View/Export only (read from Spotify, displayed in UI)
- **Retention:** Session-only (no persistence)

**Playback State**
- **Type:** Configuration/System
- **Attributes:**
  - current_track_index
  - playback_position (in seconds)
  - is_playing (boolean)
  - volume (0-100)
  - queue (array of upcoming track indices)
- **Relationships:** belongs to User Session, references current Playlist
- **Lifecycle:** Created when playlist loads, updated during playback, cleared on reset
- **Retention:** Session-only (no persistence)

---

## 6. INTEGRATION REQUIREMENTS

### External Systems:

**Spotify Web API**
- **Purpose:** Fetch playlist metadata and track information from Spotify playlist URLs
- **Data Exchange:** 
  - **Input:** Spotify playlist URL or playlist ID
  - **Output:** Playlist object containing title, tracks array with track metadata (title, artist, album, duration, album art, Spotify URI)
- **Frequency:** On-demand when user imports a playlist URL
- **Authentication:** Requires Spotify API credentials (Client ID/Secret) for application
- **Error Handling:** 
  - Invalid URL: Show user-friendly error message
  - API unavailable: Fall back to mock data mode
  - Rate limiting: Queue requests or show appropriate message
  - Private playlist: Inform user playlist must be public

**Mock Data Service (Internal)**
- **Purpose:** Provide realistic sample playlist data for testing and demonstration
- **Data Exchange:** Returns hardcoded playlist object matching Spotify API structure
- **Frequency:** On application load if no Spotify URL provided, or as fallback
- **Format:** Same structure as Spotify API response for consistency

---

## 7. FUNCTIONAL VIEWS/AREAS

### Primary Views:

**Main Application View (Single Page)**
The entire application is a single-page interface with distinct sections:

**Header Section:**
-
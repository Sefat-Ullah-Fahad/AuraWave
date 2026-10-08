# AuraWave — Personal YouTube Music Player

A production-ready, fully responsive **Personal Music Player Web Application** built with modern React, Tailwind CSS, GSAP, Express, MongoDB, Better Auth session management, and the official YouTube IFrame Player API.

Designed primarily for **mobile users** with bottom navigation and a dockable mini-player that expands into a full-screen player, while also providing a rich desktop interface with a persistent player bar and sidebar navigation.

---

## Features

- **Strict User Data Isolation**: Every song, playlist, playback history entry, and favorite is scoped directly to `session.user.id`. User A can never view or modify User B's data.
- **Official YouTube Playback**: Uses the official YouTube IFrame Player API. No scraping, downloading, or audio ripping. 100% compliant with YouTube terms of service.
- **Smart URL Metadata Extraction**: Supports standard YouTube links (`youtube.com/watch?v=...`, `youtu.be/...`, shorts). Uses zero-quota official YouTube oEmbed for instant title and thumbnail previews, with optional YouTube Data API v3 support for duration metadata.
- **Persistent Global Audio**: Audio playback continues uninterrupted while navigating across Home, Library, Playlists, Favorites, History, and Settings.
- **Mobile-First Experience**:
  - Floating mini-player docked above the bottom navigation bar.
  - Smooth GSAP-animated full-screen expanded player with album glow, scrubbable progress bar, and volume controls.
  - Safe-area inset handling for notch and mobile home indicators.
  - Mobile bottom navigation bar.
- **Desktop Interface**: Responsive left sidebar with quick playlist shortcuts, greeting, universal search, and persistent bottom player bar.
- **Queue Management**: Auto-plays the next song when current finishes. Reorder songs up and down, add to queue, remove from queue, or clear the queue.
- **Playback Modes**:
  - Sequential mode
  - Shuffle mode (unrepeated random order)
  - Repeat mode (Repeat Off, Repeat One song, Repeat All in queue)
- **Playlists**: Create custom playlists (e.g. Chill, Workout, Coding, Bangla Songs), rename, delete, reorder tracks, play all, or shuffle.
- **Playback History & Favorites**: Tracks play count and last played timestamp with a "Clear History" button. Dedicated Favorites view with "Play All" and "Shuffle".
- **MediaSession API**: Integrates with mobile lock-screen and browser media controls (title, artwork, play/pause/skip).
- **Dual Database Engine**: Seamlessly connects to MongoDB Atlas when `MONGODB_URI` is configured, or automatically uses a zero-config persistent local JSON storage engine.

---

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Start development server
npm run dev
```

The application will be running at [http://localhost:3000](http://localhost:3000).

---

## Environment Variables Documentation

| Variable | Description | Where to Get | Example Format | Status |
| :--- | :--- | :--- | :--- | :--- |
| `PORT` | Local port for server | Standard port | `3000` | Optional (default: `3000`) |
| `APP_URL` | Application root URL | Your hosting domain or localhost | `http://localhost:3000` | Mandatory |
| `NEXT_PUBLIC_APP_URL` | Public frontend URL | Your hosting domain or localhost | `http://localhost:3000` | Mandatory |
| `MONGODB_URI` | MongoDB connection string | MongoDB Atlas or local MongoDB | `mongodb+srv://<user>:<password>@cluster0.mongodb.net/aurawave?retryWrites=true&w=majority` | Optional (falls back to persistent local storage) |
| `BETTER_AUTH_SECRET` | Session encryption secret key | Generate with `openssl rand -base64 32` | `e837f48b1...` (32+ random characters) | Mandatory |
| `BETTER_AUTH_URL` | Better Auth endpoint URL | Server address | `http://localhost:3000` | Mandatory |
| `YOUTUBE_API_KEY` | Google YouTube Data API v3 key | Google Cloud Console | `AIzaSy...` | Optional (zero-quota oEmbed used automatically) |

---

## MongoDB Setup Guide

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a new free cluster (M0 sandbox).
3. Under **Database Access**, create a database user with read/write permissions.
4. Under **Network Access**, add IP Address `0.0.0.0/0` (Allow access from anywhere).
5. Click **Connect** → **Drivers** (Node.js) and copy your connection string.
6. Replace `<password>` with your user's password and paste into `.env`:
   ```env
   MONGODB_URI="mongodb+srv://youruser:yourpassword@cluster0.mongodb.net/aurawave?retryWrites=true&w=majority"
   ```

*Note:* If `MONGODB_URI` is left blank, AuraWave automatically activates its persistent local JSON storage in `data/db.json` so you can test immediately without setting up a remote database.

---

## YouTube Data API Setup Guide

AuraWave already features automatic, zero-quota metadata extraction using YouTube's official oEmbed API. If you wish to use the YouTube Data API v3 for high-precision durations:

1. Visit the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project and navigate to **APIs & Services** → **Library**.
3. Search for **YouTube Data API v3** and click **Enable**.
4. Go to **Credentials** → **Create Credentials** → **API key**.
5. Copy the generated key and set it in your `.env`:
   ```env
   YOUTUBE_API_KEY="AIzaSyYourGeneratedApiKey"
   ```

---

## Authentication & Security

- **Session Security**: Sessions are cryptographically signed and stored in HTTP-only, SameSite cookies and backed by bearer token headers for maximum compatibility across mobile web views.
- **Password Security**: Passwords are hashed using `bcrypt` with 10 salt rounds.
- **Query Level Scoping**: All database operations (`find`, `insertOne`, `updateOne`, `deleteOne`) inject `userId: req.user._id` verified directly from the session token. Client-provided `userId` fields in request bodies are ignored.

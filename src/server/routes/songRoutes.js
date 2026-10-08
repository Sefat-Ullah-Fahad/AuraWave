import { Router } from 'express';
import { getCollection } from '../db.js';
import { requireAuth } from '../auth.js';
import { extractYouTubeId, getYouTubeMetadata } from '../youtube.js';

const router = Router();

// Apply requireAuth to all song endpoints
router.use(requireAuth);

/**
 * GET /api/songs
 * Get all songs for the authenticated user only
 */
router.get('/', async (req, res) => {
  try {
    const { q, favorite } = req.query;
    const songs = getCollection('songs');

    const filter = { userId: req.user._id };
    if (favorite === 'true') {
      filter.favorite = true;
    }

    const cursor = await songs.find(filter);
    let list = await cursor.sort({ createdAt: -1 }).toArray();

    // Client/server search filtering
    if (q && typeof q === 'string' && q.trim()) {
      const term = q.trim().toLowerCase();
      list = list.filter(
        song =>
          (song.title && song.title.toLowerCase().includes(term)) ||
          (song.channelName && song.channelName.toLowerCase().includes(term))
      );
    }

    return res.json({ songs: list });
  } catch (err) {
    console.error('Error fetching songs:', err);
    return res.status(500).json({ error: 'Failed to retrieve songs.' });
  }
});

/**
 * POST /api/songs/preview
 * Quick preview of YouTube URL metadata before saving
 */
router.post('/preview', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL or Video ID format.' });
    }

    const metadata = await getYouTubeMetadata(videoId);
    return res.json({ preview: metadata });
  } catch (err) {
    console.error('Error previewing YouTube URL:', err);
    return res.status(400).json({ error: err.message || 'Could not fetch video info.' });
  }
});

/**
 * POST /api/songs
 * Add a new YouTube song to user's library
 */
router.post('/', async (req, res) => {
  try {
    const { url, title: customTitle } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required.' });
    }

    const videoId = extractYouTubeId(url);
    if (!videoId) {
      return res.status(400).json({
        error: 'Invalid YouTube link. Please paste a standard youtube.com or youtu.be link.',
      });
    }

    const songs = getCollection('songs');

    // Strict user isolation duplicate check
    const existing = await songs.findOne({
      userId: req.user._id,
      youtubeVideoId: videoId,
    });

    if (existing) {
      return res.status(409).json({
        error: 'This song is already in your library.',
        song: existing,
      });
    }

    // Fetch official metadata
    const metadata = await getYouTubeMetadata(videoId);

    const newSong = {
      userId: req.user._id,
      youtubeVideoId: videoId,
      youtubeUrl: metadata.youtubeUrl,
      title: customTitle?.trim() || metadata.title,
      thumbnail: metadata.thumbnail,
      channelName: metadata.channelName,
      duration: metadata.duration,
      favorite: false,
      playCount: 0,
      lastPlayedAt: null,
      createdAt: new Date().toISOString(),
    };

    const result = await songs.insertOne(newSong);
    newSong._id = result.insertedId;

    return res.status(201).json({
      success: true,
      message: 'Song added successfully to your library.',
      song: newSong,
    });
  } catch (err) {
    console.error('Error adding song:', err);
    return res.status(500).json({
      error: err.message || 'Failed to add YouTube song.',
    });
  }
});

/**
 * PATCH /api/songs/:id/favorite
 * Toggle favorite state for a song
 */
router.patch('/:id/favorite', async (req, res) => {
  try {
    const { id } = req.params;
    const songs = getCollection('songs');

    const song = await songs.findOne({ _id: id, userId: req.user._id });
    if (!song) {
      return res.status(404).json({ error: 'Song not found in your library.' });
    }

    const newFavorite = !song.favorite;
    await songs.updateOne(
      { _id: id, userId: req.user._id },
      { $set: { favorite: newFavorite } }
    );

    return res.json({
      success: true,
      favorite: newFavorite,
      message: newFavorite ? 'Added to favorites' : 'Removed from favorites',
    });
  } catch (err) {
    console.error('Error toggling favorite:', err);
    return res.status(500).json({ error: 'Failed to update favorite status.' });
  }
});

/**
 * DELETE /api/songs/:id
 * Remove song from user's library and any of their playlists
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const songs = getCollection('songs');

    const result = await songs.deleteOne({ _id: id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Song not found in your library.' });
    }

    // Clean up from user's playlists
    const playlists = getCollection('playlists');
    const userPlaylists = await (await playlists.find({ userId: req.user._id })).toArray();
    for (const pl of userPlaylists) {
      if (pl.songs && pl.songs.includes(id)) {
        const filtered = pl.songs.filter(sid => sid !== id);
        await playlists.updateOne({ _id: pl._id, userId: req.user._id }, { $set: { songs: filtered } });
      }
    }

    // Clean up from user's history
    const history = getCollection('history');
    await history.deleteMany({ songId: id, userId: req.user._id });

    return res.json({ success: true, message: 'Song removed from library.' });
  } catch (err) {
    console.error('Error deleting song:', err);
    return res.status(500).json({ error: 'Failed to delete song.' });
  }
});

export default router;

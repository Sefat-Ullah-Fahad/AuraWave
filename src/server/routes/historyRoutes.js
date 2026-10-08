import { Router } from 'express';
import { getCollection } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Apply requireAuth to all history endpoints
router.use(requireAuth);

/**
 * GET /api/history
 * Get recently played songs for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const history = getCollection('history');
    const songs = getCollection('songs');

    const recentEntries = await (
      await history.find({ userId: req.user._id })
    ).sort({ playedAt: -1 }).toArray();

    // Get all user songs
    const userSongs = await (
      await songs.find({ userId: req.user._id })
    ).toArray();
    const songsMap = new Map(userSongs.map(s => [s._id.toString(), s]));

    // De-duplicate recent entries by song ID (keep most recent)
    const seenSongIds = new Set();
    const recentSongs = [];

    for (const entry of recentEntries) {
      const songId = entry.songId?.toString();
      if (!seenSongIds.has(songId) && songsMap.has(songId)) {
        seenSongIds.add(songId);
        const song = songsMap.get(songId);
        recentSongs.push({
          ...song,
          playedAt: entry.playedAt,
          historyId: entry._id,
        });
      }
    }

    return res.json({ history: recentSongs.slice(0, 50) });
  } catch (err) {
    console.error('Error fetching history:', err);
    return res.status(500).json({ error: 'Failed to retrieve playback history.' });
  }
});

/**
 * POST /api/history
 * Record a song play event
 */
router.post('/', async (req, res) => {
  try {
    const { songId } = req.body;
    if (!songId) {
      return res.status(400).json({ error: 'songId is required.' });
    }

    const songs = getCollection('songs');
    const history = getCollection('history');

    const song = await songs.findOne({ _id: songId, userId: req.user._id });
    if (!song) {
      return res.status(404).json({ error: 'Song not found in user library.' });
    }

    const now = new Date().toISOString();

    // Add history entry
    await history.insertOne({
      userId: req.user._id,
      songId,
      playedAt: now,
    });

    // Update play count and lastPlayedAt on song
    await songs.updateOne(
      { _id: songId, userId: req.user._id },
      {
        $inc: { playCount: 1 },
        $set: { lastPlayedAt: now },
      }
    );

    return res.json({ success: true, playedAt: now });
  } catch (err) {
    console.error('Error recording play history:', err);
    return res.status(500).json({ error: err.message || 'Failed to record playback history.' });
  }
});

/**
 * DELETE /api/history
 * Clear playback history for authenticated user
 */
router.delete('/', async (req, res) => {
  try {
    const history = getCollection('history');
    await history.deleteMany({ userId: req.user._id });

    return res.json({ success: true, message: 'Playback history cleared successfully.' });
  } catch (err) {
    console.error('Error clearing history:', err);
    return res.status(500).json({ error: err.message || 'Failed to clear playback history.' });
  }
});

export default router;

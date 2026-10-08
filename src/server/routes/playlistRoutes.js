import { Router } from 'express';
import { getCollection } from '../db.js';
import { requireAuth } from '../auth.js';

const router = Router();

// Apply requireAuth to all playlist endpoints
router.use(requireAuth);

/**
 * GET /api/playlists
 * Get all playlists for current user with populated song details
 */
router.get('/', async (req, res) => {
  try {
    const playlists = getCollection('playlists');
    const songs = getCollection('songs');

    const userPlaylists = await (
      await playlists.find({ userId: req.user._id })
    ).sort({ createdAt: -1 }).toArray();

    // Hydrate songs for each playlist
    const userSongsList = await (
      await songs.find({ userId: req.user._id })
    ).toArray();
    const songsMap = new Map(userSongsList.map(s => [s._id.toString(), s]));

    const populatedPlaylists = userPlaylists.map(pl => {
      const songIds = pl.songs || [];
      const populatedSongs = songIds
        .map(id => songsMap.get(id?.toString()))
        .filter(Boolean);

      return {
        ...pl,
        songDetails: populatedSongs,
        songCount: populatedSongs.length,
      };
    });

    return res.json({ playlists: populatedPlaylists });
  } catch (err) {
    console.error('Error fetching playlists:', err);
    return res.status(500).json({ error: err.message || 'Failed to retrieve playlists.' });
  }
});

/**
 * POST /api/playlists
 * Create a new playlist
 */
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name is required.' });
    }

    const playlists = getCollection('playlists');

    const newPlaylist = {
      userId: req.user._id,
      name: name.trim(),
      description: (description || '').trim(),
      songs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await playlists.insertOne(newPlaylist);
    newPlaylist._id = result.insertedId;
    newPlaylist.songDetails = [];
    newPlaylist.songCount = 0;

    return res.status(201).json({
      success: true,
      message: 'Playlist created successfully.',
      playlist: newPlaylist,
    });
  } catch (err) {
    console.error('Error creating playlist:', err);
    return res.status(500).json({ error: err.message || 'Failed to create playlist.' });
  }
});

/**
 * PUT /api/playlists/:id
 * Rename or update playlist description
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Playlist name cannot be empty.' });
    }

    const playlists = getCollection('playlists');
    const existing = await playlists.findOne({ _id: id, userId: req.user._id });
    if (!existing) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    await playlists.updateOne(
      { _id: id, userId: req.user._id },
      {
        $set: {
          name: name.trim(),
          description: description !== undefined ? description.trim() : existing.description,
        },
      }
    );

    return res.json({
      success: true,
      message: 'Playlist updated successfully.',
    });
  } catch (err) {
    console.error('Error updating playlist:', err);
    return res.status(500).json({ error: err.message || 'Failed to update playlist.' });
  }
});

/**
 * DELETE /api/playlists/:id
 * Delete playlist
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const playlists = getCollection('playlists');

    const result = await playlists.deleteOne({ _id: id, userId: req.user._id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    return res.json({ success: true, message: 'Playlist deleted.' });
  } catch (err) {
    console.error('Error deleting playlist:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete playlist.' });
  }
});

/**
 * POST /api/playlists/:id/songs
 * Add song to playlist
 */
router.post('/:id/songs', async (req, res) => {
  try {
    const { id } = req.params;
    const { songId } = req.body;

    if (!songId) {
      return res.status(400).json({ error: 'Song ID is required.' });
    }

    const playlists = getCollection('playlists');
    const playlist = await playlists.findOne({ _id: id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    const songs = getCollection('songs');
    const song = await songs.findOne({ _id: songId, userId: req.user._id });
    if (!song) {
      return res.status(404).json({ error: 'Song not found in your library.' });
    }

    const currentSongs = playlist.songs || [];
    if (currentSongs.includes(songId)) {
      return res.status(409).json({ error: 'Song is already in this playlist.' });
    }

    await playlists.updateOne(
      { _id: id, userId: req.user._id },
      { $push: { songs: songId } }
    );

    return res.json({ success: true, message: 'Added to playlist.' });
  } catch (err) {
    console.error('Error adding song to playlist:', err);
    return res.status(500).json({ error: 'Failed to add song to playlist.' });
  }
});

/**
 * DELETE /api/playlists/:id/songs/:songId
 * Remove song from playlist
 */
router.delete('/:id/songs/:songId', async (req, res) => {
  try {
    const { id, songId } = req.params;
    const playlists = getCollection('playlists');

    const playlist = await playlists.findOne({ _id: id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    const currentSongs = playlist.songs || [];
    const updatedSongs = currentSongs.filter(sid => sid !== songId);

    await playlists.updateOne(
      { _id: id, userId: req.user._id },
      { $set: { songs: updatedSongs } }
    );

    return res.json({ success: true, message: 'Song removed from playlist.' });
  } catch (err) {
    console.error('Error removing song from playlist:', err);
    return res.status(500).json({ error: 'Failed to remove song from playlist.' });
  }
});

/**
 * PUT /api/playlists/:id/reorder
 * Reorder songs in playlist
 */
router.put('/:id/reorder', async (req, res) => {
  try {
    const { id } = req.params;
    const { songIds } = req.body;

    if (!Array.isArray(songIds)) {
      return res.status(400).json({ error: 'songIds array is required.' });
    }

    const playlists = getCollection('playlists');
    const playlist = await playlists.findOne({ _id: id, userId: req.user._id });
    if (!playlist) {
      return res.status(404).json({ error: 'Playlist not found.' });
    }

    await playlists.updateOne(
      { _id: id, userId: req.user._id },
      { $set: { songs: songIds } }
    );

    return res.json({ success: true, message: 'Playlist order updated.' });
  } catch (err) {
    console.error('Error reordering playlist:', err);
    return res.status(500).json({ error: 'Failed to reorder playlist.' });
  }
});

export default router;

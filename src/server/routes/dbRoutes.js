import { Router } from 'express';
import { getDbStatus, updateMongoUri } from '../db.js';

const router = Router();

/**
 * GET /api/db/status
 * Check if direct MongoDB connection is established
 */
router.get('/status', (req, res) => {
  return res.json(getDbStatus());
});

/**
 * POST /api/db/connect
 * Test and connect directly to MongoDB Atlas with the provided URI
 */
router.post('/connect', async (req, res) => {
  try {
    const { uri } = req.body;
    if (!uri || !uri.trim()) {
      return res.status(400).json({ error: 'Please enter a valid MongoDB connection string.' });
    }

    const cleanUri = uri.trim();
    if (!cleanUri.startsWith('mongodb://') && !cleanUri.startsWith('mongodb+srv://')) {
      return res.status(400).json({
        error: 'Invalid connection string format. It must start with mongodb+srv:// or mongodb://',
      });
    }

    const result = await updateMongoUri(cleanUri);

    return res.json({
      success: true,
      message: `Connected successfully to MongoDB Atlas database "${result.dbName}"!`,
      status: getDbStatus(),
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    return res.status(400).json({
      error: `Could not connect to MongoDB: ${err.message}. Please verify your username, password, and IP whitelist in Atlas.`,
    });
  }
});

export default router;

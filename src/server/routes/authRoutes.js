import { Router } from 'express';
import { getCollection, getDbStatus } from '../db.js';
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getSessionUser,
  extractToken,
  requireAuth,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_MS,
} from '../auth.js';

const router = Router();

// Configure cookie options
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: SESSION_DURATION_MS,
  path: '/',
};

/**
 * Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const emailClean = email.trim().toLowerCase();
    const users = getCollection('users');

    const existingUser = await users.findOne({ email: emailClean });
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const hashedPassword = await hashPassword(password);
    const result = await users.insertOne({
      name: name.trim(),
      email: emailClean,
      phone: phone ? phone.trim() : '',
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });

    const userId = result.insertedId;
    const { token } = await createSession(userId);

    res.cookie(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      user: {
        _id: userId,
        name: name.trim(),
        email: emailClean,
        phone: phone ? phone.trim() : '',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    const isDbError = err.code === 'DB_NOT_CONNECTED' || err.message?.includes('Database is not connected');
    return res.status(isDbError ? 503 : 400).json({
      error: isDbError
        ? 'Database error: MongoDB is not connected. Please ensure MONGODB_URI is configured properly in your .env file.'
        : err.message || 'Failed to create account.',
    });
  }
});

/**
 * Login existing user (by email or phone)
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required.' });
    }

    const identifier = email.trim().toLowerCase();
    const users = getCollection('users');

    // Search by email or phone
    let user = await users.findOne({ email: identifier });
    if (!user) {
      user = await users.findOne({ phone: identifier });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const { token } = await createSession(user._id);

    res.cookie(SESSION_COOKIE_NAME, token, COOKIE_OPTIONS);

    const { password: _, ...safeUser } = user;
    return res.json({
      success: true,
      message: 'Logged in successfully.',
      user: safeUser,
    });
  } catch (err) {
    console.error('Login error:', err);
    const isDbError = err.code === 'DB_NOT_CONNECTED' || err.message?.includes('Database is not connected');
    return res.status(isDbError ? 503 : 400).json({
      error: isDbError
        ? 'Database error: MongoDB is not connected. Please ensure MONGODB_URI is configured properly in your .env file.'
        : err.message || 'Failed to log in.',
    });
  }
});

/**
 * Logout current session
 */
router.post('/logout', async (req, res) => {
  try {
    const token = extractToken(req);
    if (token) {
      await destroySession(token);
    }
    res.clearCookie(SESSION_COOKIE_NAME, { path: '/', httpOnly: true });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ error: 'Failed to log out.' });
  }
});

/**
 * Check current session (Me)
 */
router.get('/me', async (req, res) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.json({ user: null });
    }

    const user = await getSessionUser(token);
    return res.json({
      user,
      dbStatus: getDbStatus(),
    });
  } catch (err) {
    console.error('Get session error:', err);
    return res.status(500).json({ error: 'Failed to verify session.' });
  }
});

/**
 * Update Profile
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    const users = getCollection('users');

    await users.updateOne(
      { _id: req.user._id },
      { $set: { name: (name || req.user.name).trim(), phone: (phone !== undefined ? phone.trim() : req.user.phone) } }
    );

    const updatedUser = await users.findOne({ _id: req.user._id });
    const { password: _, ...safeUser } = updatedUser;

    return res.json({ success: true, user: safeUser });
  } catch (err) {
    console.error('Update profile error:', err);
    return res.status(500).json({ error: 'Failed to update profile.' });
  }
});

/**
 * Change Password
 */
router.post('/change-password', requireAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both current and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const users = getCollection('users');
    const user = await users.findOne({ _id: req.user._id });

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Current password is incorrect.' });
    }

    const hashedNew = await hashPassword(newPassword);
    await users.updateOne({ _id: req.user._id }, { $set: { password: hashedNew } });

    return res.json({ success: true, message: 'Password updated successfully.' });
  } catch (err) {
    console.error('Change password error:', err);
    return res.status(500).json({ error: 'Failed to update password.' });
  }
});

export default router;

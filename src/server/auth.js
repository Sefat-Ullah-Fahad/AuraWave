import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getCollection } from './db.js';

const SESSION_COOKIE_NAME = 'aurawave_session';
const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Hash password securely using bcrypt with 12 salt rounds
 */
export async function hashPassword(plainText) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainText, salt);
}

/**
 * Verify password against bcrypt hash
 */
export async function verifyPassword(plainText, hash) {
  if (!plainText || !hash) return false;
  return bcrypt.compare(plainText, hash);
}

/**
 * Create a new session for a user and return the token
 */
export async function createSession(userId) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  const sessions = getCollection('sessions');
  await sessions.insertOne({
    userId,
    token,
    expiresAt,
    createdAt: new Date().toISOString(),
  });

  return { token, expiresAt };
}

/**
 * Look up user by session token
 */
export async function getSessionUser(token) {
  if (!token || typeof token !== 'string' || !/^[a-f0-9]{64}$/i.test(token.trim())) {
    return null;
  }

  const cleanToken = token.trim();
  const sessions = getCollection('sessions');
  const session = await sessions.findOne({ token: cleanToken });

  if (!session) return null;

  // Check expiration
  if (new Date(session.expiresAt) < new Date()) {
    await sessions.deleteOne({ token });
    return null;
  }

  const users = getCollection('users');
  const user = await users.findOne({ _id: session.userId });
  if (!user) return null;

  // Return user without password
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Destroy session (logout)
 */
export async function destroySession(token) {
  if (!token) return;
  const sessions = getCollection('sessions');
  await sessions.deleteOne({ token });
}

/**
 * Helper to extract token from request (cookies or Authorization header)
 */
export function extractToken(req) {
  if (req.cookies && req.cookies[SESSION_COOKIE_NAME]) {
    return req.cookies[SESSION_COOKIE_NAME];
  }

  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

/**
 * Middleware: Verify user authentication and set req.user
 * Rejects with 401 if unauthenticated.
 */
export async function requireAuth(req, res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const user = await getSessionUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid. Please log in again.' });
    }

    // Attach strictly authenticated user to request
    req.user = user;
    req.sessionToken = token;
    next();
  } catch (err) {
    console.error('requireAuth error:', err);
    return res.status(500).json({ error: 'Internal server error while verifying session.' });
  }
}

export { SESSION_COOKIE_NAME, SESSION_DURATION_MS };

import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

let mongoClient = null;
let mongoDb = null;
let isConnected = false;

const ENV_PATH = path.resolve(process.cwd(), '.env');

/**
 * Connect directly to MongoDB
 */
export async function connectMongo(uri) {
  if (!uri || !uri.trim()) {
    isConnected = false;
    mongoDb = null;
    return false;
  }

  const cleanUri = uri.trim();

  // Close previous connection if any
  if (mongoClient) {
    try {
      await mongoClient.close();
    } catch (e) {}
  }

  console.log('Connecting directly to MongoDB Atlas...');
  mongoClient = new MongoClient(cleanUri, {
    serverSelectionTimeoutMS: 8000,
    maxPoolSize: 20,
    retryWrites: true,
  });

  await mongoClient.connect();
  
  // Test ping
  await mongoClient.db().admin().ping();

  // If no database name in URI, use 'aurawave'
  let targetDbName = 'aurawave';
  try {
    const parsed = new URL(cleanUri.replace('mongodb+srv://', 'http://').replace('mongodb://', 'http://'));
    const pathname = parsed.pathname.replace(/^\//, '');
    if (pathname && !pathname.includes('?')) {
      targetDbName = pathname;
    }
  } catch (e) {}

  mongoDb = mongoClient.db(targetDbName);
  isConnected = true;
  console.log(`✅ Direct MongoDB connected to database: "${mongoDb.databaseName}"`);

  // Create required isolation indexes
  try {
    await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });
    await mongoDb.collection('sessions').createIndex({ token: 1 }, { unique: true });
    await mongoDb.collection('songs').createIndex({ userId: 1, youtubeVideoId: 1 }, { unique: true });
    await mongoDb.collection('songs').createIndex({ userId: 1, _id: 1 });
    await mongoDb.collection('playlists').createIndex({ userId: 1, _id: 1 });
    await mongoDb.collection('history').createIndex({ userId: 1, playedAt: -1 });
  } catch (idxErr) {
    console.warn('Index notice:', idxErr.message);
  }

  return true;
}

/**
 * Save new URI to .env and reconnect
 */
export async function updateMongoUri(newUri) {
  if (!newUri || !newUri.trim()) {
    throw new Error('MongoDB URI cannot be empty');
  }

  // Test connection first
  await connectMongo(newUri);

  // Update .env file
  try {
    let envContent = '';
    if (fs.existsSync(ENV_PATH)) {
      envContent = fs.readFileSync(ENV_PATH, 'utf-8');
    }

    if (envContent.includes('MONGODB_URI=')) {
      envContent = envContent.replace(/MONGODB_URI=.*/g, `MONGODB_URI="${newUri.trim()}"`);
    } else {
      envContent += `\nMONGODB_URI="${newUri.trim()}"\n`;
    }

    fs.writeFileSync(ENV_PATH, envContent, 'utf-8');
    process.env.MONGODB_URI = newUri.trim();
  } catch (err) {
    console.warn('Could not write to .env:', err.message);
  }

  return {
    success: true,
    dbName: mongoDb?.databaseName || 'aurawave',
  };
}

/**
 * Startup connection from environment
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (uri && uri.trim() && !uri.includes('cluster0.mongodb.net/aurawave?retryWrites=true')) {
    try {
      await connectMongo(uri);
      return;
    } catch (err) {
      console.error('❌ Failed to connect to MongoDB Atlas on startup:', err.message);
      isConnected = false;
      mongoDb = null;
    }
  } else {
    console.log('⚠️ No MongoDB URI configured yet. Set MONGODB_URI to connect directly to MongoDB.');
    isConnected = false;
    mongoDb = null;
  }
}

export function getDbStatus() {
  return {
    isConnected,
    isUsingMongo: isConnected,
    type: isConnected ? `MongoDB Atlas (${mongoDb?.databaseName})` : 'Disconnected (Action Required)',
    dbName: mongoDb?.databaseName || null,
  };
}

/**
 * Collection getter: Strict direct database connection.
 * Zero local disk storage. Zero fake in-memory storage.
 */
export function getCollection(collectionName) {
  if (!isConnected || !mongoDb) {
    const error = new Error('Database is not connected. Please verify that your MONGODB_URI is correctly configured in your .env file.');
    error.statusCode = 503;
    error.code = 'DB_NOT_CONNECTED';
    throw error;
  }

  return mongoDb.collection(collectionName);
}

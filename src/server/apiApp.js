import express from 'express';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import dbRoutes from './routes/dbRoutes.js';

export function createApiApp() {
    const app = express();

    app.disable('x-powered-by');

    app.use((req, res, next) => {
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
        res.setHeader('X-XSS-Protection', '1; mode=block');
        res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
        next();
    });

    app.use(express.json({ limit: '1mb' }));
    app.use(express.urlencoded({ extended: true, limit: '1mb' }));
    app.use(cookieParser());

    app.use((req, res, next) => {
        if (req.body && typeof req.body === 'object') {
            delete req.body.userId;
        }
        next();
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/songs', songRoutes);
    app.use('/api/playlists', playlistRoutes);
    app.use('/api/history', historyRoutes);
    app.use('/api/db', dbRoutes);

    app.get('/api/health', (req, res) => {
        res.json({ status: 'ok', time: new Date().toISOString() });
    });

    return app;
}
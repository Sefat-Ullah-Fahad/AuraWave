import { createApiApp } from '../src/server/apiApp.js';
import { connectDB } from '../src/server/db.js';

const app = createApiApp();

export default async function handler(req, res) {
    try {
        await connectDB();

        const requestUrl = new URL(req.url || '/', 'http://localhost');
        const nestedPath = requestUrl.searchParams.get('__path');
        if (nestedPath) {
            requestUrl.pathname = `${requestUrl.pathname.replace(/\/$/, '')}/${nestedPath}`;
            requestUrl.searchParams.delete('__path');
            req.url = `${requestUrl.pathname}${requestUrl.search}`;
        }

        if (req.url && !req.url.startsWith('/api/')) {
            req.url = `/api${req.url.startsWith('/') ? '' : '/'}${req.url}`;
        }

        return app(req, res);
    } catch (error) {
        console.error('API function error:', error);
        return res.status(500).json({ error: 'The API could not process this request.' });
    }
}
import express from 'express';
import cors from 'cors';
import { initJwtKeys } from './auth.js';
import authRoutes from './routes/auth.js';
import contactsRoutes from './routes/contacts.js';
import messagesRoutes from './routes/messages.js';

const PORT = Number(process.env.PORT) || 3001;

async function main() {
  await initJwtKeys();

  const app = express();
  
  // Explicit CORS configuration to allow Authorization header
  app.use(cors({
    origin: '*',
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
  }));
  
  // Add debug middleware to log incoming headers
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
      console.log(`[middleware] ${req.method} ${req.path}`);
      console.log('[middleware] All headers:', Object.keys(req.headers));
      console.log('[middleware] Authorization:', req.headers.authorization ? 'YES' : 'NO');
    }
    next();
  });
  
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/contacts', contactsRoutes);
  app.use('/api/messages', messagesRoutes);

  app.use((err, _req, res, _next) => {
    console.error('[unhandled]', err);
    res.status(500).json({ error: 'Internal server error' });
  });

  app.listen(PORT, () => {
    console.log(`[server] listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error('[fatal]', err);
  process.exit(1);
});

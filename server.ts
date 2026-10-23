import express from 'express';
import { createServer as createViteServer } from 'vite';
import { BADGE_LEVELS, calculateBadgeLevel } from './src/services/badgeBackendService';

async function startServer() {
  const app = express();
  // Dev server must run on port 3000 in this environment (port 8080 is reserved by the proxy)
  const PORT = 3000;

  app.use(express.json());

  // Backend Badge API: 10 Badge Levels
  app.get('/api/badges/levels', (_req, res) => {
    res.json({
      success: true,
      levels: BADGE_LEVELS,
      totalLevels: BADGE_LEVELS.length
    });
  });

  // Backend Badge API: Calculate 10-level badge from games played & events attended
  app.post('/api/badges/calculate', (req, res) => {
    const { gamesPlayedCount = 0, totalGamesCount = 24, eventsAttendedCount = 0 } = req.body;
    const result = calculateBadgeLevel({
      gamesPlayedCount: Number(gamesPlayedCount) || 0,
      totalGamesCount: Number(totalGamesCount) || 24,
      eventsAttendedCount: Number(eventsAttendedCount) || 0
    });
    res.json({
      success: true,
      data: result
    });
  });

  // Serve public assets (favicon, images)
  app.use(express.static('public'));

  // Mount Vite middlewares for frontend SPA
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Social Shuffle Full-Stack Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

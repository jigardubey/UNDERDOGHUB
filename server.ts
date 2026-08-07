import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;

app.use(express.json());

// In-memory backend storage for fallback / full-stack sync
let TOURNAMENTS_DB = [
  {
    id: 'ff-india-championship-2026',
    name: 'Free Fire India Championship Series 2026',
    organizer: 'Garena Esports Official',
    isVerified: true,
    bannerUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    status: 'live',
    startDate: '2026-08-07',
    startTime: '18:00 IST',
    prizePool: '₹25,00,000',
    entryFee: 'Free',
    registrationUrl: 'https://ff.garena.com/esports',
    matchFormat: 'Battle Royale Squad',
    description: 'The pinnacle of competitive Free Fire in South Asia.',
    rules: ['Squad of 4 players + 1 optional sub.', 'Level 40+ required.'],
    slotsTotal: 48,
    slotsFilled: 48,
    featured: true
  }
];

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'UNDERDOG HUB', time: new Date().toISOString() });
});

// GET all tournaments
app.get('/api/tournaments', (req, res) => {
  res.json(TOURNAMENTS_DB);
});

// POST new tournament (submission)
app.post('/api/tournaments', (req, res) => {
  const newT = {
    id: `tourn-${Date.now()}`,
    ...req.body,
    submittedAt: new Date().toISOString()
  };
  TOURNAMENTS_DB.unshift(newT);
  res.status(201).json(newT);
});

// Start Express server + Vite
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UNDERDOG HUB] Server listening on http://0.0.0.0:${PORT}`);
  });
}

start();

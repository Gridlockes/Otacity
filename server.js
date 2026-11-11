'use strict';

const express = require('express');
const path = require('path');

const games = require('./data/games');

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------------------------------------------------------
// API: the game catalog
// ---------------------------------------------------------------------------
app.get('/api/games', (req, res) => {
  res.json(games);
});

app.get('/api/health', (req, res) => res.json({ ok: true, games: games.length }));

// ---------------------------------------------------------------------------
// Static frontend
// ---------------------------------------------------------------------------
app.use(express.static(path.join(__dirname, 'public')));

app.listen(PORT, () => {
  console.log(`\n  Otacity running →  http://localhost:${PORT}\n`);
});

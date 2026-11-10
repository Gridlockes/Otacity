'use strict';

// Static build for hosts without a Node server (Vercel):
// writes the game catalog to public/api/games.json, which vercel.json serves at /api/games.
const fs = require('fs');
const path = require('path');
const games = require('../data/games');

const out = path.join(__dirname, '..', 'public', 'api', 'games.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(games));
console.log(`wrote ${games.length} games → ${path.relative(process.cwd(), out)}`);

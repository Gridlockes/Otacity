'use strict';

// The Otacity cabinet list. `icon` is the inner markup of a 24×24 stroke SVG.
// scripts/build.js turns this into public/api/games.json for static hosting.
module.exports = [
  {
    slug: 'neon-snake', title: 'Neon Snake', genre: 'Arcade', players: '1P', hue: 330,
    description: 'Eat the orbs, grow longer, and try not to bite your own glowing tail.',
    icon: '<path d="M4 6h7a3 3 0 0 1 3 3 3 3 0 0 1-3 3H8a3 3 0 0 0-3 3 3 3 0 0 0 3 3h9"/><circle cx="19" cy="5" r="1.4" fill="currentColor"/>',
  },
  {
    slug: 'grid-runner', title: 'Grid Runner', genre: 'Platformer', players: '1P', hue: 265,
    description: 'An endless run across a neon city. One button, double jumps, rising speed.',
    icon: '<circle cx="13" cy="4.5" r="1.6" fill="currentColor"/><path d="M11 9l-3 2 1 5m2-7l3 1 2 3m-7-4l-3 7m6-3l2 6"/>',
  },
  {
    slug: 'pixel-siege', title: 'Pixel Siege', genre: 'Strategy', players: '1-2P', hue: 200,
    description: 'Turn-based artillery. Read the wind, carve the hills, flatten the other fort.',
    icon: '<path d="M4 20V9l3 2 2-4 3 3 3-3 2 4 3-2v11z"/><path d="M4 20h16M10 20v-4h4v4"/>',
  },
  {
    slug: 'astro-drift', title: 'Astro Drift', genre: 'Racing', players: '1-4P', hue: 20,
    description: 'Three laps around an orbital track. Drift the corners and bump your rivals.',
    icon: '<path d="M12 3c3 2 5 6 5 10l-3 2h-4l-3-2c0-4 2-8 5-10z"/><circle cx="12" cy="10" r="1.6"/><path d="M9 17l-2 4m8-4l2 4"/>',
  },
  {
    slug: 'cipher', title: 'Cipher', genre: 'Puzzle', players: '1P', hue: 155,
    description: 'Crack a hidden symbol code from the clues. Each round gets harder.',
    icon: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/>',
  },
  {
    slug: 'dungeon-bytes', title: 'Dungeon Bytes', genre: 'Roguelike', players: '1P', hue: 285,
    description: 'A turn-based dive through random dungeons. Loot, level up, go deeper.',
    icon: '<path d="M12 3a7 7 0 0 0-7 7v5l2 1v3h3v-2h4v2h3v-3l2-1v-5a7 7 0 0 0-7-7z"/><circle cx="9.5" cy="11" r="1.3" fill="currentColor"/><circle cx="14.5" cy="11" r="1.3" fill="currentColor"/>',
  },
  {
    slug: 'block-storm', title: 'Block Storm', genre: 'Puzzle', players: '1P', hue: 48,
    description: 'Stack falling blocks and clear lines while lightning shoves junk up from below.',
    icon: '<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="9" y="14" width="6" height="6" rx="1"/>',
  },
  {
    slug: 'laser-pong', title: 'Laser Pong', genre: 'Arcade', players: '1-2P', hue: 175,
    description: 'Paddle duel with a twist: fire a laser to freeze your opponent for a moment.',
    icon: '<path d="M5 7v10M19 7v10"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><path d="M9 9l3 3-3 3"/>',
  },
];

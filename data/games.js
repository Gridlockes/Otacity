'use strict';

// The Otacity cabinet list. `icon` is the inner markup of a 24×24 stroke SVG.
// scripts/build.js turns this into public/api/games.json for static hosting.
module.exports = [
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
    slug: 'cipher', title: 'Cipher', genre: 'Puzzle', players: '1P', hue: 155,
    description: 'Crack a hidden symbol code from the clues. Each round gets harder.',
    icon: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15" r="1.3" fill="currentColor"/>',
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

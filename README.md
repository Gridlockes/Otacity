# Otacity

A free retro arcade of browser games: Neon Snake, Grid Runner, Pixel Siege, Astro Drift,
Cipher, Dungeon Bytes, Block Storm and Laser Pong. Keyboard, gamepad and touch all work.

## Run locally

```sh
npm install
npm start          # http://localhost:3000
```

## Layout

- `public/` — everything the browser loads (homepage, `app.js`, `games/`, `audio/`)
- `public/games/kit.js` — the small shared engine (input, menus, scores, sound)
- `data/games.js` — the game catalog, served at `/api/games`
- `server.js` — Express server for local play
- `scripts/build.js` — writes the catalog to `public/api/games.json` for static hosting

## Deploy

Vercel serves `public/` as a static site (see `vercel.json`); the build step generates
`/api/games` from `data/games.js`. To add a game, drop an HTML file in `public/games/`
and add an entry to `data/games.js`.

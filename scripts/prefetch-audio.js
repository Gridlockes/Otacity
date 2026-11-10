'use strict';

// Downloads the boot intro sound into public/audio/intro.mp3 so it ships as a static file.
const fs = require('fs');
const path = require('path');

const URL = 'https://assets.mixkit.co/active_storage/sfx/1474/1474-preview.mp3';
const out = path.join(__dirname, '..', 'public', 'audio', 'intro.mp3');

(async () => {
  const resp = await fetch(URL);
  if (!resp.ok) throw new Error('upstream audio responded ' + resp.status);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, Buffer.from(await resp.arrayBuffer()));
  console.log('saved', path.relative(process.cwd(), out));
})().catch(err => { console.error(err.message); process.exit(1); });

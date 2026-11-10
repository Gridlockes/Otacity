'use strict';

// Kit — the tiny shared engine every Otacity cabinet runs on.
// Handles the canvas, input (keyboard / gamepad / touch), the title-pause-game over
// flow, best scores and beep sound effects, so each game only writes its own rules.
//
//   Kit.run({ slug, title, width, height, modes, help, best, start, update, draw, click })
//
window.Kit = (() => {
  const ACTIONS = ['up', 'down', 'left', 'right', 'a', 'b'];
  // one player: every common key works
  const KEYS_SOLO = {
    up: ['ArrowUp', 'KeyW'], down: ['ArrowDown', 'KeyS'],
    left: ['ArrowLeft', 'KeyA'], right: ['ArrowRight', 'KeyD'],
    a: ['Space', 'Enter', 'KeyZ', 'KeyJ'], b: ['KeyX', 'KeyK', 'ShiftLeft', 'ShiftRight'],
  };
  // two players share the keyboard: WASD on the left, arrows on the right
  const KEYS_SPLIT = [
    { up: ['KeyW'], down: ['KeyS'], left: ['KeyA'], right: ['KeyD'], a: ['Space', 'KeyF'], b: ['KeyG', 'ShiftLeft'] },
    { up: ['ArrowUp'], down: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], a: ['Enter', 'KeyL'], b: ['KeyK', 'ShiftRight'] },
  ];
  const PAUSE_KEYS = ['Escape', 'KeyP'];
  const FONT = '"Silkscreen", monospace';

  const keys = new Set();
  const tapped = new Set(); // keys pressed since the last poll, so very quick taps still register
  const touchHeld = new Set();
  const players = [0, 1, 2, 3].map(() => ({ held: {}, prev: {} }));
  let pauseNow = false, pausePrev = false;
  let numPlayers = 1;

  let game, canvas, ctx, W, H, scale = 1;
  let state = 'title', mode = 0, overAt = 0;
  let score = 0, best = null, overTitle = '', overSub = '';
  let statsEl, nameEl;

  // ---------------------------------------------------------------- storage
  function loadBest(){
    try { const v = localStorage.getItem('otacity:' + game.slug); return v === null ? null : Number(v); }
    catch { return null; }
  }
  function saveBest(v){ try { localStorage.setItem('otacity:' + game.slug, String(v)); } catch {} }

  // ---------------------------------------------------------------- input
  window.addEventListener('keydown', (e) => {
    if (e.code.startsWith('Arrow') || e.code === 'Space') e.preventDefault();
    keys.add(e.code);
    if (!e.repeat) tapped.add(e.code);
    audio();
  });
  window.addEventListener('keyup', (e) => keys.delete(e.code));
  window.addEventListener('blur', () => { keys.clear(); if (state === 'play') state = 'paused'; });

  function keyMapFor(p){
    if (numPlayers === 1) return p === 0 ? KEYS_SOLO : null;
    return KEYS_SPLIT[p] || null;
  }

  function poll(){
    const pads = navigator.getGamepads ? Array.from(navigator.getGamepads()).filter(Boolean) : [];
    let padPause = false;
    players.forEach((pl, p) => {
      pl.prev = pl.held;
      const h = {};
      const map = keyMapFor(p);
      for (const act of ACTIONS){
        h[act] = !!(map && map[act].some(k => keys.has(k) || tapped.has(k)));
        if (p === 0 && touchHeld.has(act)) h[act] = true;
      }
      // solo games take any pad; multiplayer games give pad N to player N
      const own = numPlayers === 1 ? (p === 0 ? pads : []) : (pads[p] ? [pads[p]] : []);
      for (const pad of own){
        const b = pad.buttons, ax = pad.axes;
        const btn = i => !!(b[i] && b[i].pressed);
        h.up    = h.up    || btn(12) || (ax[1] || 0) < -0.5;
        h.down  = h.down  || btn(13) || (ax[1] || 0) >  0.5;
        h.left  = h.left  || btn(14) || (ax[0] || 0) < -0.5;
        h.right = h.right || btn(15) || (ax[0] || 0) >  0.5;
        h.a     = h.a     || btn(0);
        h.b     = h.b     || btn(1) || btn(2);
      }
      pl.held = h;
    });
    for (const pad of pads) if (pad.buttons[9] && pad.buttons[9].pressed) padPause = true;
    pausePrev = pauseNow;
    pauseNow = PAUSE_KEYS.some(k => keys.has(k) || tapped.has(k)) || padPause;
    tapped.clear();
  }

  const held = (act, p = 0) => !!players[p].held[act];
  const hit  = (act, p = 0) => !!players[p].held[act] && !players[p].prev[act];
  const anyHit = (act) => players.some((_, p) => hit(act, p)) || (act === 'a' && hit('a', 0));

  function buildTouch(){
    const bar = document.createElement('div');
    bar.className = 'touch';
    bar.innerHTML = `
      <div class="dpad">
        <button data-a="up" aria-label="Up">▲</button>
        <button data-a="left" aria-label="Left">◀</button>
        <button data-a="right" aria-label="Right">▶</button>
        <button data-a="down" aria-label="Down">▼</button>
      </div>
      <div class="btns">
        <button data-a="b" aria-label="B">B</button>
        <button data-a="a" aria-label="A">A</button>
      </div>`;
    bar.querySelectorAll('button').forEach(btn => {
      const act = btn.dataset.a;
      const on  = (e) => { e.preventDefault(); touchHeld.add(act); btn.classList.add('on'); audio(); };
      const off = (e) => { e.preventDefault(); touchHeld.delete(act); btn.classList.remove('on'); };
      btn.addEventListener('pointerdown', on);
      btn.addEventListener('pointerup', off);
      btn.addEventListener('pointercancel', off);
      btn.addEventListener('pointerleave', off);
    });
    document.body.appendChild(bar);
  }

  // ---------------------------------------------------------------- sound
  let actx = null;
  function audio(){
    if (!actx){
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch { actx = null; }
    }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  // sfx(frequency, seconds, wave, volume, slideTo)
  function sfx(freq, dur = 0.08, type = 'square', vol = 0.08, slide = null){
    if (!actx || actx.state !== 'running') return;
    const t = actx.currentTime;
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(20, slide), t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur = 0.25, vol = 0.12){
    if (!actx || actx.state !== 'running') return;
    const len = Math.floor(actx.sampleRate * dur);
    const buf = actx.createBuffer(1, len, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = actx.createBufferSource(), g = actx.createGain();
    s.buffer = buf; g.gain.value = vol;
    s.connect(g).connect(actx.destination);
    s.start();
  }

  // ---------------------------------------------------------------- drawing helpers
  function text(c, str, x, y, size = 16, color = '#efe9ff', align = 'center', baseline = 'middle'){
    c.font = `${size}px ${FONT}`;
    c.fillStyle = color;
    c.textAlign = align;
    c.textBaseline = baseline;
    c.fillText(str, x, y);
  }

  function fmtBest(v){
    if (v === null || v === undefined) return '—';
    return game.format ? game.format(v) : String(Math.floor(v));
  }

  function renderStats(){
    if (!statsEl) return;
    const parts = [];
    if (game.best !== 'none'){
      parts.push(`${game.scoreLabel || 'SCORE'} <b>${game.format ? game.format(score) : Math.floor(score)}</b>`);
      parts.push(`BEST <b>${fmtBest(best)}</b>`);
    }
    if (hudExtra) parts.unshift(hudExtra);
    const html = parts.map(p => `<span>${p}</span>`).join('');
    if (html !== statsEl.dataset.last){ statsEl.innerHTML = html; statsEl.dataset.last = html; }
  }
  let hudExtra = '';

  function overlay(){
    if (state === 'play') return;
    ctx.fillStyle = 'rgba(13,8,32,.78)';
    ctx.fillRect(0, 0, W, H);
    const cx = W / 2;
    const t = performance.now() / 1000;

    if (state === 'title'){
      text(ctx, game.title.toUpperCase(), cx, H * 0.2, Math.min(44, W / 14), '#ff3d81');
      const modes = game.modes || [];
      let y = H * 0.36;
      if (modes.length > 1){
        modes.forEach((m, i) => {
          const sel = i === mode;
          text(ctx, (sel ? '▸ ' : '  ') + m, cx, y, 16, sel ? '#34e1d6' : '#a99fd0');
          y += 26;
        });
        y += 10;
      }
      (game.help || []).forEach(line => {
        text(ctx, line, cx, y, 11, '#a99fd0');
        y += 19;
      });
      if (Math.sin(t * 5) > -0.3) text(ctx, 'PRESS A / ENTER / TAP TO START', cx, H * 0.88, 14, '#ffd23f');
    } else if (state === 'paused'){
      text(ctx, 'PAUSED', cx, H * 0.4, 36, '#34e1d6');
      text(ctx, 'A / ENTER  RESUME', cx, H * 0.56, 13, '#efe9ff');
      text(ctx, 'B / X  BACK TO ARCADE', cx, H * 0.63, 13, '#a99fd0');
    } else if (state === 'over'){
      text(ctx, overTitle, cx, H * 0.34, Math.min(40, W / 16), '#ff3d81');
      if (overSub) text(ctx, overSub, cx, H * 0.47, 15, '#efe9ff');
      if (game.best !== 'none') text(ctx, `BEST ${fmtBest(best)}`, cx, H * 0.56, 13, '#ffd23f');
      if (performance.now() - overAt > 700){
        text(ctx, 'A / ENTER  PLAY AGAIN', cx, H * 0.72, 13, '#34e1d6');
        text(ctx, 'B / X  TITLE', cx, H * 0.79, 13, '#a99fd0');
      }
    }
  }

  // ---------------------------------------------------------------- flow
  function begin(){
    const n = game.players ? game.players(mode) : 1;
    numPlayers = n;
    score = 0;
    hudExtra = '';
    game.start(mode);
    state = 'play';
    renderStats();
    // swallow the keypress that started the game
    players.forEach(pl => { pl.prev = { ...pl.held }; });
  }

  function end(title, sub = ''){
    if (state !== 'play') return;
    overTitle = title; overSub = sub;
    state = 'over'; overAt = performance.now();
    if (game.best !== 'none' && (game.bestCounts ? game.bestCounts() : true)){
      const better = game.best === 'low' ? (best === null || score < best) : (best === null || score > best);
      if (better && (game.best === 'low' || score > 0)){ best = score; saveBest(best); overSub = (overSub ? overSub + '  ·  ' : '') + 'NEW BEST!'; }
    }
    renderStats();
  }

  function menus(){
    const pauseHit = pauseNow && !pausePrev;
    if (state === 'title'){
      numPlayers = 1;
      const modes = game.modes || [];
      if (modes.length > 1){
        if (anyHit('down')){ mode = (mode + 1) % modes.length; sfx(440, .05); }
        if (anyHit('up')){ mode = (mode + modes.length - 1) % modes.length; sfx(440, .05); }
      }
      if (anyHit('a') || pauseHit){ sfx(660, .1); begin(); }
    } else if (state === 'play'){
      if (pauseHit){ state = 'paused'; sfx(300, .08); }
    } else if (state === 'paused'){
      if (pauseHit || anyHit('a')){ state = 'play'; sfx(500, .06); }
      else if (anyHit('b') || keys.has('KeyQ')) location.href = '../';
    } else if (state === 'over'){
      if (performance.now() - overAt > 700){
        if (anyHit('a')){ sfx(660, .1); begin(); }
        else if (anyHit('b')){ state = 'title'; numPlayers = 1; }
      }
    }
  }

  let last = performance.now();
  function frame(now){
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    poll();
    menus();
    if (state === 'play') game.update(dt);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    game.draw(ctx, state === 'play' ? dt : 0);
    overlay();
    requestAnimationFrame(frame);
  }

  function fit(){
    const stage = canvas.parentElement;
    const r = stage.getBoundingClientRect();
    const availW = Math.max(100, r.width - 32), availH = Math.max(100, r.height - 24);
    const s = Math.min(availW / W, availH / H);
    canvas.style.width = Math.floor(W * s) + 'px';
    canvas.style.height = Math.floor(H * s) + 'px';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    scale = s * dpr;
    canvas.width = Math.floor(W * scale);
    canvas.height = Math.floor(H * scale);
  }

  function run(def){
    game = def;
    W = def.width || 800; H = def.height || 450;
    document.title = `${def.title} — Otacity`;

    const hud = document.createElement('header');
    hud.className = 'hud';
    hud.innerHTML = `<a class="back" href="../">◂ ARCADE</a><span class="name"></span><span class="stats"></span>`;
    document.body.appendChild(hud);
    nameEl = hud.querySelector('.name'); statsEl = hud.querySelector('.stats');
    nameEl.textContent = def.title.toUpperCase();

    const stage = document.createElement('main');
    stage.className = 'stage';
    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', def.title);
    stage.appendChild(canvas);
    document.body.appendChild(stage);
    buildTouch();
    ctx = canvas.getContext('2d');

    canvas.addEventListener('pointerdown', (e) => {
      audio();
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width * W, y = (e.clientY - r.top) / r.height * H;
      if (state === 'title' || (state === 'over' && performance.now() - overAt > 700)) begin();
      else if (state === 'paused') state = 'play';
      else if (state === 'play' && game.click) game.click(x, y);
    });

    best = def.best === 'none' ? null : loadBest();
    renderStats();
    fit();
    window.addEventListener('resize', fit);
    if (document.fonts) document.fonts.ready.then(fit);
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- small utils
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return {
    run, end, held, hit, sfx, noise, text, rand, randInt, clamp, pick,
    get score(){ return score; },
    set score(v){ score = v; renderStats(); },
    hud(html){ hudExtra = html; renderStats(); },
    get state(){ return state; },
    get players(){ return numPlayers; },
  };
})();

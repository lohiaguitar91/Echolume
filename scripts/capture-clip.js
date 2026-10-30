// Capture a silent gameplay clip for store/media and the Reddit posts.
//
//   npm run dev                      (port 3852, in another shell)
//   node scripts/capture-clip.js 19 15 /tmp/cap/d19
//   ffmpeg -r 30 -pattern_type glob -i '/tmp/cap/d19/*.png' \
//     -vf "scale=720:-2:flags=lanczos,format=yuv420p" -c:v libx264 -crf 20 \
//     -preset slow -movflags +faststart store/media/echolume-depth19.mp4
//   ffmpeg -r 30 -pattern_type glob -i '/tmp/cap/d19/*.png' \
//     -vf "fps=15,scale=360:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle" \
//     -loop 0 store/media/echolume-depth19.gif
//
// Needs Playwright with a Chromium; edit executablePath below if yours is
// elsewhere. Frames are named f0000.. for play and g0000.. for the hold on
// the vent, so a glob sorts them in order.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const depth = +(process.argv[2] || 19);
const seconds = +(process.argv[3] || 15);
const outDir = process.argv[4] || path.join(__dirname, 'cap', `d${depth}`);
const FPS = 30;
fs.mkdirSync(outDir, { recursive: true });
for (const f of fs.readdirSync(outDir)) fs.unlinkSync(path.join(outDir, f));

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => console.error('pageerror', e.message));
  await page.goto('http://localhost:3852/', { waitUntil: 'load' });
  await page.waitForFunction(() => !!window.__echo, null, { timeout: 15000 });

  await page.evaluate((depth) => {
    const sh = window.__echo.shell;
    sh.debugTimeScale = 0;   // the loop renders; only this script advances the sim
    // Every teach card already seen: the clip is about the game, not the cards.
    sh.save.data.teachSeen = ['ping', 'mote', 'hunter', 'urchin', 'lure', 'crystal', 'current', 'hush', 'ice', 'vent', 'warden', 'leviathan', 'cast', 'checkpoint', 'heartMote', 'boon', 'gate', 'warm', 'twins', 'deaf'];
    sh.save.persist();
    window.__echo.startLevel(depth);
  }, depth);
  await page.waitForTimeout(500);   // HUD / toast fade-in is a real-time CSS transition

  const total = seconds * FPS;
  let castDone = 0;
  for (let i = 0; i < total; i++) {
    const info = await page.evaluate(({ i, FPS }) => {
      const api = window.__echo, sh = api.shell, g = sh.game;
      const p = g.ents.player;
      const samples = g.geom.main.samples;
      const t = i / FPS;
      // 1.4 s of intro so the depth toast and the verbs strip read, then play.
      if (t >= 1.4 && g.state !== 'won' && !p.dead) {
        let bi = 0, bd = Infinity;
        for (let k = 0; k < samples.length; k++) {
          const dx = samples[k].x - p.x, dy = samples[k].y - p.y, d2 = dx * dx + dy * dy;
          if (d2 < bd) { bd = d2; bi = k; }
        }
        const ti = Math.min(samples.length - 1, bi + 7);
        let tx = samples[ti].x, ty = samples[ti].y;
        let ox = 0, oy = 0;
        const shove = (e) => {
          const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
          if (d < 84 && d > 0.01) { ox += (dx / d) * (84 - d); oy += (dy / d) * (84 - d); }
        };
        for (const u of g.ents.urchins) shove(u);
        for (const l of g.ents.lures) if (l.state !== 'recover') shove(l);
        for (const w of g.ents.wardens || []) shove(w);
        const cap = g.geom.main.w[ti] * 0.65, ol = Math.hypot(ox, oy);
        if (ol > cap) { ox *= cap / ol; oy *= cap / ol; }
        tx += ox; ty += oy;
        window.__capTapT = (window.__capTapT || 0) - 1 / FPS;
        // One thrown voice when a hunter is close: aim it off to the side,
        // away from the path, so the clip shows the lie working.
        const near = g.ents.hunters.find((h) => Math.hypot(h.x - p.x, h.y - p.y) < 260);
        if (near && !window.__capCast && t > 4) {
          const ang = Math.atan2(near.y - p.y, near.x - p.x) + Math.PI / 2;
          const ok = g.castAt(p.x + Math.cos(ang) * 150, p.y + Math.sin(ang) * 150);
          if (ok !== false) { window.__capCast = t; window.__capTapT = 0.9; }
        } else if (window.__capTapT <= 0) {
          g.tapAt(tx, ty); window.__capTapT = 0.45;
        }
      }
      g.update(1 / 60); g.update(1 / 60);
      api.renderNow(1 / FPS);
      return { state: g.state, dead: p.dead, hearts: p.hearts, motes: p.motes, cast: window.__capCast || 0, progress: g.lastProgress };
    }, { i, FPS });
    await page.screenshot({ path: path.join(outDir, `f${String(i).padStart(4, '0')}.png`), type: 'png' });
    if (info.cast && !castDone) { castDone = i; console.log(`cast at frame ${i}`); }
    if (info.state === 'won' || info.dead) { console.log('ended', JSON.stringify(info), 'frame', i); break; }
  }
  // Hold on the vent for a beat so the loop has an ending.
  for (let k = 0; k < 20; k++) {
    await page.evaluate(() => { const g = window.__echo.game; g.update(1 / 60); g.update(1 / 60); window.__echo.renderNow(1 / 30); });
    await page.screenshot({ path: path.join(outDir, `g${String(k).padStart(4, '0')}.png`), type: 'png' });
  }
  console.log('final', JSON.stringify(await page.evaluate(() => window.__echo.stats())));
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });

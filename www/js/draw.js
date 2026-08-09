// All in-world drawing. Reads game state, writes pixels. No game logic here.

import { TUNING } from './config.js';
import { clamp, lerp, dist } from './util.js';

const _wallBatch = [];
const _spikeBatch = [];

export function drawGame(R, game, particles, time, dt, palette) {
  const p = game.ents.player;

  // ---- ambient plankton drifting through view ----
  if (Math.random() < 0.5 && particles.count < 700) {
    const m = 80;
    particles.spawn({
      x: R.cam.x + (Math.random() - 0.5) * (R.w / R.cam.zoom + m * 2),
      y: R.cam.y + (Math.random() - 0.5) * (R.h / R.cam.zoom + m * 2),
      vx: (Math.random() - 0.5) * 12, vy: 6 + Math.random() * 10,
      life: 5 + Math.random() * 5, r: 1.3 + Math.random() * 1.2,
      color: '#6fb7de', coreColor: '#d8f2ff',
      alpha: 0.30, twinkle: 2.5, shrink: false, drag: 0,
    });
  }

  // ---- currents: flowing streaks ----
  for (const c of game.ents.currents) {
    if (!R.inView(c.x, c.y, c.r)) continue;
    c.emitT -= dt;
    if (c.emitT <= 0) {
      c.emitT = 0.06;
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * c.r;
      particles.spawn({
        x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr,
        vx: c.dirX * c.strength * 0.55, vy: c.dirY * c.strength * 0.55,
        life: 0.9, r: 2.1, color: palette.current, coreColor: '#bcd2ff',
        alpha: 0.4, drag: 0.2,
      });
    }
  }

  // ---- walls ----
  const store = game.geom.store;
  _wallBatch.length = 0;
  const z = R.cam.zoom;
  for (let i = 0; i < store.n; i++) {
    const e = store.energy[i];
    if (e < 0.02) continue;
    const s1 = R.worldToScreen(store.x1[i], store.y1[i]);
    if (s1.x < -80 || s1.x > R.w + 80 || s1.y < -80 || s1.y > R.h + 80) continue;
    const s2 = R.worldToScreen(store.x2[i], store.y2[i]);
    _wallBatch.push({ x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y, a: Math.pow(e, 1.15) });
  }
  R.strokeGlowSegments(_wallBatch, 2.1 * z, palette.terrain, palette.terrainCore);

  // ---- vent ----
  const vent = game.ents.vent;
  if (vent) {
    const pulse = 0.5 + 0.5 * Math.sin(vent.phase * 2.1);
    const vis = Math.max(vent.reveal, vent.discovered ? 0.4 : 0.12);
    R.glowDot(vent.x, vent.y, 22 + pulse * 4, palette.vent, vis * 0.85, palette.ventCore);
    const ringT = (vent.phase % 2.4) / 2.4;
    R.ring(vent.x, vent.y, 18 + ringT * 46, 1.6 * z, palette.vent, (1 - ringT) * 0.4 * vis);
    if (Math.random() < 0.22 && R.inView(vent.x, vent.y, 60)) {
      particles.spawn({
        x: vent.x + (Math.random() - 0.5) * 26, y: vent.y + 8,
        vx: (Math.random() - 0.5) * 8, vy: -26 - Math.random() * 22,
        life: 1.6, r: 1.8 + Math.random() * 1.4,
        color: palette.vent, coreColor: palette.ventCore,
        alpha: 0.65 * Math.max(0.35, vis), gravity: -14, drag: 0.4,
      });
    }
  }

  // ---- motes ----
  for (const m of game.ents.motes) {
    if (m.taken) continue;
    const bob = Math.sin(time * 1.3 + m.driftPhase) * 2.5;
    const tw = 0.8 + 0.2 * Math.sin(time * 2.2 + m.phase);
    const vis = clamp(0.26 + m.reveal * 0.74, 0, 1);
    R.glowDot(m.x, m.y + bob, (4.6 + tw) * 1.15, palette.mote, vis * tw, palette.moteCore);
  }

  // ---- urchins ----
  _spikeBatch.length = 0;
  for (const u of game.ents.urchins) {
    // Faint idle shimmer keeps thorns fair: a careful eye can spot them unpinged.
    const idle = 0.09 + 0.05 * Math.sin(time * 1.7 + u.phase * 3);
    const vis = Math.max(u.reveal, idle);
    if (vis < 0.02) continue;
    if (!R.inView(u.x, u.y, 40)) continue;
    const throb = 1 + 0.08 * Math.sin(time * 2.1 + u.phase);
    R.glowDot(u.x, u.y, 8 * throb, palette.urchin, vis * 0.75, palette.urchinCore);
    for (const ang of u.spikes) {
      const wob = Math.sin(time * 1.8 + u.phase + ang * 3) * 1.6;
      const r0 = 9, r1 = (TUNING.urchinVisualRadius - 9) * throb + wob;
      const s1 = R.worldToScreen(u.x + Math.cos(ang) * r0, u.y + Math.sin(ang) * r0);
      const s2 = R.worldToScreen(u.x + Math.cos(ang) * (r0 + r1), u.y + Math.sin(ang) * (r0 + r1));
      _spikeBatch.push({ x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y, a: vis * 0.8 });
    }
  }
  R.strokeGlowSegments(_spikeBatch, 1.5 * z, palette.urchin, palette.urchinCore);

  // ---- hunters ----
  for (const h of game.ents.hunters) {
    const alert = h.state === 'alert';
    const vis = Math.max(h.reveal, alert ? 0.5 : 0);
    if (vis < 0.02) continue;
    const col = alert ? palette.hunterAlert : palette.hunter;
    const core = alert ? '#ffd9df' : '#e6d1ff';
    const sp = Math.hypot(h.vx, h.vy) || 1;
    const tx = -h.vx / sp, ty = -h.vy / sp;
    // trailing body segments
    for (let k = 1; k <= 3; k++) {
      const wig = Math.sin(h.phase * 4 - k * 1.2) * 4 * k;
      const px2 = h.x + tx * k * 10 + -ty * wig * 0.3;
      const py2 = h.y + ty * k * 10 + tx * wig * 0.3;
      R.glowDot(px2, py2, 8 - k * 1.5, col, vis * (0.62 - k * 0.13));
    }
    R.glowDot(h.x, h.y, 11.5, col, vis * 0.95, core);
    // listening ripple when alerted
    if (alert) {
      const ringT = (h.phase % 1.1) / 1.1;
      R.ring(h.x, h.y, 14 + ringT * 40, 1.5 * z, col, (1 - ringT) * 0.7 * vis);
    }
  }

  // ---- pings ----
  for (const ping of game.pings) {
    const t = ping.r / TUNING.pingMaxRadius;
    const a = Math.pow(1 - t, 1.25) * 0.85;
    R.ring(ping.x, ping.y, ping.r, 2.4 * z, palette.ping, a);
    R.ring(ping.x, ping.y, ping.r * 0.88, 1.3 * z, '#5adfff', a * 0.45);
  }

  // ---- player ----
  if (!p.dead) {
    const speed = Math.hypot(p.vx, p.vy);
    const breathe = 0.92 + 0.08 * Math.sin(p.breathe * 2.4);
    let alpha = 1;
    if (p.invuln > 0) alpha = 0.45 + 0.55 * Math.abs(Math.sin(p.invuln * 14));
    R.glowDot(p.x, p.y, 20 * breathe * game.auraScale + 4, palette.playerAura, 0.28 * alpha);
    R.glowDot(p.x, p.y, 10.5, palette.playerAura, 0.75 * alpha);
    R.glowDot(p.x, p.y, 5.2, palette.player, alpha, '#ffffff');
    // motion tail
    if (speed > 70 && Math.random() < clamp(speed / 500, 0.12, 0.6)) {
      particles.spawn({
        x: p.x - (p.vx / speed) * 8, y: p.y - (p.vy / speed) * 8,
        vx: -p.vx * 0.12 + (Math.random() - 0.5) * 14,
        vy: -p.vy * 0.12 + (Math.random() - 0.5) * 14,
        life: 0.55, r: 2.6, color: palette.playerAura, alpha: 0.7,
      });
    }
  }

  // ---- particles on top ----
  particles.update(dt);
  particles.draw(R, time);
}

// Ambient scene behind menus: slow drifting glow blobs, plankton, and an idle
// lume singing to itself — the title screen is the game, already alive.
const _menuLume = { cycle: 4.6 };
function lumePos(R, t) {
  return {
    x: R.cam.x + Math.sin(t * 0.19) * 110 + Math.sin(t * 0.063) * 55,
    y: R.cam.y + Math.cos(t * 0.143) * 85 + Math.sin(t * 0.051) * 40 - 40,
  };
}
export function drawMenuAmbient(R, particles, time, dt, palette) {
  R.cam.targetX = Math.sin(time * 0.05) * 60;
  R.cam.targetY = Math.cos(time * 0.037) * 40 + time * 6;
  R.updateCamera(dt, 1.2);
  if (Math.random() < 0.6 && particles.count < 300) {
    particles.spawn({
      x: R.cam.x + (Math.random() - 0.5) * R.w * 1.2,
      y: R.cam.y + (Math.random() - 0.5) * R.h * 1.2,
      vx: (Math.random() - 0.5) * 10, vy: 4 + Math.random() * 8,
      life: 6 + Math.random() * 6, r: 1.2 + Math.random() * 1.6,
      color: '#6fb7de', coreColor: '#d8f2ff',
      alpha: 0.3, twinkle: 2.2, shrink: false, drag: 0,
    });
  }
  // large soft blooms
  for (let i = 0; i < 4; i++) {
    const bx = R.cam.x + Math.sin(time * 0.11 + i * 2.3) * (120 + i * 60);
    const by = R.cam.y + Math.cos(time * 0.09 + i * 1.7) * (100 + i * 50);
    const col = [palette.terrain, palette.mote, palette.vent, palette.hunter][i];
    R.glowDot(bx, by, 46 + Math.sin(time * 0.3 + i) * 8, col, 0.05);
  }

  // idle lume + its song
  const lp = lumePos(R, time);
  const breathe = 0.9 + 0.1 * Math.sin(time * 2.2);
  R.glowDot(lp.x, lp.y, 17 * breathe, palette.playerAura, 0.26);
  R.glowDot(lp.x, lp.y, 9, palette.playerAura, 0.65);
  R.glowDot(lp.x, lp.y, 4.4, palette.player, 0.95, '#ffffff');
  if (Math.random() < 0.2) {
    particles.spawn({
      x: lp.x + (Math.random() - 0.5) * 8, y: lp.y + (Math.random() - 0.5) * 8,
      vx: (Math.random() - 0.5) * 16, vy: (Math.random() - 0.5) * 16,
      life: 0.7, r: 2.2, color: palette.playerAura, alpha: 0.5,
    });
  }
  const C = _menuLume.cycle;
  const cycleT = time % C;
  if (cycleT < 2.2) {
    const t0 = time - cycleT;
    const o = lumePos(R, t0);
    const k = cycleT / 2.2;
    R.ring(o.x, o.y, 16 + k * 280, 2.2, palette.ping, Math.pow(1 - k, 1.3) * 0.6);
    R.ring(o.x, o.y, (16 + k * 280) * 0.87, 1.2, '#5adfff', Math.pow(1 - k, 1.3) * 0.28);
  }

  particles.update(dt);
  particles.draw(R, time);
}

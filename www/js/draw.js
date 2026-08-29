// All in-world drawing. Reads game state, writes pixels. No game logic here.

import { TUNING, chainStyle } from './config.js';
import { clamp, lerp, dist, hexLerp } from './util.js';

const _wallBatch = [];
const _spikeBatch = [];
const _iceBatch = [];

// The chain's visible voice: concentric rings in the mote's own amber, growing
// in count and strength with the streak. Colour never changes, so identity holds.
function drawChainHalo(R, x, y, r, chain, alpha, z, palette) {
  if (chain.halo < 0.02 || alpha < 0.02) return;
  R.ring(x, y, r * 2.1, 1.2 * z, palette.mote, alpha * chain.halo * 0.8);
  if (chain.rings > 1.5) {
    R.ring(x, y, r * 3.0, 1.0 * z, palette.mote, alpha * chain.halo * 0.42);
  }
}

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

  // ---- currents: a wash of blue water, full of flowing streaks ----
  // Two layers by design (Aug 26 playtest, options screenshotted and chosen):
  // the breathing wash gives the zone a visible body and edge before you
  // commit to it, and the streaks carry the flow direction. The old
  // streaks-only rendering was invisible enough that the push read as a bug.
  for (const c of game.ents.currents) {
    if (!R.inView(c.x, c.y, c.r)) continue;
    R.glowDot(c.x, c.y, c.r * 0.85, palette.current,
      0.12 + 0.03 * Math.sin(time * 1.3 + c.phase));
    R.glowDot(c.x, c.y, c.r * 0.5, palette.current,
      0.16 + 0.04 * Math.sin(time * 1.1 + c.phase), '#9dc0ff');
    c.emitT -= dt;
    if (c.emitT <= 0) {
      c.emitT = 0.03;
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * c.r;
      particles.spawn({
        x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr,
        vx: c.dirX * c.strength * 0.55, vy: c.dirY * c.strength * 0.55,
        life: 1.15, r: 3.0, color: palette.current, coreColor: '#bcd2ff',
        alpha: 0.7, drag: 0.2,
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

  // ---- hush zones ----
  // Drawn as absence, and always visible. A zone you could not see before you
  // sang into it would be a trap; seeing it makes the choice of where to sing
  // the actual puzzle. Sits under everything else on purpose.
  for (const h of game.ents.hushZones || []) {
    if (!R.inView(h.x, h.y, h.r + 40)) continue;
    const breathe = 1 + 0.02 * Math.sin(time * 0.5 + h.phase);
    R.softDisc(h.x, h.y, h.r * breathe, palette.hush, 0.5 * h.depth);
    R.ring(h.x, h.y, h.r * breathe, 1.1 * z, palette.hushEdge, 0.3);
  }

  // ---- warm vents ----
  // A rising region, never a point — the warm hues in this palette all belong
  // to things you collect, and scale is what keeps this from joining them.
  for (const w of game.ents.warmVents || []) {
    if (!R.inView(w.x, w.y, w.r + 40)) continue;
    const pulse = 0.5 + 0.12 * Math.sin(time * 1.1 + w.phase);
    R.softDisc(w.x, w.y, w.r, palette.warm, 0.16 * pulse);
    R.ring(w.x, w.y, w.r * (0.55 + 0.12 * Math.sin(time * 0.9 + w.phase)),
           1.2 * z, palette.warm, 0.28);
    // Three motes of heat riding the draught, so the direction is readable.
    for (let i = 0; i < 3; i++) {
      const t = ((time * 0.42 + i / 3 + w.phase * 0.1) % 1);
      const px = w.x + w.dirX * (t - 0.5) * w.r * 1.5;
      const py = w.y + w.dirY * (t - 0.5) * w.r * 1.5;
      R.glowDot(px, py, 3.4, palette.warm, 0.5 * Math.sin(t * Math.PI), palette.warmCore);
    }
  }

  // ---- brittle ice ----
  for (const ice of game.ents.ice || []) {
    if (!R.inView(ice.x, ice.y, 60)) continue;
    if (ice.broken) {
      // Fragments flying apart, fading. Says plainly what just happened.
      const k = Math.min(1, ice.t / TUNING.iceShatterTime);
      if (k >= 1) continue;
      for (const a of ice.facets) {
        const d = 14 + k * 46;
        const x = ice.x + Math.cos(a) * d, y = ice.y + Math.sin(a) * d;
        R.glowDot(x, y, 2.6 * (1 - k), palette.ice, (1 - k) * 0.75, palette.iceCore);
      }
      continue;
    }
    const idle = 0.1 + 0.04 * Math.sin(time * 1.3 + ice.phase);
    const vis = Math.max(ice.reveal, idle);
    // Angular, not round: the shape is what separates it from a bloom crystal.
    for (const a of ice.facets) {
      const r0 = 4, r1 = TUNING.iceRadius;
      const s0 = R.worldToScreen(ice.x + Math.cos(a) * r0, ice.y + Math.sin(a) * r0);
      const s1 = R.worldToScreen(ice.x + Math.cos(a) * r1, ice.y + Math.sin(a) * r1);
      _iceBatch.push({ x1: s0.x, y1: s0.y, x2: s1.x, y2: s1.y, a: vis * 0.8 });
    }
    R.glowDot(ice.x, ice.y, 4.5, palette.ice, vis * 0.55, palette.iceCore);
  }
  if (_iceBatch.length) {
    R.strokeGlowSegments(_iceBatch, 1.2 * z, palette.ice, palette.iceCore);
    _iceBatch.length = 0;
  }

  // ---- motes ----
  // A mote is always amber. The chain shows as size, pulse rate and halo rings
  // around that fixed core, so the field reads as "a long chain" at a glance
  // without any mote ever pretending to be a different object.
  const chain = chainStyle(game.chainDisplay);
  for (const m of game.ents.motes) {
    if (m.taken) continue;
    const bob = Math.sin(time * 1.3 + m.driftPhase) * 2.5;
    const tw = 0.8 + 0.2 * Math.sin(time * chain.pulse + m.phase);
    const vis = clamp(0.26 + m.reveal * 0.74, 0, 1);
    const r = (4.6 + tw) * 1.15 * chain.scale;
    R.glowDot(m.x, m.y + bob, r, palette.mote, vis * tw, palette.moteCore);
    drawChainHalo(R, m.x, m.y + bob, r, chain, vis * tw, z, palette);
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

  // ---- bloom crystals ----
  // Faceted, never hostile: a crystal reads by silhouette, so it can share the
  // cave's cyan without being mistaken for a wall or a mote.
  for (const c of game.ents.crystals) {
    if (!R.inView(c.x, c.y, 60)) continue;
    const charged = c.charge >= 1;
    // A charged crystal is a gift, so it stays findable in the darkest levels;
    // a spent one all but disappears until it recovers.
    const idle = charged ? 0.30 + 0.08 * Math.sin(time * 1.1 + c.phase) : 0.07;
    const vis = Math.max(c.reveal, idle);
    const spin = c.spin + time * 0.35;
    const rr = TUNING.crystalRadius * (charged ? 1 : 0.72);
    const pts = [];
    for (let k = 0; k < 4; k++) {
      const a = spin + (k / 4) * Math.PI * 2;
      const stretch = k % 2 === 0 ? 1 : 0.62;
      pts.push(R.worldToScreen(c.x + Math.cos(a) * rr * stretch, c.y + Math.sin(a) * rr * stretch));
    }
    const facets = [];
    for (let k = 0; k < 4; k++) {
      const a = pts[k], b = pts[(k + 1) % 4];
      facets.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, a: vis * 0.9 });
    }
    R.strokeGlowSegments(facets, 1.6 * z, palette.crystal, palette.crystalCore);
    R.glowDot(c.x, c.y, charged ? 5.5 : 3, palette.crystal, vis * (charged ? 0.9 : 0.4), palette.crystalCore);
    if (charged && Math.random() < 0.05) {
      particles.spawn({
        x: c.x + (Math.random() - 0.5) * 18, y: c.y + (Math.random() - 0.5) * 18,
        vx: (Math.random() - 0.5) * 6, vy: -6 - Math.random() * 8,
        life: 1.2, r: 1.5, color: palette.crystal, coreColor: palette.crystalCore,
        alpha: 0.5 * vis, drag: 0.5,
      });
    }
  }

  // ---- heart motes ----
  for (const m of game.ents.heartMotes) {
    if (m.taken) continue;
    const vis = Math.max(m.reveal, 0.16 + 0.05 * Math.sin(time * 1.4 + m.phase));
    if (!R.inView(m.x, m.y, 50)) continue;
    // Two thumps and a rest — legible without colour vision.
    const bt = (m.beat * 1.15) % 1;
    const thump = Math.exp(-bt * 9) + 0.62 * Math.exp(-Math.max(0, bt - 0.16) * 9);
    R.glowDot(m.x, m.y, 6.5 + thump * 3.4, palette.heart, vis * 0.95, palette.heartCore);
    R.ring(m.x, m.y, 13 + thump * 9, 1.3 * z, palette.heart, vis * 0.35 * thump);
  }

  // ---- lures ----
  // While baiting it wears the field's own amber; the tether only shows once a
  // song has come back off it, or once it has already bitten you.
  for (const l of game.ents.lures) {
    if (!R.inView(l.x, l.y, 70)) continue;
    const baiting = l.state === 'bait';
    const known = Math.max(l.reveal, l.snapped ? 0.12 + 0.05 * Math.sin(time * 1.9 + l.phase) : 0);
    if (baiting) {
      const tw = 0.8 + 0.2 * Math.sin(time * chain.pulse * 0.75 + l.phase);
      const bob = Math.sin(time * 0.9 + l.driftPhase) * 2.0;
      // Identical to a real mote, halo included — that is the whole trick.
      const lr = (4.6 + tw) * 1.15 * chain.scale;
      const la = 0.26 * tw + known * 0.3;
      R.glowDot(l.x, l.y + bob, lr, palette.mote, la, palette.moteCore);
      drawChainHalo(R, l.x, l.y + bob, lr, chain, la, z, palette);
    }
    if (known < 0.02 && baiting) continue;
    const vis = baiting ? known : Math.max(known, l.state === 'lunge' ? 1 : 0.35);
    // Body sits behind the bait on a tether that shortens as it lunges. At rest
    // the lure hangs over its own body, anglerfish-fashion.
    const back = l.state === 'lunge' ? 12 : 26;
    let dx = l.x - l.homeX, dy = l.y - l.homeY;
    const dl = Math.hypot(dx, dy);
    if (dl < 2) { dx = 0; dy = -1; } else { dx /= dl; dy /= dl; }
    const bx = l.x - dx * back;
    const by = l.y - dy * back;
    const s1 = R.worldToScreen(l.x, l.y);
    const s2 = R.worldToScreen(bx, by);
    R.strokeGlowSegments([{ x1: s1.x, y1: s1.y, x2: s2.x, y2: s2.y, a: vis * 0.5 }],
      1.2 * z, palette.lure, palette.lureCore);
    const gape = l.state === 'lunge' ? 1.35 : 1;
    R.glowDot(bx, by, 9 * gape, palette.lure, vis * 0.85, palette.lureCore);
    for (let k = 0; k < 5; k++) {
      const a = Math.atan2(dy, dx) + (k - 2) * 0.34;
      const t1 = R.worldToScreen(bx + Math.cos(a) * 7, by + Math.sin(a) * 7);
      const t2 = R.worldToScreen(bx + Math.cos(a) * (7 + 7 * gape), by + Math.sin(a) * (7 + 7 * gape));
      _spikeBatch.push({ x1: t1.x, y1: t1.y, x2: t2.x, y2: t2.y, a: vis * 0.7 });
    }
    R.strokeGlowSegments(_spikeBatch, 1.4 * z, palette.lure, palette.lureCore);
    _spikeBatch.length = 0;
  }

  // ---- wardens ----
  // Always visible: an anchored thing you cannot outrun has to be readable from
  // across the room, and the fight is about where you sing, not about spotting it.
  for (const w of game.ents.wardens || []) {
    if (!R.inView(w.x, w.y, TUNING.wardenReach + 80)) continue;
    const winding = w.state === 'wind';
    const striking = w.state === 'strike';
    const half = TUNING.wardenJawWidth * 0.5;

    // Render-only facing. While the player holds a cast whose landing it would
    // hear (main.js sets w._attend), a *listening* warden turns its body toward
    // that point and parts its plates — "it strikes where you sang" performed
    // before the song is spent. A committed warden stays committed, and the
    // strike math everywhere uses w.aim; the sim never reads _attend or _face.
    const attending = w.state === 'listen' && w._attend != null;
    const faceTarget = attending ? w._attend : w.aim;
    if (w._face == null) w._face = w.aim;
    const dFace = ((faceTarget - w._face + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    w._face += dFace * Math.min(1, dt * 6);
    const face = w._face;

    // The line it is about to take. This is the whole tell, so it is loud.
    if (winding || striking) {
      const charge = winding ? 1 - Math.max(0, w.t) / TUNING.wardenWindup : 1;
      const len = striking ? w.reach : TUNING.wardenReach * (0.35 + charge * 0.5);
      const a0 = w.aim - half, a1 = w.aim + half;
      const s = R.worldToScreen(w.x, w.y);
      const ctx = R.ctx;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.globalAlpha = striking ? 0.5 : 0.13 + charge * 0.22;
      ctx.fillStyle = palette.wardenJaw;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.arc(s.x, s.y, len * R.cam.zoom, a0, a1);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // The body: plates rather than a glow, so it reads as structure.
    // Orientation comes from the render-only `face` so an attending warden
    // visibly tracks the aim; the telegraph arc above stays on true w.aim.
    const vis = Math.max(w.reveal, 0.5 + 0.06 * Math.sin(time * 0.9 + w.phase));
    const open = striking ? 1 : (winding ? 0.55 : (attending ? 0.4 : 0.18));
    for (let i = 0; i < 10; i++) {
      const a = face + (i / 10) * Math.PI * 2;
      const inner = TUNING.wardenRadius * 0.42;
      const outer = TUNING.wardenRadius * (1 + 0.16 * Math.sin(time * 1.1 + i));
      const spread = Math.abs(((a - face + Math.PI * 3) % (Math.PI * 2)) - Math.PI) < half * 1.8
        ? 1 + open * 0.55 : 1;
      const s0 = R.worldToScreen(w.x + Math.cos(a) * inner, w.y + Math.sin(a) * inner);
      const s1 = R.worldToScreen(w.x + Math.cos(a) * outer * spread, w.y + Math.sin(a) * outer * spread);
      _spikeBatch.push({ x1: s0.x, y1: s0.y, x2: s1.x, y2: s1.y, a: vis * 0.9 });
    }
    R.strokeGlowSegments(_spikeBatch, 2.1 * z, palette.warden, palette.wardenCore);
    _spikeBatch.length = 0;
    R.glowDot(w.x, w.y, TUNING.wardenRadius * 0.45, palette.warden, vis * 0.5, palette.wardenCore);
    // A slow pulse marks the moment it is safe to be close.
    if (w.state === 'recover') {
      R.ring(w.x, w.y, TUNING.wardenRadius * (1.4 + (1 - w.t / TUNING.wardenRecover) * 1.2),
             1.2 * z, palette.warden, 0.3 * (w.t / TUNING.wardenRecover));
    }
  }

  // ---- leviathans ----
  // Banked light traces the loop it will swim, for as long as the light lasts.
  // Knowing the orbit is the whole fight; this buys you time to read it.
  if (game.orbitT > 0) {
    const fade = Math.min(1, game.orbitT / 3);   // last three seconds dim out
    for (const lv of game.ents.leviathans) {
      if (!lv.patrolR) continue;
      R.ring(lv.homeX, lv.homeY, lv.patrolR, 1.1 * z, palette.crystal, 0.3 * fade);
    }
  }
  for (const lv of game.ents.leviathans) {
    const hunting = lv.state === 'hunt';
    // Always faintly there: you are meant to learn its loop, not be ambushed.
    const idle = 0.13 + 0.05 * Math.sin(time * 0.8 + lv.phase);
    const vis = Math.max(lv.reveal, hunting ? 0.55 : idle);
    const col = hunting ? palette.hunterAlert : palette.leviathan;
    const core = hunting ? '#ffd9df' : palette.leviathanCore;
    for (let k = lv.trail.length - 1; k >= 0; k--) {
      const seg = lv.trail[k];
      if (!R.inView(seg.x, seg.y, 60)) continue;
      const taper = 1 - k / (lv.trail.length + 1);
      const wig = Math.sin(lv.phase * 2.6 - k * 0.75) * 3.2;
      R.glowDot(seg.x + wig * 0.3, seg.y, TUNING.leviathanHeadRadius * 0.8 * taper,
        col, vis * (0.5 * taper + 0.12));
    }
    if (!R.inView(lv.x, lv.y, 90)) continue;
    R.glowDot(lv.x, lv.y, TUNING.leviathanHeadRadius, col, vis * 0.8, core);
    R.glowDot(lv.x, lv.y, TUNING.leviathanHeadRadius * 0.45, core, vis * 0.9, '#ffffff');
    const ringT = (lv.phase % (hunting ? 1.4 : 3.2)) / (hunting ? 1.4 : 3.2);
    R.ring(lv.x, lv.y, TUNING.leviathanHeadRadius + ringT * 90, 1.8 * z, col,
      (1 - ringT) * (hunting ? 0.6 : 0.22) * vis);
  }

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

  // ---- the Deaf God swallowing songs ----
  // Where a song's ring meets a deaf leviathan, the arc facing it grays out
  // and crumbles: the confiscated verb failing on screen instead of silently.
  // The god itself never reacts — indifference is the tell. Free light (wake
  // pulses, blooms, silent casts) carries no sound, so nothing dies. Render-
  // only; the sim ignored the song long before this. Ash tones, not alert
  // red, so the cue reads the same with visualThreat on or off.
  for (const ping of game.pings) {
    if (ping.free) continue;
    for (const lv of game.ents.leviathans) {
      if (!lv.deaf) continue;
      const d = dist(ping.x, ping.y, lv.x, lv.y);
      if (d < 8 || d > TUNING.leviathanSenseRadius) continue;
      const band = TUNING.leviathanHeadRadius * 2.2;
      const k = (ping.r - (d - band)) / (band * 3.4);
      if (k <= 0 || k >= 1) continue;
      if (!R.inView(lv.x, lv.y, TUNING.leviathanSenseRadius)) continue;
      const env = Math.sin(k * Math.PI);
      const t = ping.r / TUNING.pingMaxRadius;
      const ringA = Math.pow(1 - Math.min(1, t), 1.25) * 0.85;
      const ang = Math.atan2(lv.y - ping.y, lv.x - ping.x);
      const hw = clamp(Math.atan2(TUNING.leviathanHeadRadius * 2.0, d), 0.18, 1.2);
      const s = R.worldToScreen(ping.x, ping.y);
      const ctx = R.ctx;
      ctx.save();
      // R.ring leaves the context additive; muting needs source-over or the
      // "dead" arc quietly brightens the ring instead of killing it.
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = '#39424c';   // the ring's light with the song gone
      ctx.lineCap = 'round';
      ctx.globalAlpha = Math.min(0.9, ringA * 1.2 + 0.1) * env;
      ctx.lineWidth = 3.2 * z;
      ctx.beginPath();
      ctx.arc(s.x, s.y, ping.r * z, ang - hw, ang + hw);
      ctx.stroke();
      ctx.globalAlpha *= 0.5;
      ctx.lineWidth = 2.0 * z;
      ctx.beginPath();
      ctx.arc(s.x, s.y, ping.r * 0.88 * z, ang - hw * 0.9, ang + hw * 0.9);
      ctx.stroke();
      ctx.restore();
      // The dead arc crumbles: ash motes sinking where the song gave out.
      for (let i = -1; i <= 1; i++) {
        const a2 = ang + i * hw * 0.75;
        const rr = ping.r - k * 20;
        R.glowDot(ping.x + Math.cos(a2) * rr, ping.y + Math.sin(a2) * rr + k * 14,
          2.6, '#6f7b87', (1 - k) * 0.45 * env);
      }
    }
  }

  // ---- player ----
  if (!p.dead) {
    const speed = Math.hypot(p.vx, p.vy);
    const breathe = 0.92 + 0.08 * Math.sin(p.breathe * 2.4);
    let alpha = 1;
    if (p.invuln > 0) alpha = 0.45 + 0.55 * Math.abs(Math.sin(p.invuln * 14));
    // Aura and tail take on the chain color, but never lose the lume's identity.
    const chainMix = clamp(game.chainDisplay / 4, 0, 1) * 0.75;
    const auraCol = hexLerp(palette.playerAura, chain.accent, chainMix);
    // The collect-surge brightens as well as widens, so taking a mote is felt.
    R.glowDot(p.x, p.y, 20 * breathe * game.effectiveAura() + 4, auraCol,
      (0.28 + 0.10 * game.surge()) * alpha);
    R.glowDot(p.x, p.y, 10.5, auraCol, 0.75 * alpha);
    R.glowDot(p.x, p.y, 5.2, palette.player, alpha, '#ffffff');
    // motion tail
    if (speed > 70 && Math.random() < clamp(speed / 500, 0.12, 0.6)) {
      particles.spawn({
        x: p.x - (p.vx / speed) * 8, y: p.y - (p.vy / speed) * 8,
        vx: -p.vx * 0.12 + (Math.random() - 0.5) * 14,
        vy: -p.vy * 0.12 + (Math.random() - 0.5) * 14,
        life: 0.55, r: 2.6, color: auraCol, alpha: 0.7,
      });
    }
  }

  // ---- particles on top ----
  particles.update(dt);
  particles.draw(R, time);
}

// Ambient scene behind menus: slow drifting glow blobs, plankton, and an idle
// lume singing to itself — the title screen is the game, already alive.
// Wander periods are ~11s, not the original ~33s: during a normal glance at
// the menu the lume must visibly swim (a playtester read the old drift as a
// static dot and asked for the light to "move around for fun").
const _menuLume = { cycle: 4.6 };
function lumePos(R, t) {
  return {
    x: R.cam.x + Math.sin(t * 0.55) * 120 + Math.sin(t * 0.21) * 60,
    y: R.cam.y + Math.cos(t * 0.43) * 95 + Math.sin(t * 0.17) * 45 - 40,
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

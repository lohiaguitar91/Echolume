// In-level game logic: physics, ping/reveal, AI, damage, win/lose, drawing.
// The shell (main.js) owns screens/audio/haptics and listens via callbacks.

import { TUNING } from './config.js';
import { buildLevelGeometry, updateReveal, pingRevealSweep, auraReveal } from './level.js';
import { setupEntities } from './entities.js';
import { closestOnSegment, dist, clamp, mulberry32 } from './util.js';

const _q = [];

export class Game {
  constructor(callbacks) {
    this.cb = callbacks;
    this.mode = 'story';       // 'story' | 'abyss'
    this.def = null;
    this.geom = null;
    this.ents = null;
    this.pings = [];
    this.time = 0;
    this.timeScale = 1;
    this.state = 'idle';       // idle | intro | play | dying | won
    this.stateT = 0;
    this.lastProgress = 0;
    this.hintsShown = new Set();
    this.pingCooldown = 0;
    this.rescueT = 0;
    this.moteCombo = 0;
    this.comboT = 0;
    this.auraScale = 1;
    this.decayScale = 1;
    // Abyss
    this.abyss = null;
  }

  // ---- lifecycle ----
  startStory(def) {
    this.mode = 'story';
    this.def = def;
    this.auraScale = def.auraScale || 1;
    this.decayScale = def.decayScale || 1;
    this.geom = buildLevelGeometry(def);
    this.ents = setupEntities(def, this.geom);
    this._resetRun();
  }

  startAbyss(seed = 1) {
    this.mode = 'abyss';
    this.auraScale = 1;
    this.decayScale = 1;
    this.ents = null; // never carry story-mode entities into a fresh run
    this.abyss = {
      seed,
      chunkIndex: 0,
      waypoints: [[0, 0]],
      startY: 0,
      motesScore: 0,
    };
    this._extendAbyss();
    this._extendAbyss();
    this._rebuildAbyssGeometry();
    this._resetRun();
  }

  _resetRun() {
    this.pings.length = 0;
    this.time = 0;
    this.timeScale = 1;
    this.state = 'intro';
    this.stateT = 0;
    this.lastProgress = 0;
    this.hintsShown = new Set();
    this.pingCooldown = 0;
    this.moteCombo = 0;
    // Free wake pulse so the player always starts seeing something.
    this._emitPing(this.ents.player.x, this.ents.player.y - 1, { free: true });
  }

  // ---- abyss generation ----
  _extendAbyss() {
    const a = this.abyss;
    const rng = mulberry32(a.seed * 1000 + a.chunkIndex * 77);
    const last = a.waypoints[a.waypoints.length - 1];
    let [x, y] = last;
    for (let i = 0; i < 8; i++) {
      x += (rng() - 0.5) * 300;
      x = clamp(x, -420, 420);
      y += 250 + rng() * 90;
      a.waypoints.push([x, y]);
    }
    a.chunkIndex++;
  }

  _abyssHalfWidth(depthUnits) {
    const m = depthUnits / TUNING.abyssDepthPerMeter;
    return Math.max(TUNING.abyssMinWidth / 2 + 20, TUNING.abyssStartWidth / 2 + 60 - m * 0.14);
  }

  _rebuildAbyssGeometry() {
    const a = this.abyss;
    // Keep only recent waypoints to bound geometry size (player never backtracks far).
    const keepFrom = Math.max(0, a.waypoints.length - 26);
    const pts = a.waypoints.slice(keepFrom);
    const w0 = this._abyssHalfWidth(pts[0][1]);
    const w1 = this._abyssHalfWidth(pts[pts.length - 1][1]);
    const def = {
      seed: a.seed * 13 + a.chunkIndex,
      path: pts,
      width: [w0, (w0 + w1) / 2, w1],
    };
    const prevEnts = this.ents;
    this.geom = buildLevelGeometry(def);

    // Spawn new entities along the newly added stretch, density ramping with depth.
    const rng = mulberry32(a.seed * 555 + a.chunkIndex * 31);
    const newMotes = [], newUrchins = [], newHunters = [];
    const fresh = a.waypoints.slice(Math.max(0, a.waypoints.length - 9));
    const depthM = fresh[0][1] / TUNING.abyssDepthPerMeter;
    for (const [wx, wy] of fresh) {
      if (rng() < 0.75) {
        newMotes.push({
          x: wx + (rng() - 0.5) * 120, y: wy + (rng() - 0.5) * 160,
          taken: false, reveal: 0, phase: rng() * 6.28, driftPhase: rng() * 6.28,
        });
      }
      const urchinChance = clamp(0.12 + depthM * 0.0009, 0, 0.55);
      if (rng() < urchinChance) {
        const ux = wx + (rng() - 0.5) * 140, uy = wy + (rng() - 0.5) * 100;
        // Keep thorn clusters passable: never two urchins close enough to wall
        // off a narrowed deep-corridor.
        const tooClose = newUrchins.some((o) => dist(o.x, o.y, ux, uy) < 130) ||
          (prevEnts && this.ents.urchins.some((o) => dist(o.x, o.y, ux, uy) < 130));
        if (!tooClose) {
          const spikes = [];
          const nS = 9 + Math.floor(rng() * 4);
          for (let i = 0; i < nS; i++) spikes.push((i / nS) * Math.PI * 2 + rng() * 0.3);
          newUrchins.push({ x: ux, y: uy, reveal: 0, phase: rng() * 6.28, spikes });
        }
      }
      const hunterChance = depthM < 60 ? 0 : clamp(0.05 + depthM * 0.0005, 0, 0.3);
      if (rng() < hunterChance) {
        newHunters.push({
          x: wx, y: wy, vx: 0, vy: 0, homeX: wx, homeY: wy,
          wanderR: 160, fast: depthM > 400 && rng() < 0.4,
          state: 'wander', alertT: 0, targetX: wx, targetY: wy, retargetT: 0,
          reveal: 0, phase: rng() * 6.28,
        });
      }
    }

    if (!prevEnts) {
      const start = { x: 0, y: 0 };
      this.ents = {
        player: {
          x: start.x, y: start.y, vx: 0, vy: 0,
          hearts: TUNING.maxHearts, invuln: 0, motes: 0, pings: 0,
          breathe: 0, dead: false, facing: 0,
        },
        motes: newMotes, urchins: newUrchins, hunters: newHunters,
        currents: [], vent: null,
      };
    } else {
      const cullY = this.ents.player.y - 1600;
      this.ents.motes = this.ents.motes.filter((m) => m.y > cullY).concat(newMotes);
      this.ents.urchins = this.ents.urchins.filter((u) => u.y > cullY).concat(newUrchins);
      this.ents.hunters = this.ents.hunters.filter((h) => h.y > cullY).concat(newHunters);
    }
  }

  // ---- input ----
  tapAt(wx, wy) {
    if (this.state !== 'play' && this.state !== 'intro') return;
    if (this.state === 'intro') { this.state = 'play'; this.stateT = 0; }
    if (this.pingCooldown > 0) return;
    const p = this.ents.player;
    let dx = wx - p.x, dy = wy - p.y;
    const dl = Math.hypot(dx, dy);
    if (dl < 4) { dx = 0; dy = -1; } else { dx /= dl; dy /= dl; }
    p.vx += dx * TUNING.pingImpulse;
    p.vy += dy * TUNING.pingImpulse;
    const sp = Math.hypot(p.vx, p.vy);
    if (sp > TUNING.maxSpeed) { p.vx *= TUNING.maxSpeed / sp; p.vy *= TUNING.maxSpeed / sp; }
    p.facing = Math.atan2(dy, dx);
    p.pings++;
    this.pingCooldown = TUNING.pingCooldown;
    this._emitPing(p.x, p.y, {});
    if (this.cb.onPing) this.cb.onPing();
  }

  _emitPing(x, y, { free = false }) {
    this.pings.push({ x, y, r: 6, prevR: 0, free });
    if (!free) {
      // Hunters hear the song.
      for (const h of this.ents.hunters) {
        if (dist(h.x, h.y, x, y) < TUNING.hunterSenseRadius) this._alertHunter(h, x, y);
      }
    }
  }

  _alertHunter(h, x, y, silent = false) {
    const wasCalm = h.state !== 'alert';
    h.state = 'alert';
    h.alertT = 0;
    h.targetX = x; h.targetY = y;
    if (wasCalm && !silent && this.cb.onAlert) this.cb.onAlert();
  }

  // ---- update ----
  update(rawDt) {
    if (this.state === 'idle') return;
    const dt = rawDt * this.timeScale;
    this.stateT += rawDt;
    const p = this.ents.player;

    if (this.state === 'play') this.time += dt;
    if (this.pingCooldown > 0) this.pingCooldown -= rawDt;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.moteCombo = 0; }

    // ---- player physics ----
    if (!p.dead) {
      p.vy += TUNING.sink * dt;
      for (const c of this.ents.currents) {
        const d = dist(p.x, p.y, c.x, c.y);
        if (d < c.r) {
          const f = c.strength * (1 - d / c.r);
          p.vx += c.dirX * f * dt;
          p.vy += c.dirY * f * dt;
        }
      }
      const drag = Math.exp(-TUNING.drag * dt);
      p.vx *= drag; p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      const impact = this._resolveCircleWalls(p, TUNING.playerRadius, TUNING.wallBounce, TUNING.wallFriction);
      if (impact > TUNING.hardHitSpeed) {
        if (this.cb.onThud) this.cb.onThud(clamp(impact / TUNING.maxSpeed, 0, 1));
        // Loud thud: nearby hunters investigate the noise.
        for (const h of this.ents.hunters) {
          if (dist(h.x, h.y, p.x, p.y) < 260) this._alertHunter(h, p.x, p.y, true);
        }
      }
      if (p.invuln > 0) p.invuln -= dt;
      p.breathe += dt;
    }

    // ---- pings ----
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const ping = this.pings[i];
      ping.prevR = ping.r;
      ping.r += TUNING.pingRingSpeed * dt;
      pingRevealSweep(this.geom.store, ping.x, ping.y, ping.prevR, ping.r, 1);
      this._revealEntities(ping);
      if (ping.r > TUNING.pingMaxRadius) this.pings.splice(i, 1);
    }

    // ---- reveal decay + aura ----
    updateReveal(this.geom.store, dt, TUNING.pingRevealDecay * this.decayScale);
    auraReveal(this.geom.store, this.geom.hash, p.x, p.y,
      TUNING.auraRadius * this.auraScale, TUNING.auraStrength);
    // Fairness: things close to the player are never fully invisible.
    const auraR = TUNING.auraRadius * this.auraScale * 1.35;
    const auraTouch = (e, scale = 1) => {
      const d = dist(e.x, e.y, p.x, p.y);
      if (d < auraR) e.reveal = Math.max(e.reveal, (1 - d / auraR) * scale);
    };
    for (const m of this.ents.motes) if (!m.taken) auraTouch(m, 0.9);
    for (const u of this.ents.urchins) auraTouch(u, 0.95);
    for (const h of this.ents.hunters) auraTouch(h, 0.9);
    if (this.ents.vent) auraTouch(this.ents.vent, 1);

    // ---- motes ----
    for (const m of this.ents.motes) {
      if (m.taken) continue;
      if (m.reveal > 0) m.reveal = Math.max(0, m.reveal - dt * 0.25);
      const d = dist(m.x, m.y, p.x, p.y);
      if (d < TUNING.moteMagnetRadius && !p.dead) {
        const pull = TUNING.moteMagnetPull * (1 - d / TUNING.moteMagnetRadius);
        const dx = (p.x - m.x) / (d || 1), dy = (p.y - m.y) / (d || 1);
        m.x += dx * pull * dt * 0.5;
        m.y += dy * pull * dt * 0.5;
      }
      if (d < TUNING.moteCollectRadius && !p.dead && this.state === 'play') {
        m.taken = true;
        p.motes++;
        this.moteCombo++;
        this.comboT = 2.4;
        if (this.mode === 'abyss') this.abyss.motesScore++;
        if (this.cb.onMote) this.cb.onMote(this.moteCombo, m.x, m.y);
        if (this.mode === 'story' && p.motes === this.ents.motes.length &&
            this.cb.onAllMotes) this.cb.onAllMotes(m.x, m.y);
      }
    }

    // ---- urchins ----
    for (const u of this.ents.urchins) {
      if (u.reveal > 0) u.reveal = Math.max(0, u.reveal - dt * 0.2);
      if (!p.dead && p.invuln <= 0 &&
          dist(u.x, u.y, p.x, p.y) < TUNING.urchinHitRadius + TUNING.playerRadius) {
        this._damage(u.x, u.y, 'urchin');
      }
    }

    // ---- hunters ----
    for (const h of this.ents.hunters) {
      if (h.reveal > 0) h.reveal = Math.max(0, h.reveal - dt * 0.2);
      const speed = h.state === 'alert'
        ? TUNING.hunterChaseSpeed * (h.fast ? 1.45 : 1)
        : TUNING.hunterWanderSpeed;
      if (h.state === 'wander') {
        h.retargetT -= dt;
        if (h.retargetT <= 0) {
          const a = Math.random() * Math.PI * 2;
          const r = Math.random() * h.wanderR;
          h.targetX = h.homeX + Math.cos(a) * r;
          h.targetY = h.homeY + Math.sin(a) * r;
          h.retargetT = 2 + Math.random() * 1.8;
        }
      } else {
        // Alert: converge on last heard sound; close hunters track the player directly.
        const dp = dist(h.x, h.y, p.x, p.y);
        if (dp < 170 && !p.dead) { h.targetX = p.x; h.targetY = p.y; }
        if (dist(h.x, h.y, h.targetX, h.targetY) < 30) {
          h.alertT += dt;
          if (h.alertT > TUNING.hunterCalmTime) { h.state = 'wander'; h.retargetT = 0; }
        }
      }
      let dx = h.targetX - h.x, dy = h.targetY - h.y;
      const dl = Math.hypot(dx, dy);
      if (dl > 4) {
        dx /= dl; dy /= dl;
        const k = 1 - Math.exp(-3.2 * dt);
        h.vx += (dx * speed - h.vx) * k;
        h.vy += (dy * speed - h.vy) * k;
      } else {
        h.vx *= Math.exp(-2 * dt); h.vy *= Math.exp(-2 * dt);
      }
      h.x += h.vx * dt;
      h.y += h.vy * dt;
      this._resolveCircleWalls(h, TUNING.hunterRadius, 0, 1);
      h.phase += dt * (h.state === 'alert' ? 3.4 : 1.4);
      if (!p.dead && p.invuln <= 0 &&
          dist(h.x, h.y, p.x, p.y) < TUNING.hunterHitRadius + TUNING.playerRadius) {
        this._damage(h.x, h.y, 'hunter');
        h.state = 'wander'; h.retargetT = 0; // it got its bite; drifts off
        h.targetX = h.homeX; h.targetY = h.homeY;
      }
    }

    // ---- vent / win ----
    const vent = this.ents.vent;
    if (vent) {
      vent.phase += dt;
      if (vent.reveal > 0) vent.reveal = Math.max(0, vent.reveal - dt * 0.15);
      if (this.state === 'play' && !p.dead &&
          dist(vent.x, vent.y, p.x, p.y) < TUNING.ventRadius) {
        this.state = 'won';
        this.stateT = 0;
        if (this.cb.onWin) this.cb.onWin(this._stats());
      }
    }

    // ---- progress, hints, rescue ----
    this.rescueT -= dt;
    if (this.rescueT <= 0) {
      this.rescueT = 0.5;
      this._progressAndRescue();
    }

    // ---- abyss chunk extension ----
    if (this.mode === 'abyss') {
      const a = this.abyss;
      const lastY = a.waypoints[a.waypoints.length - 1][1];
      if (p.y > lastY - 1400) {
        this._extendAbyss();
        this._rebuildAbyssGeometry();
      }
    }

    // ---- death state advance ----
    if (this.state === 'dying') {
      this.timeScale = Math.max(0.25, this.timeScale - rawDt * 1.4);
      if (this.stateT > 1.5 && this.cb.onDeathDone) {
        this.state = 'idle';
        this.cb.onDeathDone(this._stats());
      }
    }
  }

  _revealEntities(ping) {
    const check = (e, extra = 0) => {
      const d = dist(e.x, e.y, ping.x, ping.y);
      if (d > ping.prevR - extra && d <= ping.r + extra) e.reveal = 1;
    };
    for (const m of this.ents.motes) if (!m.taken) check(m, 8);
    for (const u of this.ents.urchins) check(u, TUNING.urchinVisualRadius);
    for (const h of this.ents.hunters) check(h, 14);
    if (this.ents.vent) {
      const v = this.ents.vent;
      const d = dist(v.x, v.y, ping.x, ping.y);
      if (d > ping.prevR - 30 && d <= ping.r + 30) { v.reveal = 1; v.discovered = true; }
    }
  }

  _resolveCircleWalls(body, radius, bounce, friction) {
    const store = this.geom.store;
    this.geom.hash.query(body.x, body.y, radius + 26, _q);
    let maxImpact = 0;
    for (const i of _q) {
      const cp = closestOnSegment(body.x, body.y, store.x1[i], store.y1[i], store.x2[i], store.y2[i]);
      let dx = body.x - cp.x, dy = body.y - cp.y;
      const d = Math.hypot(dx, dy);
      if (d < radius && d > 0.0001) {
        dx /= d; dy /= d;
        const push = radius - d;
        body.x += dx * push;
        body.y += dy * push;
        const vn = body.vx * dx + body.vy * dy;
        if (vn < 0) {
          maxImpact = Math.max(maxImpact, -vn);
          body.vx -= (1 + bounce) * vn * dx;
          body.vy -= (1 + bounce) * vn * dy;
          body.vx *= friction;
          body.vy *= friction;
        }
      }
    }
    return maxImpact;
  }

  _progressAndRescue() {
    const p = this.ents.player;
    let best = Infinity, bestT = 0, bestCorr = -1, bestPt = null, bestW = 0;
    for (let ci = 0; ci < this.geom.corridors.length; ci++) {
      const c = this.geom.corridors[ci];
      for (let i = 0; i < c.samples.length; i++) {
        const s = c.samples[i];
        const d2 = (s.x - p.x) * (s.x - p.x) + (s.y - p.y) * (s.y - p.y);
        if (d2 < best) {
          best = d2; bestCorr = ci; bestPt = s; bestW = c.w[i];
          bestT = i / (c.samples.length - 1);
        }
      }
    }
    const d = Math.sqrt(best);
    if (bestPt && d > bestW * 1.7) {
      // Escaped through a geometry seam — pull gently back into the cave.
      const dx = (bestPt.x - p.x) / d, dy = (bestPt.y - p.y) / d;
      p.vx += dx * 420 * 0.5;
      p.vy += dy * 420 * 0.5;
    }
    if (this.mode === 'story' && bestCorr === 0 && bestT > this.lastProgress) {
      this.lastProgress = bestT;
      if (this.def.hints) {
        for (const h of this.def.hints) {
          if (bestT >= h.t && !this.hintsShown.has(h.t)) {
            this.hintsShown.add(h.t);
            if (this.cb.onHint) this.cb.onHint(h.text);
          }
        }
      }
    }
  }

  _damage(srcX, srcY, source = 'urchin') {
    this.lastDamageSource = source;
    const p = this.ents.player;
    p.hearts--;
    p.invuln = TUNING.invulnTime;
    let dx = p.x - srcX, dy = p.y - srcY;
    const dl = Math.hypot(dx, dy) || 1;
    p.vx += (dx / dl) * 270;
    p.vy += (dy / dl) * 270;
    if (this.cb.onDamage) this.cb.onDamage(p.hearts, srcX, srcY);
    if (p.hearts <= 0) {
      p.dead = true;
      this.state = 'dying';
      this.stateT = 0;
      if (this.cb.onDeath) this.cb.onDeath();
    }
  }

  _stats() {
    const p = this.ents.player;
    return {
      motes: p.motes,
      moteTotal: this.ents.motes.length,
      pings: p.pings,
      time: this.time,
      hearts: p.hearts,
      depth: this.mode === 'abyss'
        ? Math.max(0, Math.floor((p.y - this.abyss.startY) / TUNING.abyssDepthPerMeter))
        : 0,
      lastHit: this.lastDamageSource || null,
    };
  }
}

export function calcStars(def, stats) {
  let stars = 1;
  const need = Math.ceil((def.stars?.motePct || 1) * stats.moteTotal);
  if (stats.moteTotal === 0 || stats.motes >= need) stars++;
  if (stats.pings <= (def.stars?.maxPings || Infinity)) stars++;
  return stars;
}

// In-level game logic: physics, ping/reveal, AI, damage, win/lose, drawing.
// The shell (main.js) owns screens/audio/haptics and listens via callbacks.

import { TUNING, CHAIN_BLOOM_AT, chainTierIndex } from './config.js';
import { buildLevelGeometry, updateReveal, pingRevealSweep, auraReveal } from './level.js';
import { setupEntities } from './entities.js';
import { closestOnSegment, dist, clamp, mulberry32, damp } from './util.js';
import { MILESTONES } from './gameservices.js';

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
    this.chainDisplay = 0;   // fractional tier index; rises fast, cools slow
    this.auraScale = 1;
    this.decayScale = 1;
    this.boon = null;        // what banked light bought at this gate, if any
    this.silentSongs = 0;    // songs that push you but make no sound
    this.orbitT = 0;         // seconds of leviathan orbit still drawn for you
    // Abyss
    this.abyss = null;
  }

  // ---- lifecycle ----
  // `boon` is what the player's banked light buys at a gate. Always passive, and
  // always optional — a gate is beatable with boon null.
  startStory(def, checkpoint = null, boon = null) {
    this.mode = 'story';
    this.def = def;
    this.boon = boon;
    this.auraScale = (def.auraScale || 1) * (1 + (boon?.aura || 0));
    this.decayScale = (def.decayScale || 1) * (1 - (boon?.decay || 0));
    this.silentSongs = boon?.silentSongs || 0;
    this.orbitT = boon?.orbitSecs || 0;
    this.geom = buildLevelGeometry(def);
    this.ents = setupEntities(def, this.geom);
    if (boon?.revealLures) {
      // Carried light shows a lure for what it is before it ever springs.
      for (const l of this.ents.lures) l.reveal = Math.max(l.reveal, 1);
    }
    this._resetRun(checkpoint);
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
      milestonesFired: new Set(),
    };
    this._extendAbyss();
    this._extendAbyss();
    this._rebuildAbyssGeometry();
    this._resetRun();
  }

  _resetRun(checkpoint = null) {
    this.pings.length = 0;
    this.time = 0;
    this.timeScale = 1;
    this.state = 'intro';
    this.stateT = 0;
    this.lastProgress = 0;
    this.hintsShown = new Set();
    this.pingCooldown = 0;
    this.moteCombo = 0;
    this.chainDisplay = 0;
    this.checkpoint = null;
    this.checkpointArmed = this.mode === 'story' && this.def?.checkpoint != null;
    if (checkpoint) this._restoreCheckpoint(checkpoint);
    // Free wake pulse so the player always starts seeing something.
    this._emitPing(this.ents.player.x, this.ents.player.y - 1, { free: true });
  }

  // A boss checkpoint is a save state, not a shortcut: the run resumes with the
  // motes, songs and clock it had at the lair mouth. Only the hearts come back,
  // so the fight is the room and never the swim back to it.
  _snapshotAt(progress) {
    const p = this.ents.player;
    return {
      x: p.x, y: p.y,
      motes: p.motes, pings: p.pings, time: this.time,
      progress,
      hintsShown: [...this.hintsShown],
      motesTaken: this.ents.motes.map((m) => m.taken),
      heartsTaken: this.ents.heartMotes.map((m) => m.taken),
    };
  }

  _restoreCheckpoint(cp) {
    const p = this.ents.player;
    p.x = cp.x; p.y = cp.y; p.vx = 0; p.vy = 0;
    p.motes = cp.motes; p.pings = cp.pings;
    this.time = cp.time;
    this.lastProgress = cp.progress;
    this.hintsShown = new Set(cp.hintsShown);
    this.ents.motes.forEach((m, i) => { if (cp.motesTaken[i]) m.taken = true; });
    this.ents.heartMotes.forEach((m, i) => { if (cp.heartsTaken[i]) m.taken = true; });
    this.checkpoint = cp;      // still there if the room takes you again
    this.checkpointArmed = false;
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
    // Gentle narrowing: reaches its floor around 1350m instead of 800m.
    return Math.max(TUNING.abyssMinWidth / 2 + 35, TUNING.abyssStartWidth / 2 + 60 - m * 0.07);
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
      const urchinChance = clamp(0.09 + depthM * 0.0006, 0, 0.42);
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
      const hunterChance = depthM < 100 ? 0 : clamp(0.04 + depthM * 0.00035, 0, 0.22);
      if (rng() < hunterChance) {
        newHunters.push({
          x: wx, y: wy, vx: 0, vy: 0, homeX: wx, homeY: wy,
          wanderR: 160, fast: depthM > 700 && rng() < 0.3,
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
        // The Abyss speaks chapter 1's vocabulary only.
        currents: [], lures: [], crystals: [], heartMotes: [], leviathans: [],
        vent: null,
      };
    } else {
      const cullY = this.ents.player.y - 1600;
      this.ents.motes = this.ents.motes.filter((m) => m.y > cullY).concat(newMotes);
      this.ents.urchins = this.ents.urchins.filter((u) => u.y > cullY).concat(newUrchins);
      this.ents.hunters = this.ents.hunters.filter((h) => h.y > cullY).concat(newHunters);
    }
  }

  // Motes feed the lume's glow: aura widens with each one gathered this run.
  effectiveAura() {
    const bonus = Math.min(this.ents.player.motes * TUNING.moteGlowPerMote, TUNING.moteGlowCap);
    return this.auraScale * (1 + bonus);
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
    // Banked light spends itself here: the song still carries you, it just
    // makes no sound. Costs no input and nothing to remember.
    const quiet = this.silentSongs > 0;
    if (quiet) {
      this.silentSongs--;
      if (this.cb.onSilentSong) this.cb.onSilentSong(this.silentSongs);
    }
    this._emitPing(p.x, p.y, { free: quiet });
    if (this.cb.onPing) this.cb.onPing(dy);
  }

  // How much of a song survives being sung here. A hush zone swallows most of
  // it, so the answer is baked in at the moment of emission rather than while
  // the ring travels — you are punished for singing *inside* the hush, not for
  // the ring happening to cross one on its way out.
  hushFactor(x, y) {
    let f = 1;
    for (const h of this.ents.hushZones || []) {
      const d = dist(x, y, h.x, h.y);
      if (d < h.r) f = Math.min(f, 1 - h.depth * (1 - d / h.r));
    }
    // Light carried in from the depths behind a gate keeps part of your voice
    // alive in water that would otherwise swallow all of it.
    const relief = this.boon?.hushRelief || 0;
    if (relief > 0) f = f + (1 - f) * relief;
    return Math.max(TUNING.hushMinFactor, f);
  }

  _emitPing(x, y, { free = false }) {
    this.pings.push({ x, y, r: 6, prevR: 0, free, strength: this.hushFactor(x, y) });
    // Free light — the wake pulse, a chain bloom, a crystal's answer — carries
    // no sound, so nothing in the dark turns toward it.
    if (!free) this._wakeListeners(x, y);
  }

  // Everything that listens, hears. Hunters within their own range; leviathans
  // from much further, because the trench is theirs.
  _wakeListeners(x, y, radius = 0, silent = false) {
    for (const h of this.ents.hunters) {
      if (dist(h.x, h.y, x, y) < (radius || TUNING.hunterSenseRadius)) {
        this._alertHunter(h, x, y, silent);
      }
    }
    // A warden does not chase what it hears — it aims at it, and commits.
    for (const w of this.ents.wardens || []) {
      if (dist(w.x, w.y, x, y) > TUNING.wardenReach * 1.6) continue;
      w.heardX = x; w.heardY = y;
      if (w.state === 'listen') {
        w.state = 'wind';
        w.t = TUNING.wardenWindup;
        if (this.cb.onWardenWake) this.cb.onWardenWake(w.x, w.y);
      }
    }
    for (const lv of this.ents.leviathans) {
      // A deaf leviathan ignores song entirely; only a shatter reaches it.
      // `loud` is set by breaking ice, which is the only thing it can feel.
      if (lv.deaf && !this._loudWake) continue;
      if (dist(lv.x, lv.y, x, y) < (radius || TUNING.leviathanSenseRadius)) {
        const wasCalm = lv.state !== 'hunt';
        lv.state = 'hunt';
        lv.alertT = 0;
        lv.targetX = x; lv.targetY = y;
        if (wasCalm && this.cb.onLeviathanWake) this.cb.onLeviathanWake(lv.x, lv.y);
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
    if (this.orbitT > 0) this.orbitT = Math.max(0, this.orbitT - dt);
    if (this.pingCooldown > 0) this.pingCooldown -= rawDt;
    if (this.comboT > 0) { this.comboT -= dt; if (this.comboT <= 0) this.moteCombo = 0; }
    // Chain color rises the instant you collect, then cools over ~2s.
    const targetTier = chainTierIndex(this.moteCombo);
    const rate = targetTier > this.chainDisplay ? 16 : 1.7;
    this.chainDisplay += (targetTier - this.chainDisplay) * damp(rate, dt);

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
        // Loud thud: whatever is near investigates the noise.
        this._wakeListeners(p.x, p.y, 260, true);
      }
      if (p.invuln > 0) p.invuln -= dt;
      p.breathe += dt;
    }

    // ---- pings ----
    for (let i = this.pings.length - 1; i >= 0; i--) {
      const ping = this.pings[i];
      ping.prevR = ping.r;
      ping.r += TUNING.pingRingSpeed * dt;
      pingRevealSweep(this.geom.store, ping.x, ping.y, ping.prevR, ping.r, ping.strength ?? 1);
      this._revealEntities(ping);
      if (ping.r > TUNING.pingMaxRadius) this.pings.splice(i, 1);
    }

    // ---- reveal decay + aura ----
    updateReveal(this.geom.store, dt, TUNING.pingRevealDecay * this.decayScale);
    const auraNow = this.effectiveAura();
    auraReveal(this.geom.store, this.geom.hash, p.x, p.y,
      TUNING.auraRadius * auraNow, TUNING.auraStrength);
    // Fairness: things close to the player are never fully invisible.
    const auraR = TUNING.auraRadius * auraNow * 1.35;
    const auraTouch = (e, scale = 1) => {
      const d = dist(e.x, e.y, p.x, p.y);
      if (d < auraR) e.reveal = Math.max(e.reveal, (1 - d / auraR) * scale);
    };
    for (const m of this.ents.motes) if (!m.taken) auraTouch(m, 0.9);
    for (const u of this.ents.urchins) auraTouch(u, 0.95);
    for (const h of this.ents.hunters) auraTouch(h, 0.9);
    // A baiting lure is deliberately exempt: your own glow shows you the light,
    // but only a song's echo brings back the shape behind it.
    for (const l of this.ents.lures) if (l.state !== 'bait') auraTouch(l, 0.95);
    for (const c of this.ents.crystals) auraTouch(c, 1);
    for (const m of this.ents.heartMotes) if (!m.taken) auraTouch(m, 0.9);
    for (const ice of this.ents.ice || []) if (!ice.broken) auraTouch(ice, 1);
    for (const lv of this.ents.leviathans) auraTouch(lv, 0.85);
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
        // Deep chains bloom: a silent reveal pulse. Light, not noise —
        // it costs no song and wakes nothing.
        if (this.moteCombo >= CHAIN_BLOOM_AT && (this.moteCombo - CHAIN_BLOOM_AT) % 4 === 0) {
          this._emitPing(p.x, p.y, { free: true });
          if (this.cb.onChainBloom) this.cb.onChainBloom(this.moteCombo, p.x, p.y);
        }
        if (this.mode === 'story' && p.motes === this.ents.motes.length &&
            this.cb.onAllMotes) this.cb.onAllMotes(m.x, m.y);
      }
    }

    // ---- brittle ice ----
    // Costs no hearts and blocks nothing. It just breaks, loudly, and every ear
    // in the level turns toward the sound you did not choose to make.
    for (const ice of this.ents.ice || []) {
      if (ice.broken) { ice.t += dt; continue; }
      if (ice.reveal > 0) ice.reveal = Math.max(0, ice.reveal - dt * 0.2);
      if (this.state !== 'play' || p.dead) continue;
      if (dist(p.x, p.y, ice.x, ice.y) < TUNING.iceRadius + TUNING.playerRadius) {
        ice.broken = true;
        ice.t = 0;
        // A shatter is felt, not heard — it is the one thing a deaf boss notices.
        this._loudWake = true;
        this._wakeListeners(ice.x, ice.y, TUNING.iceNoiseRadius);
        this._loudWake = false;
        if (this.cb.onIceBreak) this.cb.onIceBreak(ice.x, ice.y);
      }
    }

    // ---- warm vents ----
    // Rising water: it carries you where a song would have, and the warmth
    // itself is light. Free light, so it makes no sound and nothing turns.
    for (const w of this.ents.warmVents || []) {
      const d = dist(p.x, p.y, w.x, w.y);
      if (d < w.r && !p.dead) {
        // Carried light lets you hold your line instead of being thrown.
        const steady = this.boon?.iceSteady ? 0.55 : 1;
        const f = 1 - d / w.r;
        p.vx += w.dirX * w.strength * f * dt * steady;
        p.vy += w.dirY * w.strength * f * dt * steady;
      }
      w.emitT -= dt;
      if (w.emitT <= 0) {
        w.emitT = TUNING.warmPingEvery;
        this._emitPing(w.x, w.y, { free: true });
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

    // ---- lures ----
    // Bait, snap, haul back. The snap is the loudest thing in the level, so
    // taking the bait is never just a heart — it tells the room where you are.
    for (const l of this.ents.lures) {
      if (l.reveal > 0) l.reveal = Math.max(0, l.reveal - dt * 0.2);
      const d = dist(l.x, l.y, p.x, p.y);
      if (l.state === 'bait') {
        l.phase += dt;
        if (!p.dead && this.state === 'play' && d < TUNING.lureBaitRadius) {
          l.state = 'lunge';
          l.t = TUNING.lureLungeTime;
          l.snapped = true;
          l.reveal = 1;
          const inv = 1 / (d || 1);
          l.vx = (p.x - l.x) * inv * TUNING.lureLungeSpeed;
          l.vy = (p.y - l.y) * inv * TUNING.lureLungeSpeed;
          this._wakeListeners(l.x, l.y, TUNING.lureNoiseRadius, true);
          if (this.cb.onLureSnap) this.cb.onLureSnap(l.x, l.y);
        }
      } else if (l.state === 'lunge') {
        l.t -= dt;
        l.x += l.vx * dt;
        l.y += l.vy * dt;
        this._resolveCircleWalls(l, 8, 0, 0.5);
        if (l.t <= 0) { l.state = 'recover'; l.t = TUNING.lureRecoverTime; }
      } else {
        l.t -= dt;
        // Hauls back to its tether and goes dark until it's worth trusting again.
        const k = damp(2.4, dt);
        l.x += (l.homeX - l.x) * k;
        l.y += (l.homeY - l.y) * k;
        l.vx = 0; l.vy = 0;
        if (l.t <= 0 && d > TUNING.lureBaitRadius * 1.25) l.state = 'bait';
      }
      if (l.state !== 'recover' && !p.dead && p.invuln <= 0 &&
          dist(l.x, l.y, p.x, p.y) < TUNING.lureHitRadius + TUNING.playerRadius) {
        this._damage(l.x, l.y, 'lure');
        l.state = 'recover';
        l.t = TUNING.lureRecoverTime;
      }
    }

    // ---- bloom crystals ----
    for (const c of this.ents.crystals) {
      if (c.reveal > 0) c.reveal = Math.max(0, c.reveal - dt * 0.15);
      c.phase += dt;
      if (c.charge < 1) c.charge = Math.min(1, c.charge + dt / TUNING.crystalRecharge);
    }

    // ---- heart motes ----
    for (const m of this.ents.heartMotes) {
      if (m.taken) continue;
      if (m.reveal > 0) m.reveal = Math.max(0, m.reveal - dt * 0.2);
      m.beat += dt;
      // Only takes if it's needed — a full lume leaves it beating for later.
      if (!p.dead && this.state === 'play' && p.hearts < TUNING.maxHearts &&
          dist(m.x, m.y, p.x, p.y) < TUNING.heartMoteCollectRadius) {
        m.taken = true;
        p.hearts++;
        if (this.cb.onHeartMote) this.cb.onHeartMote(p.hearts, m.x, m.y);
      }
    }

    // ---- wardens ----
    // Anchored, so it cannot be outrun — only out-thought. It listens, aims at
    // your last song, telegraphs, then strikes down that line. Sing where you
    // are not and the whole fight opens up.
    for (const w of this.ents.wardens || []) {
      if (w.reveal > 0) w.reveal = Math.max(0, w.reveal - dt * 0.1);
      w.phase += dt;
      w.t -= dt;
      if (w.state === 'listen' || w.state === 'wind') {
        // Track the last thing it heard, but only so fast: a late song can pull
        // the jaw off you if you time it.
        w.wantAim = Math.atan2(w.heardY - w.y, w.heardX - w.x);
        let diff = ((w.wantAim - w.aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
        const step = TUNING.wardenTurnRate * dt;
        w.aim += clamp(diff, -step, step);
      }
      if (w.state === 'wind' && w.t <= 0) {
        w.state = 'strike'; w.t = TUNING.wardenStrike;
        if (this.cb.onWardenStrike) this.cb.onWardenStrike(w.x, w.y);
      } else if (w.state === 'strike') {
        w.reach = TUNING.wardenReach * (1 - Math.max(0, w.t) / TUNING.wardenStrike);
        if (w.t <= 0) { w.state = 'recover'; w.t = TUNING.wardenRecover; }
      } else if (w.state === 'recover') {
        w.reach += (0 - w.reach) * damp(6, dt);   // jaw draws back in
        if (w.t <= 0) { w.state = 'listen'; w.reach = 0; }
      }
      if (p.dead || p.invuln > 0) continue;
      // The body is always solid.
      if (dist(w.x, w.y, p.x, p.y) < TUNING.wardenRadius + TUNING.playerRadius) {
        this._damage(w.x, w.y, 'warden');
        continue;
      }
      // The strike only bites inside the open arc, and only while striking.
      if (w.state !== 'strike') continue;
      const d = dist(w.x, w.y, p.x, p.y);
      if (d > w.reach) continue;
      const toP = Math.atan2(p.y - w.y, p.x - w.x);
      let off = ((toP - w.aim + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      if (Math.abs(off) < TUNING.wardenJawWidth * 0.5) this._damage(w.x, w.y, 'warden');
    }

    // ---- leviathans ----
    for (const lv of this.ents.leviathans) {
      if (lv.reveal > 0) lv.reveal = Math.max(0, lv.reveal - dt * 0.12);
      lv.phase += dt;
      const speed = (lv.state === 'hunt' ? TUNING.leviathanHuntSpeed : TUNING.leviathanPatrolSpeed)
        * lv.speedScale;
      if (lv.state === 'patrol') {
        // A readable orbit: learn the loop and you can cross behind it.
        lv.angle += lv.spin * (speed / Math.max(lv.patrolR, 1)) * dt;
        lv.targetX = lv.homeX + Math.cos(lv.angle) * lv.patrolR;
        lv.targetY = lv.homeY + Math.sin(lv.angle) * lv.patrolR;
      } else {
        const dp = dist(lv.x, lv.y, p.x, p.y);
        if (dp < 260 && !p.dead) { lv.targetX = p.x; lv.targetY = p.y; }
        if (dist(lv.x, lv.y, lv.targetX, lv.targetY) < 50) {
          lv.alertT += dt;
          if (lv.alertT > TUNING.leviathanCalmTime) {
            lv.state = 'patrol';
            // Rejoin the orbit from wherever it drifted to, so the loop resumes
            // from the near side instead of snapping across the lair.
            lv.angle = Math.atan2(lv.y - lv.homeY, lv.x - lv.homeX);
          }
        }
      }
      let dx = lv.targetX - lv.x, dy = lv.targetY - lv.y;
      const dl = Math.hypot(dx, dy);
      if (dl > 6) {
        dx /= dl; dy /= dl;
        const k = damp(2.0, dt);
        lv.vx += (dx * speed - lv.vx) * k;
        lv.vy += (dy * speed - lv.vy) * k;
      }
      lv.x += lv.vx * dt;
      lv.y += lv.vy * dt;
      // Only the head collides, and softly — a body this size would wedge itself
      // in the first narrow the lair offers.
      this._resolveCircleWalls(lv, TUNING.leviathanBodyRadius, 0, 1);
      // Body follows the head at a fixed spacing (a swimming chain, not a smear).
      let px2 = lv.x, py2 = lv.y;
      for (const seg of lv.trail) {
        let sx = px2 - seg.x, sy = py2 - seg.y;
        const sl = Math.hypot(sx, sy);
        if (sl > 18) {
          seg.x += sx * (1 - 18 / sl);
          seg.y += sy * (1 - 18 / sl);
        }
        px2 = seg.x; py2 = seg.y;
      }
      if (!p.dead && p.invuln <= 0 &&
          dist(lv.x, lv.y, p.x, p.y) < TUNING.leviathanHitRadius + TUNING.playerRadius) {
        this._damage(lv.x, lv.y, 'leviathan', 460);
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

    // ---- abyss chunk extension + depth milestones ----
    if (this.mode === 'abyss') {
      const a = this.abyss;
      const lastY = a.waypoints[a.waypoints.length - 1][1];
      if (p.y > lastY - 1400) {
        this._extendAbyss();
        this._rebuildAbyssGeometry();
      }
      const depthM = (p.y - a.startY) / TUNING.abyssDepthPerMeter;
      for (const m of MILESTONES) {
        if (depthM >= m && !a.milestonesFired.has(m)) {
          a.milestonesFired.add(m);
          if (this.cb.onMilestone) this.cb.onMilestone(m);
        }
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
    // A song that touches a lure shows the tether behind the light. Sing before
    // you swallow and the trick stops working on you.
    for (const l of this.ents.lures) check(l, 10);
    for (const m of this.ents.heartMotes) if (!m.taken) check(m, 10);
    for (const lv of this.ents.leviathans) check(lv, TUNING.leviathanHeadRadius);
    // Ice has to be findable by song, or breaking it is bad luck rather than a
    // mistake you could have avoided.
    for (const ice of this.ents.ice || []) if (!ice.broken) check(ice, TUNING.iceRadius);
    // Crystals answer the song with light of their own: a free bloom from where
    // they stand, silent, so it reaches around the corner without waking anything.
    for (const c of this.ents.crystals) {
      const d = dist(c.x, c.y, ping.x, ping.y);
      if (d > ping.prevR - TUNING.crystalRadius && d <= ping.r + TUNING.crystalRadius) {
        c.reveal = 1;
        if (c.charge >= 1) {
          c.charge = 0;
          // Pushed onto this.pings, which the caller is walking backwards —
          // the new ring starts expanding next frame, not inside this one.
          this._emitPing(c.x, c.y, { free: true });
          if (this.cb.onCrystalBloom) this.cb.onCrystalBloom(c.x, c.y);
        }
      }
    }
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
      // Boss levels bank the run at the lair mouth.
      if (this.checkpointArmed && this.state === 'play' && bestT >= this.def.checkpoint) {
        this.checkpointArmed = false;
        this.checkpoint = this._snapshotAt(bestT);
        if (this.cb.onCheckpoint) this.cb.onCheckpoint();
      }
      if (this.def.hints) {
        for (const h of this.def.hints) {
          if (bestT >= h.t && !this.hintsShown.has(h.t)) {
            this.hintsShown.add(h.t);
            if (this.cb.onHint) this.cb.onHint(h.text, h.plain);
          }
        }
      }
    }
  }

  _damage(srcX, srcY, source = 'urchin', knock = 270) {
    this.lastDamageSource = source;
    const p = this.ents.player;
    p.hearts--;
    p.invuln = TUNING.invulnTime;
    let dx = p.x - srcX, dy = p.y - srcY;
    const dl = Math.hypot(dx, dy) || 1;
    p.vx += (dx / dl) * knock;
    p.vy += (dy / dl) * knock;
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

// What this depth is asking for, known before a single song is sung.
//
// The threshold is a fraction of whatever this level happens to hold, and both
// the fraction (0.6–0.8) and the field size vary per depth — so the number
// swings for reasons no player can see. Shown only on the results screen it
// read as random; a playtester hit that on three levels running. Same maths,
// stated up front.
export function starTargets(def, moteTotal) {
  return {
    motes: Math.ceil((def.stars?.motePct || 1) * moteTotal),
    pings: def.stars?.maxPings ?? Infinity,
  };
}

// Two stars, per criterion — the UI lights each by its own rule, never by count
// (a lit star must sit above the label it actually earned).
//
// Motes used to be the middle star. They are the gate economy now, so grading
// them here too would give one action two scoreboards. They get a light bar
// instead; `motes` stays in the breakdown only so older callers keep working.
export function starBreakdown(def, stats) {
  const need = starTargets(def, stats.moteTotal).motes;
  const vent = true; // you're at the results screen because you reached it
  const motes = stats.moteTotal === 0 || stats.motes >= need;
  const songs = stats.pings <= (def.stars?.maxPings ?? Infinity);
  return { vent, motes, songs, count: 1 + (songs ? 1 : 0) };
}

export const STARS_PER_LEVEL = 2;

export function calcStars(def, stats) {
  return starBreakdown(def, stats).count;
}

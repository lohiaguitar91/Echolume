// Test/debug API — exposed as window.__echo so gameplay can be driven and
// inspected headlessly (used for automated end-to-end verification).

import { LEVELS } from './levels.js';
import { TUNING } from './config.js';

export function installDebug(shell) {
  const api = {
    get state() { return shell.state; },
    get game() { return shell.game; },
    stats() {
      const g = shell.game;
      if (!g || !g.ents) return null;
      const p = g.ents.player;
      return {
        screen: shell.state,
        gameState: g.state,
        mode: g.mode,
        level: g.def ? g.def.id : null,
        x: Math.round(p.x), y: Math.round(p.y),
        vx: Math.round(p.vx), vy: Math.round(p.vy),
        hearts: p.hearts, motes: p.motes, pings: p.pings,
        moteTotal: g.ents.motes.length,
        segments: g.geom ? g.geom.store.n : 0,
        pingsActive: g.pings.length,
        hunters: g.ents.hunters.map((h) => ({ x: Math.round(h.x), y: Math.round(h.y), state: h.state })),
        lures: g.ents.lures.length,
        luresSprung: g.ents.lures.filter((l) => l.snapped).length,
        crystals: g.ents.crystals.length,
        crystalsSpent: g.ents.crystals.filter((c) => c.charge < 1).length,
        heartMotesLeft: g.ents.heartMotes.filter((m) => !m.taken).length,
        leviathans: g.ents.leviathans.map((l) => ({
          x: Math.round(l.x), y: Math.round(l.y), state: l.state,
        })),
        checkpoint: !!g.checkpoint,
        progress: +g.lastProgress.toFixed(3),
        time: +g.time.toFixed(1),
        fps: shell.fps,
      };
    },
    startLevel(id) { shell.debugStartLevel(id); return api.stats(); },
    startAbyss() { shell.debugStartAbyss(); return api.stats(); },
    tapWorld(x, y) { shell.game.tapAt(x, y); },
    tapToward(dx, dy) {
      const p = shell.game.ents.player;
      shell.game.tapAt(p.x + dx, p.y + dy);
    },
    teleport(t) {
      // Jump player to fraction t along the main path (story mode).
      const g = shell.game;
      const { samples } = g.geom.corridors[0];
      const i = Math.round(t * (samples.length - 1));
      const s = samples[i];
      g.ents.player.x = s.x; g.ents.player.y = s.y;
      g.ents.player.vx = 0; g.ents.player.vy = 0;
      return api.stats();
    },
    pathPoint(t) {
      const { samples } = shell.game.geom.corridors[0];
      const i = Math.round(t * (samples.length - 1));
      return { x: samples[i].x, y: samples[i].y };
    },
    winLevel() {
      const g = shell.game;
      const v = g.ents.vent;
      g.ents.player.x = v.x; g.ents.player.y = v.y;
      if (g.state === 'intro') g.state = 'play';
    },
    setHearts(n) { shell.game.ents.player.hearts = n; },
    godMode() { shell.game.ents.player.invuln = 1e9; },
    save() { return shell.save.data; },
    grantAllStars() {
      for (const lvl of LEVELS) shell.save.levelResult(lvl.id, 3, { motes: 999, pings: 0, time: 1 });
      shell.save.unlockAbyss();
      shell.save.persist();
      return shell.save.data;
    },
    resetSave() { shell.save.reset(); },

    // ---- autoplay harness ----
    // How every level is proved shippable: a naive path-follower driven by
    // direct game.update() calls, so rAF throttling never enters into it.
    // `god` isolates "is the vent reachable" from "can a bot that never dodges
    // survive"; run both.
    autoplay(id, opts = {}) {
      const g = shell.game;
      shell.debugStartLevel(id);
      const samples = g.geom.main.samples;
      const dt = 1 / 60;
      const maxSteps = (opts.seconds || 150) * 60;
      let steps = 0, tapT = 0, minHearts = shell.game.ents.player.hearts, huntFrames = 0;
      const t0 = performance.now();
      while (steps < maxSteps) {
        const p = g.ents.player;
        if (g.state === 'won' || p.dead) break;
        let bi = 0, bd = Infinity;
        for (let i = 0; i < samples.length; i++) {
          const dx = samples[i].x - p.x, dy = samples[i].y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < bd) { bd = d2; bi = i; }
        }
        const ti = Math.min(samples.length - 1, bi + (opts.look || 7));
        let tx = samples[ti].x, ty = samples[ti].y;
        // Minimal competence: steer around thorns and baited lures rather than
        // swimming through them. A bot that eats every hazard proves nothing
        // about whether a level is fair.
        if (opts.dodge !== false) {
          let ox = 0, oy = 0;
          const shove = (e) => {
            const dx = tx - e.x, dy = ty - e.y;
            const d = Math.hypot(dx, dy);
            if (d < 84 && d > 0.01) { ox += (dx / d) * (84 - d); oy += (dy / d) * (84 - d); }
          };
          for (const u of g.ents.urchins) shove(u);
          for (const l of g.ents.lures) if (l.state !== 'recover') shove(l);
          // A warden is a large solid anchor; swimming into one proves nothing.
          for (const w of g.ents.wardens || []) shove(w);
          // Never steer so hard it aims into rock.
          const cap = g.geom.main.w[ti] * 0.65;
          const ol = Math.hypot(ox, oy);
          if (ol > cap) { ox *= cap / ol; oy *= cap / ol; }
          tx += ox; ty += oy;
        }
        tapT -= dt;
        if (tapT <= 0) { g.tapAt(tx, ty); tapT = opts.tapEvery || 0.28; }
        if (opts.god) p.invuln = 1e9;
        g.update(dt);
        steps++;
        if (p.hearts < minHearts) minHearts = p.hearts;
        if (g.ents.leviathans.some((lv) => lv.state === 'hunt')) huntFrames++;
      }
      const p = g.ents.player;
      const ms = performance.now() - t0;
      return {
        id, won: g.state === 'won', died: p.dead,
        secs: +(steps / 60).toFixed(1),
        motes: p.motes, moteTotal: g.ents.motes.length, pings: p.pings,
        minHearts, progress: +g.lastProgress.toFixed(2),
        luresSprung: g.ents.lures.filter((l) => l.snapped).length,
        crystalsSpent: g.ents.crystals.filter((c) => c.charge < 1).length,
        heartMotesLeft: g.ents.heartMotes.filter((m) => !m.taken).length,
        leviathanHuntFrames: huntFrames,
        checkpoint: !!g.checkpoint,
        msPerStep: +(ms / Math.max(steps, 1)).toFixed(3),
      };
    },

    // Every authored entity must sit inside the cave, not in the rock beside
    // it — an offset one number too large is invisible until someone plays it.
    placementCheck(id) {
      const g = shell.game;
      shell.debugStartLevel(id);
      const clearance = (x, y) => {
        let best = Infinity;
        for (const c of g.geom.corridors) {
          for (let i = 0; i < c.samples.length; i++) {
            const d = Math.hypot(c.samples[i].x - x, c.samples[i].y - y) - c.w[i];
            if (d < best) best = d;   // negative = that far inside the wall line
          }
        }
        return best;
      };
      const bad = [];
      const chk = (kind, arr, need) => arr.forEach((o, i) => {
        const m = clearance(o.x, o.y);
        if (m > -need) bad.push({ kind, i, clearance: +m.toFixed(1) });
      });
      chk('mote', g.ents.motes, 14);
      chk('heartMote', g.ents.heartMotes, 16);
      chk('lure', g.ents.lures, 14);
      chk('crystal', g.ents.crystals, 6);
      chk('urchin', g.ents.urchins, 4);
      chk('hunter', g.ents.hunters, 6);
      chk('vent', [g.ents.vent], 20);
      // A warden is anchored and solid, so its whole body has to sit clear of
      // the wall or it silently plugs the corridor it is supposed to guard.
      chk('warden', g.ents.wardens || [], TUNING.wardenRadius + 10);
      // ...and it needs a lane past it: an anchored boss filling the seam is
      // not a fight, it is a wall.
      (g.ents.wardens || []).forEach((w, i) => {
        let widest = -Infinity;
        for (let a = 0; a < Math.PI * 2; a += 0.1) {
          const px = w.x + Math.cos(a) * (TUNING.wardenRadius + TUNING.playerRadius + 18);
          const py = w.y + Math.sin(a) * (TUNING.wardenRadius + TUNING.playerRadius + 18);
          widest = Math.max(widest, -clearance(px, py));
        }
        if (widest < 26) bad.push({ kind: 'wardenLane', i, gap: +widest.toFixed(1) });
      });
      // A leviathan's whole orbit has to fit its lair, not just its centre.
      g.ents.leviathans.forEach((lv, i) => {
        let worst = -Infinity, worstAng = 0;
        for (let a = 0; a < Math.PI * 2; a += 0.15) {
          const m = clearance(lv.homeX + Math.cos(a) * lv.patrolR, lv.homeY + Math.sin(a) * lv.patrolR);
          if (m > worst) { worst = m; worstAng = a; }
        }
        if (worst > -20) bad.push({ kind: 'leviathanOrbit', i, ang: +worstAng.toFixed(2), clearance: +worst.toFixed(1) });
      });
      return { id, bad };
    },

    // The whole game, both ways, in one call.
    verifyAll(opts = {}) {
      const ids = opts.ids || LEVELS.map((l) => l.id);
      return ids.map((id) => {
        const place = api.placementCheck(id);
        const reach = api.autoplay(id, { god: true });
        const live = api.autoplay(id, {});
        return {
          id,
          placement: place.bad.length ? place.bad : 'ok',
          reachable: reach.won,
          botSurvives: live.won,
          botMinHearts: live.minHearts,
          secs: reach.secs,
          pings: reach.pings,
        };
      });
    },
    setTimeScale(s) { shell.debugTimeScale = s; },
    screen(name) { shell.debugShowScreen(name); },
    renderNow(dt = 1 / 60) { shell._tick(dt); },
    canvasShot() { return document.getElementById('game').toDataURL('image/png'); },
    audioState() {
      const a = shell.audio;
      return {
        ctx: a.ctx ? a.ctx.state : 'none',
        music: !!a._musicNodes,
        enabled: { ...a.enabled },
        threat: a.threat,
      };
    },
    shell,
  };
  window.__echo = api;
}

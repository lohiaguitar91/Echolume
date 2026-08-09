// Test/debug API — exposed as window.__echo so gameplay can be driven and
// inspected headlessly (used for automated end-to-end verification).

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
      for (let i = 1; i <= 14; i++) shell.save.levelResult(i, 3, { motes: 99, pings: 0, time: 1 });
      shell.save.unlockAbyss();
      shell.save.persist();
      return shell.save.data;
    },
    resetSave() { shell.save.reset(); },
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

// Pooled particle system. All particles are additive glow dots.

const MAX = 900;

export class Particles {
  constructor() {
    this.pool = new Array(MAX);
    for (let i = 0; i < MAX; i++) this.pool[i] = { alive: false };
    this.count = 0;
  }

  spawn(opts) {
    for (let i = 0; i < MAX; i++) {
      const p = this.pool[i];
      if (!p.alive) {
        p.alive = true;
        p.x = opts.x; p.y = opts.y;
        p.vx = opts.vx || 0; p.vy = opts.vy || 0;
        p.life = p.maxLife = opts.life || 1;
        p.r = opts.r || 3;
        p.shrink = opts.shrink !== undefined ? opts.shrink : true;
        p.drag = opts.drag !== undefined ? opts.drag : 1.6;
        p.gravity = opts.gravity || 0;
        p.color = opts.color;
        p.coreColor = opts.coreColor;
        p.alpha = opts.alpha !== undefined ? opts.alpha : 1;
        p.twinkle = opts.twinkle || 0;
        this.count++;
        return p;
      }
    }
    return null; // pool exhausted: drop silently
  }

  burst(x, y, color, n, speed, life, r, coreColor) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const m = speed * (0.35 + Math.random() * 0.65);
      this.spawn({
        x, y,
        vx: Math.cos(a) * m, vy: Math.sin(a) * m,
        life: life * (0.6 + Math.random() * 0.8),
        r: r * (0.6 + Math.random() * 0.8),
        color, coreColor,
      });
    }
  }

  update(dt) {
    for (let i = 0; i < MAX; i++) {
      const p = this.pool[i];
      if (!p.alive) continue;
      p.life -= dt;
      if (p.life <= 0) { p.alive = false; this.count--; continue; }
      const d = Math.exp(-p.drag * dt);
      p.vx *= d; p.vy *= d;
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  }

  draw(renderer, time) {
    for (let i = 0; i < MAX; i++) {
      const p = this.pool[i];
      if (!p.alive) continue;
      const t = p.life / p.maxLife;
      let a = p.alpha * t;
      if (p.twinkle) a *= 0.7 + 0.3 * Math.sin(time * p.twinkle + i * 1.7);
      const r = p.shrink ? p.r * (0.3 + 0.7 * t) : p.r;
      renderer.glowDot(p.x, p.y, r, p.color, a, p.coreColor);
    }
  }

  clear() {
    for (let i = 0; i < MAX; i++) this.pool[i].alive = false;
    this.count = 0;
  }
}

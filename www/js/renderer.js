// Canvas renderer: DPR-correct sizing, camera transform, prerendered glow sprites.
// No shadowBlur anywhere (too slow on mobile) — all glow is composited sprite/stroke passes.

import { damp, clamp } from './util.js';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false });
    this.w = 0; this.h = 0; this.dpr = 1;
    this.cam = { x: 0, y: 0, zoom: 1, targetX: 0, targetY: 0, shake: 0, shakeX: 0, shakeY: 0 };
    this._bg = null;
    this._glowCache = new Map();
    this.palette = null;
    this.reducedMotion = false;
    this._resizeQueued = false;
    window.addEventListener('resize', () => this.resize());
    this.resize();
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    // Hidden panes can report 0x0 — keep the old backing store until we're visible again.
    if (w === 0 || h === 0) { this._resizeQueued = true; return; }
    this._resizeQueued = false;
    this.dpr = clamp(window.devicePixelRatio || 1, 1, 3);
    this.w = w; this.h = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this._bg = null; // rebuild gradient at new size
  }

  ensureSized() { if (this._resizeQueued) this.resize(); }

  setPalette(p) { this.palette = p; this._bg = null; this._glowCache.clear(); }

  // ---- camera ----
  updateCamera(dt, camLerp) {
    const c = this.cam;
    const k = damp(camLerp, dt);
    c.x += (c.targetX - c.x) * k;
    c.y += (c.targetY - c.y) * k;
    if (c.shake > 0) {
      c.shake = Math.max(0, c.shake - dt * 3.2);
      const a = Math.random() * Math.PI * 2;
      const m = this.reducedMotion ? 0 : c.shake * c.shake * 10;
      c.shakeX = Math.cos(a) * m; c.shakeY = Math.sin(a) * m;
    } else { c.shakeX = 0; c.shakeY = 0; }
  }

  addShake(amount) { this.cam.shake = Math.min(1, this.cam.shake + amount); }

  worldToScreen(wx, wy) {
    const c = this.cam;
    return {
      x: (wx - c.x - c.shakeX) * c.zoom + this.w / 2,
      y: (wy - c.y - c.shakeY) * c.zoom + this.h / 2,
    };
  }

  screenToWorld(sx, sy) {
    const c = this.cam;
    return {
      x: (sx - this.w / 2) / c.zoom + c.x + c.shakeX,
      y: (sy - this.h / 2) / c.zoom + c.y + c.shakeY,
    };
  }

  // Is a world-space circle possibly visible?
  inView(wx, wy, r) {
    const s = this.worldToScreen(wx, wy);
    const rr = r * this.cam.zoom;
    return s.x + rr > -40 && s.x - rr < this.w + 40 && s.y + rr > -40 && s.y - rr < this.h + 40;
  }

  // ---- frame ----
  begin() {
    this.ensureSized();
    const ctx = this.ctx;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    if (!this._bg) this._buildBg();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.drawImage(this._bg, 0, 0, this.w, this.h);
  }

  _buildBg() {
    const c = document.createElement('canvas');
    const W = 128, H = 1024; // tall enough that dark-gradient banding disappears
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    const grad = g.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, this.palette.bgTop);
    grad.addColorStop(1, this.palette.bgBottom);
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    // Blue-noise-ish speckle breaks up remaining banding (invisible as texture).
    const img = g.getImageData(0, 0, W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 5;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    g.putImageData(img, 0, 0);
    const vg = g.createRadialGradient(W / 2, H / 2, H * 0.18, W / 2, H / 2, H * 0.62);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.32)');
    g.fillStyle = vg;
    g.fillRect(0, 0, W, H);
    this._bg = c;
  }

  // ---- glow sprites ----
  // Returns an offscreen canvas: soft radial glow of `color` with bright core.
  glowSprite(color, coreColor) {
    const key = color + '|' + (coreColor || '');
    let s = this._glowCache.get(key);
    if (s) return s;
    const SIZE = 64, R = SIZE / 2;
    const c = document.createElement('canvas');
    c.width = SIZE; c.height = SIZE;
    const g = c.getContext('2d');
    const grad = g.createRadialGradient(R, R, 0, R, R, R);
    grad.addColorStop(0, coreColor || '#ffffff');
    grad.addColorStop(0.18, color);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grad;
    g.fillRect(0, 0, SIZE, SIZE);
    this._glowCache.set(key, c);
    return c;
  }

  // Additive glow dot at world position.
  glowDot(wx, wy, r, color, alpha = 1, coreColor) {
    if (!this.inView(wx, wy, r * 2.5)) return;
    const s = this.worldToScreen(wx, wy);
    const px = r * this.cam.zoom * 2.5; // sprite spills past nominal radius
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = alpha;
    ctx.drawImage(this.glowSprite(color, coreColor), s.x - px, s.y - px, px * 2, px * 2);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // Additive two-pass glowing stroke along screen-space segment list [{x,y,a(lpha)}...].
  // Caller batches segments by color for performance.
  strokeGlowSegments(segs, width, color, coreColor) {
    if (segs.length === 0) return;
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    // halo pass
    ctx.strokeStyle = color;
    ctx.lineWidth = width * 3.2;
    for (const s of segs) {
      ctx.globalAlpha = s.a * 0.16;
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    }
    // core pass
    ctx.strokeStyle = coreColor;
    ctx.lineWidth = width;
    for (const s of segs) {
      ctx.globalAlpha = s.a * 0.85;
      ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }

  // A soft-edged filled region. Deliberately NOT additive: hush zones are
  // thicker water rather than more light, so this lifts the void toward a
  // murky grey instead of glowing. Warm vents use it at low alpha for haze.
  softDisc(wx, wy, radius, color, alpha) {
    if (!this.inView(wx, wy, radius)) return;
    const s = this.worldToScreen(wx, wy);
    const r = Math.max(1, radius * this.cam.zoom);
    const ctx = this.ctx;
    const g = ctx.createRadialGradient(s.x, s.y, r * 0.15, s.x, s.y, r);
    g.addColorStop(0, color);
    g.addColorStop(0.7, color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = alpha;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // Expanding ping ring (screen space, additive).
  ring(wx, wy, radius, thickness, color, alpha) {
    const s = this.worldToScreen(wx, wy);
    const r = radius * this.cam.zoom;
    if (s.x + r < -60 || s.x - r > this.w + 60 || s.y + r < -60 || s.y - r > this.h + 60) return;
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = color;
    ctx.globalAlpha = alpha * 0.5;
    ctx.lineWidth = thickness * 2.6;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = alpha;
    ctx.lineWidth = thickness;
    ctx.beginPath(); ctx.arc(s.x, s.y, r, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
  }
}

/* Holocron UI — starfield: a depth-projected ambient star canvas with pointer parallax,
   and the hyperspace jump used for view transitions.
   Perf rules learned the hard way: own layer, capped fps, DPR 1, no filters, pause when
   hidden, static frame under prefers-reduced-motion. */
(function () {
  'use strict';
  const H = window.HOLO;
  const T = () => H.theme.t;

  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let cv, ctx, W = 0, Hh = 0;
  let stars = [];
  let mx = 0, my = 0;           // parallax target, -1..1
  let last = 0, raf = 0, alive = false;
  const FPS = 30, STEP = 1000 / FPS;

  const rand = (() => { let s = 987654321 >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; })();

  function resize() {
    W = window.innerWidth; Hh = window.innerHeight;
    cv.width = W; cv.height = Hh;                       // DPR 1 on purpose: dots don't need retina
    const want = Math.min(230, Math.round(W * Hh / 5800));
    while (stars.length < want) stars.push({ x: rand(), y: rand(), z: rand() * 0.9 + 0.1, tw: rand() * 6.28 });
    stars.length = want;
  }

  function project(s) {
    const depth = 0.24 + s.z * 1.9;                     // small z = near = spread wide
    const px = W / 2 + (s.x - 0.5) * W * 1.25 / depth + mx * (1 - s.z) * 16;
    const py = Hh / 2 + (s.y - 0.5) * Hh * 1.25 / depth + my * (1 - s.z) * 12;
    return { px, py, r: Math.max(0.4, 1.7 - s.z * 1.4), a: 0.12 + (1 - s.z) * 0.5 };
  }

  function frame(t) {
    if (!alive) return;
    raf = requestAnimationFrame(frame);
    if (t - last < STEP) return;
    last = t;
    ctx.clearRect(0, 0, W, Hh);
    for (const s of stars) {
      s.z -= 0.00028;                                    // slow drift toward the viewer
      if (s.z <= 0.06) { s.x = rand(); s.y = rand(); s.z = 1; }
      s.tw += 0.05;
      const p = project(s);
      if (p.px < -4 || p.px > W + 4 || p.py < -4 || p.py > Hh + 4) continue;
      ctx.globalAlpha = p.a * (0.75 + 0.25 * Math.sin(s.tw));
      const sc = T().starColors;
      ctx.fillStyle = s.z > 0.75 ? sc[0] : s.z < 0.25 ? sc[1] : sc[2];
      ctx.fillRect(p.px, p.py, p.r, p.r);
    }
    ctx.globalAlpha = 1;
  }

  function start() {
    if (alive || reduced()) return;
    alive = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { alive = false; cancelAnimationFrame(raf); }

  function init() {
    cv = document.createElement('canvas');
    cv.className = 'starfield';
    cv.setAttribute('aria-hidden', 'true');
    document.body.prepend(cv);
    ctx = cv.getContext('2d');
    resize();
    window.addEventListener('resize', resize);
    if (reduced()) {                                     // one calm, static frame
      for (const s of stars) { const p = project(s); ctx.globalAlpha = p.a; ctx.fillStyle = T().starColors[2]; ctx.fillRect(p.px, p.py, p.r, p.r); }
      ctx.globalAlpha = 1;
      return;
    }
    window.addEventListener('pointermove', e => {
      mx = (e.clientX / W - 0.5) * 2;
      my = (e.clientY / Hh - 0.5) * 2;
    }, { passive: true });
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
    start();
  }

  /* ── Hyperspace jump: streak burst over everything, switch mid-flash ── */
  let jumping = false;
  function jump(cb) {
    if (jumping || reduced()) { cb(); return; }
    jumping = true;
    const jc = document.createElement('canvas');
    jc.className = 'hyperspace';
    jc.width = window.innerWidth; jc.height = window.innerHeight;
    document.body.append(jc);
    const jx = jc.getContext('2d');
    const CX = jc.width / 2, CY = jc.height / 2;
    const R = Math.hypot(CX, CY);
    const streaks = [];
    for (let i = 0; i < 150; i++) {
      const a = rand() * 6.2832;
      streaks.push({ a, r0: 20 + rand() * R * 0.5, sp: 0.7 + rand() * 1.6, w: 0.6 + rand() * 1.5 });
    }
    const T = 460, t0 = performance.now();
    let switched = false;
    (function tick(now) {
      const p = Math.min((now - t0) / T, 1);
      if (!switched && p >= 0.42) { switched = true; cb(); }
      jx.clearRect(0, 0, jc.width, jc.height);
      jx.globalAlpha = p < 0.75 ? 1 : 1 - (p - 0.75) / 0.25;
      jx.globalCompositeOperation = 'lighter';
      const acc = p * p;
      for (const s of streaks) {
        const r1 = s.r0 + acc * R * 1.35 * s.sp;
        const r2 = s.r0 + Math.max(0, acc - 0.12) * R * 1.35 * s.sp;
        jx.strokeStyle = s.sp > 1.6 ? 'rgba(214,236,255,.9)' : 'rgba(150,190,235,.75)';
        jx.lineWidth = s.w * (0.5 + acc * 2);
        jx.beginPath();
        jx.moveTo(CX + Math.cos(s.a) * r2, CY + Math.sin(s.a) * r2);
        jx.lineTo(CX + Math.cos(s.a) * r1, CY + Math.sin(s.a) * r1);
        jx.stroke();
      }
      if (p < 1) requestAnimationFrame(tick);
      else { jc.remove(); jumping = false; }
    })(t0);
  }

  H.ui = H.ui || {};
  H.ui.starfield = { init, jump };
})();

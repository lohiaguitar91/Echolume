/* Holocron UI — relationship graph: canvas force-directed network with era/type/alignment
   filters, hover bios, selection focus, PNG export — and a 3D depth mode: z-axis physics,
   perspective projection with depth cueing, slow auto-orbit, drag-to-rotate, pinch zoom. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;
  const T = () => H.theme.t;

  const TYPES = [
    { id: 'character', label: 'Characters' },
    { id: 'faction', label: 'Factions' },
    { id: 'artifact', label: 'Artifacts' },
    { id: 'concept', label: 'Concepts' },
    { id: 'location', label: 'Worlds' },
    { id: 'event', label: 'Events' }
  ];
  const EDGE_COLOR = {
    killed: 'rgba(224,70,60,.55)', defeated: 'rgba(224,70,60,.3)', corrupted: 'rgba(143,111,216,.5)',
    trained: 'rgba(201,160,106,.6)', redeemed: 'rgba(88,166,242,.55)', bonded: 'rgba(88,166,242,.45)',
    spouse: 'rgba(88,166,242,.45)', kin: 'rgba(201,160,106,.4)', descendant: 'rgba(201,160,106,.4)',
    member: 'rgba(120,100,110,.25)', served: 'rgba(120,100,110,.3)', led: 'rgba(160,130,120,.35)',
    founded: 'rgba(160,130,120,.4)', 'took-part': 'rgba(100,88,96,.18)', 'occurred-at': 'rgba(100,88,96,.18)',
    'located-at': 'rgba(100,88,96,.25)'
  };

  const state = {
    types: new Set(['character', 'faction']),
    era: null,
    aligns: new Set(['sith', 'jedi', 'gray', 'neutral']),
    selected: null, hovered: null,
    mode3d: false
  };

  let canvas, ctx, frame, running = false;
  let nodes = [], nodeById = new Map(), links = [];
  let alpha = 1;
  let theta = 0.35;                 // 3D orbit angle
  let dragging = false;
  const posCache = new Map();
  let view = { k: 1, tx: 0, ty: 0 };
  let W = 900, Hh = 620, dpr = 1;
  const locEras = new Map();
  const FOV = 620;
  const PICK_PAD = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) ? 15 : 7;

  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };

  /* ── premium rendering: sprites, gradients, curves ── */
  let tNow = 0;                                       // seconds, drives ambient animation
  const _hex = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const hexA = (c, a2) => { const [r, g, b2] = _hex(c); return 'rgba(' + r + ',' + g + ',' + b2 + ',' + a2 + ')'; };
  const hexMix = (c1, c2, f) => {
    const x = _hex(c1), y = _hex(c2);
    return 'rgb(' + x.map((v, i) => Math.round(v + (y[i] - v) * f)).join(',') + ')';
  };
  const variantCache = new Map();
  function variants(col) {
    let v = variantCache.get(col);
    if (!v) {
      v = { core: hexMix(col, '#ffffff', .5), deep: hexMix(col, '#000000', .34), rim: hexMix(col, '#ffffff', .28) };
      variantCache.set(col, v);
    }
    return v;
  }
  const glowCache = new Map();
  function glowSprite(col, radius) {
    const size = Math.max(12, Math.min(220, Math.round(radius / 4) * 4));
    const key = col + '|' + size;
    let sp = glowCache.get(key);
    if (!sp) {
      sp = document.createElement('canvas'); sp.width = sp.height = size * 2;
      const g = sp.getContext('2d');
      const grad = g.createRadialGradient(size, size, 0, size, size, size);
      grad.addColorStop(0, hexA(col, .5));
      grad.addColorStop(.4, hexA(col, .15));
      grad.addColorStop(1, hexA(col, 0));
      g.fillStyle = grad; g.fillRect(0, 0, size * 2, size * 2);
      glowCache.set(key, sp);
    }
    return sp;
  }
  let bgLayer = null;                                 // vignette + dot grid, cached per size/skin
  function buildBg() {
    bgLayer = document.createElement('canvas');
    bgLayer.width = W; bgLayer.height = Hh;
    const g = bgLayer.getContext('2d');
    g.fillStyle = T().canvasBg; g.fillRect(0, 0, W, Hh);
    g.fillStyle = hexA(T().grid, .6);
    for (let y = 13; y < Hh; y += 26)
      for (let x = 13; x < W; x += 26) g.fillRect(x, y, 1, 1);
    const rad = g.createRadialGradient(W / 2, Hh * .42, 0, W / 2, Hh * .42, Math.max(W, Hh) * .74);
    rad.addColorStop(0, 'rgba(0,0,0,0)'); rad.addColorStop(1, 'rgba(0,0,0,.4)');
    g.fillStyle = rad; g.fillRect(0, 0, W, Hh);
  }
  function clearRenderCaches() { variantCache.clear(); glowCache.clear(); bgLayer = null; }
  function curveCP(ax, ay, bx, by, l) {
    const dx = bx - ax, dy = by - ay;
    const d = Math.sqrt(dx * dx + dy * dy) || 1;
    const k = Math.min(d * .16, 26) * (hash(l.s + l.t) > .5 ? 1 : -1);
    return { x: (ax + bx) / 2 - dy / d * k, y: (ay + by) / 2 + dx / d * k };
  }
  const qPoint = (t, ax, ay, qx, qy, bx, by) => {
    const u = 1 - t;
    return { x: u * u * ax + 2 * u * t * qx + t * t * bx, y: u * u * ay + 2 * u * t * qy + t * t * by };
  };
  function pillPath(c, x, y, w2, h2, r) {
    if (c.roundRect) { c.beginPath(); c.roundRect(x, y, w2, h2, r); return; }
    c.beginPath();
    c.moveTo(x + r, y); c.arcTo(x + w2, y, x + w2, y + h2, r); c.arcTo(x + w2, y + h2, x, y + h2, r);
    c.arcTo(x, y + h2, x, y, r); c.arcTo(x, y, x + w2, y, r); c.closePath();
  }

  function eraPass(n) {
    if (!state.era) return true;
    if (n.type === 'event') return n.era === state.era;
    if (n.type === 'location') return (locEras.get(n.id) || new Set()).has(state.era);
    return (n.eras || []).includes(state.era);
  }
  function alignPass(n) {
    if (n.type === 'event' || n.type === 'location') return true;
    return state.aligns.has(n.alignment || 'neutral');
  }

  function rebuild() {
    const visible = [...S.nodes.values()].filter(n => state.types.has(n.type) && eraPass(n) && alignPass(n));
    const visSet = new Set(visible.map(n => n.id));
    links = S.edges.filter(e => visSet.has(e.f) && visSet.has(e.t)).map(e => ({ s: e.f, t: e.t, r: e.r }));
    const deg = new Map();
    links.forEach(l => { deg.set(l.s, (deg.get(l.s) || 0) + 1); deg.set(l.t, (deg.get(l.t) || 0) + 1); });

    nodes = visible.filter(n => (deg.get(n.id) || 0) > 0 || n.id === state.selected).map(n => {
      const d = deg.get(n.id) || 0;
      const cached = posCache.get(n.id);
      /* chronological seeding: x by era midpoint, y by id hash, z scattered */
      const eras = S.erasOf(n);
      const mid = eras.length ? (eras[0].from + eras[eras.length - 1].to) / 2 : (n.type === 'event' ? n.year : -3000);
      const fx = (mid + 7100) / 7400;
      return {
        id: n.id, n, d,
        r: Math.max(4, Math.min(15, 3.5 + Math.sqrt(d) * 2.1)),
        x: cached ? cached.x : W * (0.08 + 0.84 * fx) + (hash(n.id) - .5) * 60,
        y: cached ? cached.y : Hh * (0.12 + 0.76 * hash(n.id + 'y')),
        z: cached && cached.z != null ? cached.z : (hash(n.id + 'z') - .5) * 300,
        vx: 0, vy: 0, vz: 0, fixed: false,
        px: 0, py: 0, ps: 1, zr: 0,
        born: (cached && cached.born) || performance.now()
      };
    });
    nodeById = new Map(nodes.map(nn => [nn.id, nn]));
    links = links.filter(l => nodeById.has(l.s) && nodeById.has(l.t));
    alpha = 1;
  }

  function physics() {
    const cx = W / 2, cy = Hh / 2;
    const n = nodes.length;
    const d3 = state.mode3d;
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y, dz = d3 ? b.z - a.z : 0;
        let d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < 1) { dx = (hash(a.id + j) - .5); dy = (hash(b.id + i) - .5); d2 = 1; }
        if (d2 > 78000) continue;
        const f = (d3 ? 2100 : 1450) / d2 * alpha;
        const d = Math.sqrt(d2);
        const ux = dx / d, uy = dy / d, uz = dz / d;
        a.vx -= ux * f; a.vy -= uy * f;
        b.vx += ux * f; b.vy += uy * f;
        if (d3) { a.vz -= uz * f; b.vz += uz * f; }
      }
    }
    links.forEach(l => {
      const a = nodeById.get(l.s), b = nodeById.get(l.t);
      const rest = l.r === 'trained' || l.r === 'killed' ? 74 : l.r === 'member' || l.r === 'took-part' ? 122 : 96;
      let dx = b.x - a.x, dy = b.y - a.y, dz = d3 ? b.z - a.z : 0;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
      const f = (d - rest) * 0.016 * alpha;
      const ux = dx / d, uy = dy / d, uz = dz / d;
      a.vx += ux * f; a.vy += uy * f;
      b.vx -= ux * f; b.vy -= uy * f;
      if (d3) { a.vz += uz * f; b.vz -= uz * f; }
    });
    nodes.forEach(p => {
      p.vx += (cx - p.x) * 0.012 * alpha;
      p.vy += (cy - p.y) * 0.017 * alpha;
      if (d3) p.vz += (0 - p.z) * 0.008 * alpha;
      if (p.fixed) { p.vx = 0; p.vy = 0; p.vz = 0; return; }
      p.vx *= 0.85; p.vy *= 0.85; p.vz *= 0.85;
      const vmax = 9;
      p.vx = Math.max(-vmax, Math.min(vmax, p.vx));
      p.vy = Math.max(-vmax, Math.min(vmax, p.vy));
      p.vz = Math.max(-vmax, Math.min(vmax, p.vz));
      p.x += p.vx; p.y += p.vy;
      if (d3) p.z += p.vz;
      posCache.set(p.id, { x: p.x, y: p.y, z: p.z, born: p.born });
    });
    alpha = Math.max(alpha * 0.994, 0);
  }

  /* Perspective projection into p.px/p.py/p.ps (scale) / p.zr (depth for sorting). */
  function projectAll() {
    const cx = W / 2, cy = Hh / 2;
    if (!state.mode3d) {
      nodes.forEach(p => { p.px = p.x; p.py = p.y; p.ps = 1; p.zr = 0; });
      return;
    }
    const cos = Math.cos(theta), sin = Math.sin(theta);
    nodes.forEach(p => {
      const dx = p.x - cx;
      const xr = dx * cos - p.z * sin;
      const zr = dx * sin + p.z * cos;
      const s = FOV / (FOV + zr);
      p.px = cx + xr * s;
      p.py = cy + (p.y - cy) * s;
      p.ps = s; p.zr = zr;
    });
  }

  function shapePath(c, x, y, r, t) {
    c.beginPath();
    if (t === 'character') c.arc(x, y, r, 0, 6.2832);
    else if (t === 'faction') {
      for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; const qx = x + r * 1.18 * Math.cos(a), qy = y + r * 1.18 * Math.sin(a); i ? c.lineTo(qx, qy) : c.moveTo(qx, qy); }
      c.closePath();
    } else if (t === 'artifact') {
      c.moveTo(x, y - r * 1.25); c.lineTo(x + r * 1.15, y + r * 0.95); c.lineTo(x - r * 1.15, y + r * 0.95); c.closePath();
    } else if (t === 'concept') {
      c.moveTo(x, y - r * 1.25); c.lineTo(x + r * 1.25, y); c.lineTo(x, y + r * 1.25); c.lineTo(x - r * 1.25, y); c.closePath();
    } else if (t === 'location') { c.arc(x, y, r * 1.05, 0, 6.2832); }
    else { c.rect(x - r * .9, y - r * .9, r * 1.8, r * 1.8); }
  }

  const depthAlpha = p => state.mode3d ? Math.max(0.25, Math.min(1, (p.ps - 0.55) / 0.6)) : 1;

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!bgLayer) buildBg();
    ctx.drawImage(bgLayer, 0, 0);
    ctx.translate(view.tx, view.ty);
    ctx.scale(view.k, view.k);

    projectAll();
    const sel = state.selected ? nodeById.get(state.selected) : null;
    const selN = sel ? new Set([sel.id, ...S.neighbors(sel.id).map(x => x.other)]) : null;
    const nowMs = performance.now();

    /* ── edges: curved; the selected node's own edges get color gradients + flow pulses ── */
    links.forEach(l => {
      const a = nodeById.get(l.s), b = nodeById.get(l.t);
      const lit = sel && (a.id === sel.id || b.id === sel.id);
      const dim = selN && !lit;
      const da = Math.min(depthAlpha(a), depthAlpha(b));
      const cp = curveCP(a.px, a.py, b.px, b.py, l);
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.quadraticCurveTo(cp.x, cp.y, b.px, b.py);
      if (lit) {
        const grad = ctx.createLinearGradient(a.px, a.py, b.px, b.py);
        grad.addColorStop(0, hexA(A().colorOf(a.n), .85));
        grad.addColorStop(1, hexA(A().colorOf(b.n), .85));
        ctx.strokeStyle = grad;
        ctx.globalAlpha = da;
        ctx.lineWidth = 1.7 / view.k;
      } else {
        ctx.strokeStyle = EDGE_COLOR[l.r] || 'rgba(120,100,110,.3)';
        ctx.globalAlpha = (dim ? 0.05 : 0.85) * da;
        ctx.lineWidth = (l.r === 'trained' || l.r === 'killed' ? 1.4 : 1) / view.k;
      }
      ctx.stroke();
      if (lit) {
        for (let i = 0; i < 2; i++) {
          const t = (tNow * 0.28 + i * 0.5 + hash(l.s + l.r)) % 1;
          const q = qPoint(t, a.px, a.py, cp.x, cp.y, b.px, b.py);
          const pc = t < 0.5 ? A().colorOf(a.n) : A().colorOf(b.n);
          ctx.globalAlpha = da * 0.6;
          ctx.fillStyle = hexA(pc, 0.55);
          ctx.beginPath(); ctx.arc(q.x, q.y, 3.1 / Math.sqrt(view.k), 0, 6.2832); ctx.fill();
          ctx.globalAlpha = da;
          ctx.fillStyle = 'rgba(255,255,255,.92)';
          ctx.beginPath(); ctx.arc(q.x, q.y, 1.3 / Math.sqrt(view.k), 0, 6.2832); ctx.fill();
        }
      }
    });
    ctx.globalAlpha = 1;

    /* ── nodes: glow halo + gradient core + rim, far first in 3D ── */
    const order = state.mode3d ? [...nodes].sort((a, b) => b.zr - a.zr) : nodes;
    order.forEach(p => {
      const dim = selN && !selN.has(p.id);
      const isSel = state.selected === p.id;
      const hov = state.hovered === p.id || isSel;
      const col = A().colorOf(p.n);
      const v = variants(col);
      const spawn = Math.min(1, (nowMs - p.born) / 420);
      const eSpawn = 1 - Math.pow(1 - spawn, 3);
      let rr = p.r * p.ps * eSpawn;
      if (rr <= 0.1) return;
      if (isSel) rr *= 1 + Math.sin(tNow * 2.6) * 0.05;
      const aBase = (dim ? 0.13 : 1) * depthAlpha(p) * (0.25 + 0.75 * eSpawn);

      const hFac = hov ? 3.3 : 2.3;
      const hs = hFac * rr;
      ctx.globalAlpha = aBase * (hov ? 0.95 : p.d >= 9 ? 0.55 : 0.38);
      ctx.drawImage(glowSprite(col, hs * view.k), p.px - hs, p.py - hs, hs * 2, hs * 2);
      ctx.globalAlpha = aBase;

      if (p.n.type === 'location') {
        shapePath(ctx, p.px, p.py, rr, 'location');
        ctx.strokeStyle = col; ctx.lineWidth = 2 / Math.sqrt(view.k); ctx.stroke();
        ctx.beginPath(); ctx.arc(p.px, p.py, Math.max(rr * 0.34, 1), 0, 6.2832);
        ctx.fillStyle = v.core; ctx.fill();
      } else {
        const grad = ctx.createRadialGradient(p.px - rr * 0.35, p.py - rr * 0.42, rr * 0.12, p.px, p.py, rr * 1.28);
        grad.addColorStop(0, v.core); grad.addColorStop(0.55, col); grad.addColorStop(1, v.deep);
        shapePath(ctx, p.px, p.py, rr, p.n.type);
        ctx.fillStyle = grad; ctx.fill();
        ctx.strokeStyle = v.rim;
        ctx.lineWidth = 0.9 / Math.sqrt(view.k);
        ctx.globalAlpha = aBase * 0.85; ctx.stroke();
        ctx.globalAlpha = aBase;
      }

      if (isSel) {
        ctx.strokeStyle = hexA(col, 0.9);
        ctx.lineWidth = 1.4 / view.k;
        ctx.setLineDash([5 / view.k, 7 / view.k]);
        ctx.lineDashOffset = -tNow * 26;
        ctx.beginPath(); ctx.arc(p.px, p.py, rr + 8 / view.k, 0, 6.2832); ctx.stroke();
        ctx.setLineDash([]);
      } else if (state.hovered === p.id) {
        ctx.strokeStyle = hexA(col, 0.55);
        ctx.lineWidth = 1.2 / view.k;
        ctx.beginPath(); ctx.arc(p.px, p.py, rr + 6 / view.k, 0, 6.2832); ctx.stroke();
      }

      const isNeighbor = selN && selN.has(p.id) && !isSel;
      const showLbl = hov || isNeighbor || p.d >= 9 || view.k >= 1.5;
      if (showLbl && !dim && (!state.mode3d || p.ps > 0.72 || hov)) {
        const fs = Math.max(10.5 / view.k, Math.min(12.5, 11 / Math.sqrt(view.k))) * (state.mode3d ? (0.8 + p.ps * 0.25) : 1);
        ctx.font = (hov ? '600 ' : '500 ') + fs + 'px Saira, sans-serif';
        ctx.textAlign = 'center';
        const ly = p.py - rr - 8 / view.k;
        if (hov || isNeighbor) {
          /* label pill */
          const tw = ctx.measureText(p.n.name).width;
          const padX = 6 / view.k, padY = 3 / view.k;
          pillPath(ctx, p.px - tw / 2 - padX, ly - fs - padY + 1, tw + padX * 2, fs + padY * 2, (fs + padY * 2) / 2);
          ctx.fillStyle = hexA(T().canvasBg, 0.82); ctx.fill();
          ctx.strokeStyle = hexA(col, 0.4); ctx.lineWidth = 1 / view.k; ctx.stroke();
          ctx.fillStyle = hov ? T().ink : T().labelInk;
          ctx.fillText(p.n.name, p.px, ly);
        } else {
          ctx.lineWidth = 3 / view.k;
          ctx.strokeStyle = hexA(T().canvasBg, 0.85);
          ctx.strokeText(p.n.name, p.px, ly);
          ctx.fillStyle = T().labelInk;
          ctx.fillText(p.n.name, p.px, ly);
        }
      }
    });
    ctx.globalAlpha = 1;
  }

  function loop() {
    if (!running) return;
    if (!canvas.offsetParent || document.hidden) { running = false; return; }
    tNow = performance.now() / 1000;
    if (alpha > 0.012) physics();
    if (state.mode3d && !dragging && !state.hovered) theta += 0.0016;   // slow orbit
    draw();
    requestAnimationFrame(loop);
  }
  function start() { if (!running) { running = true; requestAnimationFrame(loop); } }

  function resize() {
    dpr = window.devicePixelRatio || 1;
    W = frame.clientWidth || 900;
    Hh = Math.max(460, Math.min(700, window.innerHeight - 290));
    canvas.width = W * dpr; canvas.height = Hh * dpr;
    canvas.style.height = Hh + 'px';
    bgLayer = null;
  }

  function toWorld(cxp, cyp) {
    const r = canvas.getBoundingClientRect();
    return { x: (cxp - r.left - view.tx) / view.k, y: (cyp - r.top - view.ty) / view.k };
  }
  function pick(cxp, cyp) {
    const p = toWorld(cxp, cyp);
    let best = null, bd = 1e9;
    nodes.forEach(nn => {
      const dx = nn.px - p.x, dy = nn.py - p.y;
      const d = dx * dx + dy * dy;
      const rr = nn.r * nn.ps + PICK_PAD / view.k;
      if (d < rr * rr && d < bd) { bd = d; best = nn; }
    });
    return best;
  }
  /* Move a node so its projection lands on the given world point (z held fixed). */
  function placeAt(p, w) {
    const cx = W / 2, cy = Hh / 2;
    if (!state.mode3d) { p.x = w.x; p.y = w.y; return; }
    const s = p.ps || 1;
    p.y = cy + (w.y - cy) / s;
    const xr = (w.x - cx) / s;
    const cos = Math.cos(theta), sin = Math.sin(theta);
    const c = Math.abs(cos) < 0.2 ? (cos < 0 ? -0.2 : 0.2) : cos;
    p.x = cx + (xr + p.z * sin) / c;
  }

  function applyZoom(k2, mxp, myp) {
    k2 = Math.max(0.25, Math.min(3.2, k2));
    view.tx = mxp - (mxp - view.tx) * (k2 / view.k);
    view.ty = myp - (myp - view.ty) * (k2 / view.k);
    view.k = k2;
  }

  function init() {
    const { el } = A();
    const root = document.getElementById('view-graph');
    frame = root.querySelector('.graph-frame');
    canvas = document.createElement('canvas');
    frame.prepend(canvas);
    ctx = canvas.getContext('2d');

    S.nodes.forEach(n => {
      if (n.type !== 'event' || !n.loc) return;
      if (!locEras.has(n.loc)) locEras.set(n.loc, new Set());
      locEras.get(n.loc).add(n.era);
    });

    /* toolbar */
    const typeBar = root.querySelector('#g-types');
    TYPES.forEach(t => {
      const c = el('button', { class: 'chip' + (state.types.has(t.id) ? ' active' : ''), type: 'button' }, t.label);
      c.addEventListener('click', () => {
        state.types.has(t.id) ? state.types.delete(t.id) : state.types.add(t.id);
        c.classList.toggle('active', state.types.has(t.id));
        rebuild(); start();
      });
      typeBar.append(c);
    });
    const alignBar = root.querySelector('#g-aligns');
    [['sith', 'Sith'], ['jedi', 'Jedi'], ['gray', 'Gray'], ['neutral', 'Neutral']].forEach(([id, label]) => {
      const sw = el('span', { class: 'swatch', 'data-hc': 'align:' + id }); sw.style.background = A().ALIGN_COLOR[id];
      const c = el('button', { class: 'chip active', type: 'button' }, sw, label);
      c.addEventListener('click', () => {
        state.aligns.has(id) ? state.aligns.delete(id) : state.aligns.add(id);
        c.classList.toggle('active', state.aligns.has(id));
        rebuild(); start();
      });
      alignBar.append(c);
    });
    const eraBar = root.querySelector('#g-eras');
    const allChip = el('button', { class: 'chip active', type: 'button' }, 'All eras');
    allChip.addEventListener('click', () => { state.era = null; mark(); rebuild(); start(); });
    eraBar.append(allChip);
    S.eras.forEach(e => {
      const sw = el('span', { class: 'swatch', 'data-hc': 'era:' + e.id }); sw.style.background = e.color;
      const c = el('button', { class: 'chip', type: 'button', 'data-era': e.id }, sw, e.name);
      c.addEventListener('click', () => { state.era = state.era === e.id ? null : e.id; mark(); rebuild(); start(); });
      eraBar.append(c);
    });
    function mark() { eraBar.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', (c.dataset.era || null) === state.era)); }

    const find = root.querySelector('#g-find');
    find.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const hit = S.linkEntities(find.value, 1)[0] || (H.search.search(find.value, { limit: 1 })[0] || {});
      if (hit.id && S.get(hit.id)) focusNode(hit.id);
    });

    root.querySelector('#g-reheat').addEventListener('click', () => { alpha = 1; start(); });
    root.querySelector('#g-fit').addEventListener('click', fitView);
    root.querySelector('#g-export').addEventListener('click', () => H.ui.exportPNG.fromCanvas(canvas, 'holocron-graph'));
    const btn3d = root.querySelector('#g-3d');
    btn3d.addEventListener('click', () => {
      state.mode3d = !state.mode3d;
      btn3d.textContent = state.mode3d ? '3D: On' : '3D: Off';
      btn3d.classList.toggle('primary', state.mode3d);
      alpha = Math.max(alpha, 0.5);
      start();
    });

    /* pointer: drag nodes, pan/rotate background, pinch to zoom */
    const pointers = new Map();
    let drag = null, pinch = null;
    canvas.addEventListener('pointerdown', e => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      canvas.setPointerCapture(e.pointerId);
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        pinch = { d0: Math.hypot(p1.x - p2.x, p1.y - p2.y), k0: view.k };
        if (drag && drag.node) drag.node.fixed = false;
        drag = null; dragging = true;
        return;
      }
      const hit = pick(e.clientX, e.clientY);
      drag = { node: hit, x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, th0: theta, moved: false };
      dragging = true;
      if (hit) { hit.fixed = true; alpha = Math.max(alpha, 0.25); }
      start();
    });
    canvas.addEventListener('pointermove', e => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const d1 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const r = canvas.getBoundingClientRect();
        applyZoom(pinch.k0 * (d1 / pinch.d0), (p1.x + p2.x) / 2 - r.left, (p1.y + p2.y) / 2 - r.top);
        start();
        return;
      }
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (drag.node) {
          placeAt(drag.node, toWorld(e.clientX, e.clientY));
          alpha = Math.max(alpha, 0.18);
        } else if (state.mode3d) {
          theta = drag.th0 + dx * 0.005;          // horizontal drag orbits the cloud
          view.ty = drag.ty + dy;
        } else {
          view.tx = drag.tx + dx; view.ty = drag.ty + dy;
        }
        start();
      } else {
        const hit = pick(e.clientX, e.clientY);
        state.hovered = hit ? hit.id : null;
        canvas.style.cursor = hit ? 'pointer' : 'grab';
        if (hit) {
          const n = hit.n;
          A().showTip(e.clientX, e.clientY, A().tipHTML(n.name, [S.TYPE_LABEL[n.type], A().yearsOf(n)].filter(Boolean).join(' · '), n.blurb));
        } else A().hideTip();
        start();
      }
    });
    const lift = e => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (drag) {
        if (drag.node) drag.node.fixed = false;
        if (!drag.moved) {
          const hit = pick(e.clientX, e.clientY);
          if (hit) { state.selected = hit.id; A().openEntity(hit.id); }
          else state.selected = null;
        }
        drag = null;
      }
      if (!pointers.size) dragging = false;
      start();
    };
    canvas.addEventListener('pointerup', lift);
    canvas.addEventListener('pointercancel', lift);
    canvas.addEventListener('pointerleave', () => { state.hovered = null; A().hideTip(); });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      applyZoom(view.k * Math.exp(-e.deltaY * 0.0016), e.clientX - r.left, e.clientY - r.top);
      start();
    }, { passive: false });

    buildLegend();
    H.theme.onChange(() => { clearRenderCaches(); buildLegend(); start(); });
    if ('ResizeObserver' in window) new ResizeObserver(() => { resize(); start(); }).observe(frame);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) start(); });
    resize();
    rebuild();
  }

  function buildLegend() {
    const { el } = A();
    const lg = frame.querySelector('.graph-legend');
    if (!lg) return;
    lg.innerHTML = '';
    [['sith', 'Sith'], ['jedi', 'Jedi'], ['gray', 'Gray'], ['neutral', 'Neutral']].forEach(([id, label]) => {
      const i = el('i', { 'data-hc': 'align:' + id });
      i.style.cssText = 'border-radius:50%;background:' + A().ALIGN_COLOR[id];
      lg.append(el('span', { class: 'lg' }, i, ' ' + label));
    });
    lg.append(el('span', { class: 'lg' }, '\u25cf character \u00a0\u2b21 faction \u00a0\u25b2 artifact \u00a0\u25c6 concept \u00a0\u25cb world'));
    const tr = el('i'); tr.style.cssText = 'height:2px;background:' + EDGE_COLOR.trained;
    const ki = el('i'); ki.style.cssText = 'height:2px;background:' + EDGE_COLOR.killed;
    const co = el('i'); co.style.cssText = 'height:2px;background:' + EDGE_COLOR.corrupted;
    lg.append(el('span', { class: 'lg' }, tr, ' trained \u00a0', ki, ' killed \u00a0', co, ' corrupted'));
  }

  function fitView() {
    if (!nodes.length) return;
    projectAll();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    nodes.forEach(p => { x0 = Math.min(x0, p.px); x1 = Math.max(x1, p.px); y0 = Math.min(y0, p.py); y1 = Math.max(y1, p.py); });
    const pad = 50;
    const k = Math.min(W / (x1 - x0 + pad * 2), Hh / (y1 - y0 + pad * 2), 2.4);
    view.k = Math.max(0.25, k);
    view.tx = W / 2 - (x0 + x1) / 2 * view.k;
    view.ty = Hh / 2 - (y0 + y1) / 2 * view.k;
    start();
  }

  function focusNode(id) {
    const n = S.get(id);
    if (!n) return;
    A().show('graph');
    if (!state.types.has(n.type)) {
      state.types.add(n.type);
      const idx = TYPES.findIndex(t => t.id === n.type);
      const chips = document.querySelectorAll('#g-types .chip');
      if (chips[idx]) chips[idx].classList.add('active');
      rebuild();
    }
    if (!nodeById.has(id)) { state.era = null; rebuild(); }
    state.selected = id;
    projectAll();
    const p = nodeById.get(id);
    if (p) {
      view.k = Math.max(view.k, 1.1);
      view.tx = W / 2 - p.px * view.k;
      view.ty = Hh / 2 - p.py * view.k;
    }
    alpha = Math.max(alpha, 0.3);
    start();
  }

  H.ui = H.ui || {};
  H.ui.graph = { init, onShow: () => { resize(); start(); }, focusNode };
})();

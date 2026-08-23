/* Holocron UI — relationship graph: canvas force-directed network with era/type/alignment
   filters, hover bios, selection focus, and PNG export. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;

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
    selected: null, hovered: null
  };

  let canvas, ctx, frame, running = false;
  let nodes = [], nodeById = new Map(), links = [];
  let alpha = 1;
  const posCache = new Map();
  let view = { k: 1, tx: 0, ty: 0 };
  let W = 900, Hh = 620, dpr = 1;
  const locEras = new Map();

  const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; };

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
      /* chronological seeding: x by era midpoint, y by id hash */
      const eras = S.erasOf(n);
      const mid = eras.length ? (eras[0].from + eras[eras.length - 1].to) / 2 : (n.type === 'event' ? n.year : -3000);
      const fx = (mid + 7100) / 7400;
      return {
        id: n.id, n, d,
        r: Math.max(4, Math.min(15, 3.5 + Math.sqrt(d) * 2.1)),
        x: cached ? cached.x : W * (0.08 + 0.84 * fx) + (hash(n.id) - .5) * 60,
        y: cached ? cached.y : Hh * (0.12 + 0.76 * hash(n.id + 'y')),
        vx: 0, vy: 0, fixed: false
      };
    });
    nodeById = new Map(nodes.map(nn => [nn.id, nn]));
    links = links.filter(l => nodeById.has(l.s) && nodeById.has(l.t));
    alpha = 1;
  }

  function physics() {
    const cx = W / 2, cy = Hh / 2;
    const n = nodes.length;
    for (let i = 0; i < n; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < n; j++) {
        const b = nodes[j];
        let dx = b.x - a.x, dy = b.y - a.y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) { dx = (hash(a.id + j) - .5); dy = (hash(b.id + i) - .5); d2 = 1; }
        if (d2 > 62000) continue;
        const f = 1450 / d2 * alpha;
        const d = Math.sqrt(d2);
        const ux = dx / d, uy = dy / d;
        a.vx -= ux * f; a.vy -= uy * f;
        b.vx += ux * f; b.vy += uy * f;
      }
    }
    links.forEach(l => {
      const a = nodeById.get(l.s), b = nodeById.get(l.t);
      const rest = l.r === 'trained' || l.r === 'killed' ? 74 : l.r === 'member' || l.r === 'took-part' ? 122 : 96;
      let dx = b.x - a.x, dy = b.y - a.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - rest) * 0.016 * alpha;
      const ux = dx / d, uy = dy / d;
      a.vx += ux * f; a.vy += uy * f;
      b.vx -= ux * f; b.vy -= uy * f;
    });
    nodes.forEach(p => {
      p.vx += (cx - p.x) * 0.012 * alpha;
      p.vy += (cy - p.y) * 0.017 * alpha;
      if (p.fixed) { p.vx = 0; p.vy = 0; return; }
      p.vx *= 0.85; p.vy *= 0.85;
      const vmax = 9;
      p.vx = Math.max(-vmax, Math.min(vmax, p.vx));
      p.vy = Math.max(-vmax, Math.min(vmax, p.vy));
      p.x += p.vx; p.y += p.vy;
      posCache.set(p.id, { x: p.x, y: p.y });
    });
    alpha = Math.max(alpha * 0.994, 0);
  }

  function shapePath(c, p, r) {
    const t = p.n.type;
    c.beginPath();
    if (t === 'character') c.arc(p.x, p.y, r, 0, 6.2832);
    else if (t === 'faction') { // hexagon
      for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + i * Math.PI / 3; const px = p.x + r * 1.18 * Math.cos(a), py = p.y + r * 1.18 * Math.sin(a); i ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.closePath();
    } else if (t === 'artifact') { // triangle (holocron)
      c.moveTo(p.x, p.y - r * 1.25); c.lineTo(p.x + r * 1.15, p.y + r * 0.95); c.lineTo(p.x - r * 1.15, p.y + r * 0.95); c.closePath();
    } else if (t === 'concept') { // diamond
      c.moveTo(p.x, p.y - r * 1.25); c.lineTo(p.x + r * 1.25, p.y); c.lineTo(p.x, p.y + r * 1.25); c.lineTo(p.x - r * 1.25, p.y); c.closePath();
    } else if (t === 'location') { c.arc(p.x, p.y, r * 1.05, 0, 6.2832); }
    else { c.rect(p.x - r * .9, p.y - r * .9, r * 1.8, r * 1.8); }
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#120e12';
    ctx.fillRect(0, 0, W, Hh);
    ctx.translate(view.tx * dpr / dpr, view.ty);
    ctx.scale(view.k, view.k);

    const sel = state.selected ? nodeById.get(state.selected) : null;
    const selN = sel ? new Set([sel.id, ...S.neighbors(sel.id).map(x => x.other)]) : null;

    /* edges */
    links.forEach(l => {
      const a = nodeById.get(l.s), b = nodeById.get(l.t);
      const dim = selN && !(selN.has(a.id) && selN.has(b.id));
      ctx.strokeStyle = EDGE_COLOR[l.r] || 'rgba(120,100,110,.3)';
      ctx.globalAlpha = dim ? 0.07 : 1;
      ctx.lineWidth = (l.r === 'trained' || l.r === 'killed' ? 1.5 : 1) / view.k;
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    });
    ctx.globalAlpha = 1;

    /* nodes */
    nodes.forEach(p => {
      const dim = selN && !selN.has(p.id);
      const hov = state.hovered === p.id || state.selected === p.id;
      ctx.globalAlpha = dim ? 0.14 : 1;
      const col = A().colorOf(p.n);
      if (hov) { ctx.shadowColor = col; ctx.shadowBlur = 16; }
      shapePath(ctx, p, p.r);
      if (p.n.type === 'location') {
        ctx.strokeStyle = col; ctx.lineWidth = 2 / Math.sqrt(view.k); ctx.stroke();
        ctx.fillStyle = '#120e12'; // ring
      } else {
        ctx.fillStyle = col; ctx.fill();
        ctx.strokeStyle = 'rgba(13,10,12,.9)'; ctx.lineWidth = 1.2; ctx.stroke();
      }
      ctx.shadowBlur = 0;
      /* labels */
      const showLbl = hov || (selN && selN.has(p.id)) || p.d >= 9 || view.k >= 1.5;
      if (showLbl && !dim) {
        const fs = Math.max(10.5 / view.k, Math.min(12.5, 11 / Math.sqrt(view.k)));
        ctx.font = (hov ? '600 ' : '') + fs + 'px Saira, sans-serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 3 / view.k;
        ctx.strokeStyle = 'rgba(13,10,12,.85)';
        ctx.strokeText(p.n.name, p.x, p.y - p.r - 5 / view.k);
        ctx.fillStyle = hov ? '#e9e2d9' : '#cfc4ba';
        ctx.fillText(p.n.name, p.x, p.y - p.r - 5 / view.k);
      }
    });
    ctx.globalAlpha = 1;
  }

  function loop() {
    if (!running) return;
    if (!canvas.offsetParent) { running = false; return; }
    if (alpha > 0.012) physics();
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
  }

  function toWorld(cx, cy) {
    const r = canvas.getBoundingClientRect();
    return { x: (cx - r.left - view.tx) / view.k, y: (cy - r.top - view.ty) / view.k };
  }
  function pick(cx, cy) {
    const p = toWorld(cx, cy);
    let best = null, bd = 1e9;
    nodes.forEach(nn => {
      const dx = nn.x - p.x, dy = nn.y - p.y;
      const d = dx * dx + dy * dy;
      const rr = nn.r + 7 / view.k;
      if (d < rr * rr && d < bd) { bd = d; best = nn; }
    });
    return best;
  }

  function init() {
    const { el } = A();
    const root = document.getElementById('view-graph');
    frame = root.querySelector('.graph-frame');
    canvas = document.createElement('canvas');
    frame.prepend(canvas);
    ctx = canvas.getContext('2d');

    /* events at locations → era membership for the era filter */
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
      const sw = el('span', { class: 'swatch' }); sw.style.background = A().ALIGN_COLOR[id];
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
      const sw = el('span', { class: 'swatch' }); sw.style.background = e.color;
      const c = el('button', { class: 'chip', type: 'button', 'data-era': e.id }, sw, e.name);
      c.addEventListener('click', () => { state.era = state.era === e.id ? null : e.id; mark(); rebuild(); start(); });
      eraBar.append(c);
    });
    function mark() { eraBar.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', (c.dataset.era || null) === state.era)); }

    /* find box */
    const find = root.querySelector('#g-find');
    find.addEventListener('keydown', e => {
      if (e.key !== 'Enter') return;
      const hit = S.linkEntities(find.value, 1)[0] || (H.search.search(find.value, { limit: 1 })[0] || {});
      if (hit.id && S.get(hit.id)) focusNode(hit.id);
    });

    /* HUD buttons */
    root.querySelector('#g-reheat').addEventListener('click', () => { alpha = 1; start(); });
    root.querySelector('#g-fit').addEventListener('click', fitView);
    root.querySelector('#g-export').addEventListener('click', () => H.ui.exportPNG.fromCanvas(canvas, 'holocron-graph'));

    /* pointer */
    let drag = null;
    canvas.addEventListener('pointerdown', e => {
      const hit = pick(e.clientX, e.clientY);
      drag = { node: hit, x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: false };
      if (hit) { hit.fixed = true; alpha = Math.max(alpha, 0.25); start(); }
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', e => {
      if (drag) {
        const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
        if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
        if (drag.node) {
          const p = toWorld(e.clientX, e.clientY);
          drag.node.x = p.x; drag.node.y = p.y;
          alpha = Math.max(alpha, 0.18);
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
    canvas.addEventListener('pointerup', e => {
      if (drag) {
        if (drag.node) drag.node.fixed = false;
        if (!drag.moved) {
          const hit = pick(e.clientX, e.clientY);
          if (hit) { state.selected = hit.id; A().openEntity(hit.id); }
          else state.selected = null;
        }
        drag = null; start();
      }
    });
    canvas.addEventListener('pointerleave', () => { state.hovered = null; A().hideTip(); });
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const f = Math.exp(-e.deltaY * 0.0016);
      const k2 = Math.max(0.25, Math.min(3.2, view.k * f));
      const r = canvas.getBoundingClientRect();
      const mx = e.clientX - r.left, my = e.clientY - r.top;
      view.tx = mx - (mx - view.tx) * (k2 / view.k);
      view.ty = my - (my - view.ty) * (k2 / view.k);
      view.k = k2;
      start();
    }, { passive: false });

    if ('ResizeObserver' in window) new ResizeObserver(() => { resize(); start(); }).observe(frame);
    resize();
    rebuild();
  }

  function fitView() {
    if (!nodes.length) return;
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    nodes.forEach(p => { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); y0 = Math.min(y0, p.y); y1 = Math.max(y1, p.y); });
    const pad = 50;
    const k = Math.min((W) / (x1 - x0 + pad * 2), (Hh) / (y1 - y0 + pad * 2), 2.4);
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
    const p = nodeById.get(id);
    if (p) {
      view.k = Math.max(view.k, 1.1);
      view.tx = W / 2 - p.x * view.k;
      view.ty = Hh / 2 - p.y * view.k;
    }
    alpha = Math.max(alpha, 0.3);
    start();
  }

  H.ui = H.ui || {};
  H.ui.graph = { init, onShow: () => { resize(); start(); }, focusNode };
})();

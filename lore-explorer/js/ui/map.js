/* Holocron UI — galaxy: stylized star map of the atlas’s worlds, with era highlighting. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;

  const NS = 'http://www.w3.org/2000/svg';
  const VW = 1000, VH = 640;
  const locEras = new Map();
  let svgEl, eraSel;

  /* label offsets for tight clusters [dx, dy] */
  const NUDGE = {
    dxun: [30, 4], onderon: [-38, 5], yavin4: [6, -12], ziost: [-8, -11], nathema: [34, 6], 'dromund-kaas': [8, -12],
    'koros-major': [6, -11], coruscant: [0, 20], tython: [-4, 22], korriban: [0, -13],
    ossus: [26, 14], malachor: [0, 19], ambria: [-30, 6], telos: [0, -12],
    katarr: [-28, 4], taris: [-26, -4], dantooine: [0, -12], lehon: [0, -13], kesh: [0, -13],
    ruusan: [0, 19], 'mandalore-planet': [0, 19]
  };

  const seeded = seed => { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; };

  function make(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  }
  const px = loc => loc.coords.x * (VW / 100);
  const py = loc => loc.coords.y * (VH / 100);

  function init() {
    const { el } = A();
    const root = document.getElementById('view-galaxy');
    const frameEl = root.querySelector('.map-frame');
    const stage = el('div', { class: 'map-stage' });
    frameEl.append(stage);
    svgEl = make('svg', { viewBox: '0 0 ' + VW + ' ' + VH, role: 'img', 'aria-label': 'Galaxy map of Old Republic worlds' });
    stage.append(svgEl);

    /* Holo table: perspective tilt with damped pointer parallax. Defaults on for
       mouse-driven desktops, off for touch; the toggle persists. */
    const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let holo = window.matchMedia && window.matchMedia('(pointer: fine)').matches && window.innerWidth > 900;
    try { const saved = localStorage.getItem('holo-map-3d'); if (saved != null) holo = saved === '1'; } catch (e) { /* fine */ }
    const holoBtn = root.querySelector('#map-holo');
    let rx = 24, ry = 0, tiltRaf = 0;
    const applyTilt = () => {
      tiltRaf = 0;
      stage.style.transform = holo ? 'perspective(1150px) rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)' : 'none';
    };
    function setHolo(on) {
      holo = on;
      frameEl.classList.toggle('holo', holo);
      holoBtn.textContent = holo ? 'Holo table: On' : 'Holo table: Off';
      holoBtn.classList.toggle('primary', holo);
      rx = 24; ry = 0; applyTilt();
      try { localStorage.setItem('holo-map-3d', holo ? '1' : '0'); } catch (e) { /* fine */ }
    }
    holoBtn.addEventListener('click', () => setHolo(!holo));
    frameEl.addEventListener('pointermove', e => {
      if (!holo || reducedMotion) return;
      const r = frameEl.getBoundingClientRect();
      rx = 24 - ((e.clientY - r.top) / r.height - 0.5) * 5;
      ry = ((e.clientX - r.left) / r.width - 0.5) * 6;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
    });
    frameEl.addEventListener('pointerleave', () => {
      rx = 24; ry = 0;
      if (!tiltRaf) tiltRaf = requestAnimationFrame(applyTilt);
    });
    setHolo(holo);

    S.nodes.forEach(n => {
      if (n.type !== 'event' || !n.loc) return;
      if (!locEras.has(n.loc)) locEras.set(n.loc, new Set());
      locEras.get(n.loc).add(n.era);
    });

    /* era highlight select */
    eraSel = root.querySelector('#map-era');
    S.eras.forEach(e => eraSel.append(el('option', { value: e.id }, e.name)));
    eraSel.addEventListener('change', render);

    /* side list grouped by region */
    const list = root.querySelector('#world-list');
    const groups = new Map();
    [...S.nodes.values()].filter(n => n.type === 'location').forEach(loc => {
      const key = loc.region.split('—')[0].trim();
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(loc);
    });
    const ORDER = ['Deep Core', 'Core Worlds', 'Inner Rim', 'Mid Rim', 'Outer Rim', 'Unknown Regions', 'Wild Space'];
    [...groups.entries()].sort((a, b) => {
      const ia = ORDER.indexOf(a[0]), ib = ORDER.indexOf(b[0]);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    }).forEach(([region, locs]) => {
      list.append(el('div', { class: 'world-group' }, region));
      locs.sort((a, b) => a.name.localeCompare(b.name)).forEach(loc => {
        const dot = el('span', { class: 'dot' });
        dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex:none;background:' + A().colorOf(loc);
        list.append(el('button', {
          class: 'world-row', type: 'button', onclick: () => A().openEntity(loc.id)
        }, dot, loc.name));
      });
    });

    render();
  }

  function render() {
    if (!svgEl) return;
    const era = eraSel.value || null;
    svgEl.innerHTML = '';

    /* starfield */
    const rnd = seeded(66);
    for (let i = 0; i < 170; i++) {
      make('circle', {
        cx: rnd() * VW, cy: rnd() * VH, r: rnd() * 1.1 + 0.2,
        fill: '#e9e2d9', 'fill-opacity': (rnd() * 0.28 + 0.05).toFixed(2)
      }, svgEl);
    }

    /* region rings (galactic disc, centered on the Core) */
    const cx = 520, cy = 330;
    [['Deep Core', 46], ['Core', 105], ['Inner Rim', 170], ['Mid Rim', 240], ['Outer Rim', 320]].forEach(([name, r], i) => {
      make('ellipse', { cx, cy, rx: r * 1.35, ry: r, fill: 'none', stroke: '#33242b', 'stroke-width': 1, 'stroke-dasharray': i ? '2 5' : 'none', 'stroke-opacity': 0.8 }, svgEl);
      const t = make('text', { x: cx, y: cy - r + 13, 'text-anchor': 'middle', 'font-family': 'Chivo Mono, monospace', 'font-size': 8.5, fill: '#75655e', 'letter-spacing': '2' }, svgEl);
      t.textContent = name.toUpperCase();
    });
    const ur = make('text', { x: 105, y: 90, 'font-family': 'Chivo Mono, monospace', 'font-size': 9, fill: '#75655e', 'letter-spacing': '3' }, svgEl);
    ur.textContent = 'UNKNOWN REGIONS';
    const ws = make('text', { x: 92, y: 560, 'font-family': 'Chivo Mono, monospace', 'font-size': 9, fill: '#75655e', 'letter-spacing': '3' }, svgEl);
    ws.textContent = 'WILD SPACE';
    const ss = make('text', { x: 828, y: 130, 'font-family': 'Chivo Mono, monospace', 'font-size': 9, fill: '#8e2a26', 'letter-spacing': '3' }, svgEl);
    ss.textContent = 'SITH SPACE';

    /* hyperlane hints */
    const lane = (ids, label, labelAt) => {
      const pts = ids.map(id => S.get(id)).filter(Boolean).map(l => px(l) + ',' + py(l)).join(' ');
      make('polyline', { points: pts, fill: 'none', stroke: '#8e2a26', 'stroke-opacity': 0.5, 'stroke-width': 1.2, 'stroke-dasharray': '5 5' }, svgEl);
      if (label) {
        const mid = S.get(labelAt);
        if (mid) {
          const t = make('text', { x: (px(mid)), y: py(mid) + 30, 'text-anchor': 'middle', 'font-family': 'Chivo Mono, monospace', 'font-size': 8, fill: '#8e5a50', 'letter-spacing': '1.5' }, svgEl);
          t.textContent = label;
        }
      }
    };
    lane(['koros-major', 'katarr', 'taris', 'korriban'], 'DARAGON TRAIL', 'katarr');
    lane(['korriban', 'ziost', 'dromund-kaas', 'nathema'], null);

    /* planets */
    [...S.nodes.values()].filter(n => n.type === 'location').forEach(loc => {
      const x = px(loc), y = py(loc);
      const degree = (S.neighbors(loc.id) || []).length;
      const isMoon = loc.id === 'dxun';
      const r = isMoon ? 3.5 : Math.max(5, Math.min(11, 3.5 + degree * 0.55));
      const color = A().colorOf(loc);
      const active = !era || (locEras.get(loc.id) || new Set()).has(era);
      const g = make('g', { opacity: active ? 1 : 0.22 }, svgEl);
      if (active && era) make('circle', { cx: x, cy: y, r: r + 6, fill: color, 'fill-opacity': 0.16 }, g);
      make('circle', { cx: x, cy: y, r: r + 2.5, fill: color, 'fill-opacity': 0.16 }, g);
      const dot = make('circle', { cx: x, cy: y, r, fill: '#141013', stroke: color, 'stroke-width': 2 }, g);
      make('circle', { cx: x, cy: y, r: Math.max(r - 3.4, 1.2), fill: color, 'fill-opacity': 0.75, 'pointer-events': 'none' }, g);
      const [dx, dy] = NUDGE[loc.id] || [0, 18];
      const lbl = make('text', {
        x: x + dx, y: y + (dy || 18), 'text-anchor': 'middle',
        'font-family': 'Saira, sans-serif', 'font-size': 10, 'font-weight': 600,
        'letter-spacing': '1.4', fill: active ? '#e9e2d9' : '#75655e'
      }, g);
      lbl.textContent = loc.name.replace(/\s*\(.*\)/, '').toUpperCase();
      [dot, lbl].forEach(elm => {
        elm.style.cursor = 'pointer';
        elm.addEventListener('pointerenter', e => A().showTip(e.clientX, e.clientY, A().tipHTML(loc.name, loc.region, loc.blurb)));
        elm.addEventListener('pointermove', e => A().showTip(e.clientX, e.clientY, A().tipHTML(loc.name, loc.region, loc.blurb)));
        elm.addEventListener('pointerleave', A().hideTip);
        elm.addEventListener('click', () => { A().hideTip(); A().openEntity(loc.id); });
      });
    });
  }

  H.ui = H.ui || {};
  H.ui.galaxy = { init };
})();

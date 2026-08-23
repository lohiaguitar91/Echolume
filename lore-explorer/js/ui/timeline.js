/* Holocron UI — timeline: zoomable SVG chronology with era ribbon, conflict spans,
   event lanes, academy cycles, and lineage chains. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;
  const T = () => H.theme.t;

  const NS = 'http://www.w3.org/2000/svg';
  const COARSE = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const MIN_T = -7250, MAX_T = 340, MIN_SPAN = 24;

  const KIND_GROUPS = [
    { id: 'kg-war', label: 'Wars & battles', kinds: ['war', 'battle', 'duel'] },
    { id: 'kg-death', label: 'Deaths', kinds: ['death'] },
    { id: 'kg-pol', label: 'Politics & foundings', kinds: ['founding', 'political'] },
    { id: 'kg-acad', label: 'Academies', kinds: ['academy'] },
    { id: 'kg-cat', label: 'Catastrophes & rituals', kinds: ['catastrophe', 'ritual'] },
    { id: 'kg-turn', label: 'Turnings & discoveries', kinds: ['turning', 'discovery'] }
  ];
  const LAYERS = [
    { id: 'events', label: 'Events' },
    { id: 'conflicts', label: 'Conflicts' },
    { id: 'academies', label: 'Academy cycles' },
    { id: 'lineages', label: 'Lineages' }
  ];

  const state = {
    t0: -7150, t1: 240,
    era: null,                       // active era filter (id) or null
    kinds: new Set(KIND_GROUPS.flatMap(g => g.kinds)),
    layers: { events: true, conflicts: true, academies: true, lineages: true },
    highlight: null
  };

  let svg, frame, scheduled = false;

  function sched() { if (!scheduled) { scheduled = true; requestAnimationFrame(() => { scheduled = false; render(); }); } }

  function make(tag, attrs, parent) {
    const n = document.createElementNS(NS, tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.append(n);
    return n;
  }

  function init() {
    const { el } = A();
    const root = document.getElementById('view-timeline');
    frame = root.querySelector('.tl-frame');
    svg = make('svg', { class: 'tl-svg' });
    frame.prepend(svg);

    /* toolbar: era chips */
    const eraBar = root.querySelector('#tl-eras');
    const allChip = el('button', { class: 'chip active', type: 'button', onclick: () => { setEra(null); } }, 'All eras');
    eraBar.append(allChip);
    S.eras.forEach(e => {
      const sw = el('span', { class: 'swatch', 'data-hc': 'era:' + e.id }); sw.style.background = e.color;
      eraBar.append(el('button', {
        class: 'chip', type: 'button', 'data-era': e.id, title: e.tagline,
        onclick: () => setEra(state.era === e.id ? null : e.id, true)
      }, sw, e.name));
    });
    function setEra(id, zoom) {
      state.era = id;
      eraBar.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', (c.dataset.era || null) === id));
      if (id && zoom) { const e = S.eraById.get(id); fitTo(e.from, e.to); }
      if (!id) sched();
    }

    /* kind + layer chips */
    const kindBar = root.querySelector('#tl-kinds');
    KIND_GROUPS.forEach(g => {
      const sw = el('span', { class: 'swatch', 'data-hc': 'kind:' + g.kinds[0] }); sw.style.background = A().KIND_COLOR[g.kinds[0]];
      const c = el('button', { class: 'chip active', type: 'button' }, sw, g.label);
      c.addEventListener('click', () => {
        const on = g.kinds.every(k => state.kinds.has(k));
        g.kinds.forEach(k => on ? state.kinds.delete(k) : state.kinds.add(k));
        c.classList.toggle('active', !on);
        sched();
      });
      kindBar.append(c);
    });
    const layerBar = root.querySelector('#tl-layers');
    LAYERS.forEach(l => {
      const c = el('button', { class: 'chip active', type: 'button' }, l.label);
      c.addEventListener('click', () => {
        state.layers[l.id] = !state.layers[l.id];
        c.classList.toggle('active', state.layers[l.id]);
        sched();
      });
      layerBar.append(c);
    });

    /* zoom buttons */
    root.querySelector('#tl-zoom-in').addEventListener('click', () => zoomAround((state.t0 + state.t1) / 2, 0.55));
    root.querySelector('#tl-zoom-out').addEventListener('click', () => zoomAround((state.t0 + state.t1) / 2, 1.8));
    root.querySelector('#tl-fit').addEventListener('click', () => fitTo(-7150, 240));
    root.querySelector('#tl-export').addEventListener('click', () => H.ui.exportPNG.fromSVG(svg, 'holocron-timeline', T().canvasBg));

    /* pointer interactions: one-finger drag pans, two fingers pinch-zoom */
    const pointers = new Map();
    let drag = null, pinch = null;
    svg.addEventListener('pointerdown', e => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      svg.setPointerCapture(e.pointerId);
      animTarget = null;                                  // interactions take over instantly
      if (pointers.size === 2) {
        const [p1, p2] = [...pointers.values()];
        const midX = (p1.x + p2.x) / 2;
        pinch = { d0: Math.abs(p1.x - p2.x) || 1, span0: state.t1 - state.t0, tMid: tAt(midX) };
        drag = null;
        return;
      }
      drag = { x: e.clientX, t0: state.t0, t1: state.t1, moved: false };
      svg.classList.add('dragging');
    });
    svg.addEventListener('pointermove', e => {
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size >= 2) {
        const [p1, p2] = [...pointers.values()];
        const d1 = Math.abs(p1.x - p2.x) || 1;
        let span = Math.max(MIN_SPAN, Math.min(pinch.span0 * pinch.d0 / d1, MAX_T - MIN_T));
        const midX = (p1.x + p2.x) / 2;
        const r = svg.getBoundingClientRect();
        const { ml } = plotDims();
        const frac = Math.max(0, Math.min(1, (midX - r.left - ml) / plotW()));
        const [a, b] = clampDomain(pinch.tMid - span * frac, pinch.tMid - span * frac + span);
        state.t0 = a; state.t1 = b;
        sched();
        return;
      }
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 3) drag.moved = true;
      const span = drag.t1 - drag.t0;
      const w = plotW();
      const dt = -dx * span / w;
      const [a, b] = clampDomain(drag.t0 + dt, drag.t1 + dt);
      state.t0 = a; state.t1 = b;
      sched();
    });
    const endDrag = e => {
      if (e && pointers.has(e.pointerId)) pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (!pointers.size) { svg.classList.remove('dragging'); drag = null; }
    };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    svg.addEventListener('wheel', e => {
      e.preventDefault();
      const f = Math.exp(e.deltaY * 0.0016);
      zoomAround(tAt(e.clientX), f);
    }, { passive: false });
    svg.addEventListener('dblclick', e => zoomAround(tAt(e.clientX), 0.45));

    buildLegend();
    H.theme.onChange(() => { buildLegend(); sched(); });
    if ('ResizeObserver' in window) new ResizeObserver(sched).observe(frame);
    window.addEventListener('resize', sched);
    sched();
  }

  function buildLegend() {
    const { el } = A();
    const lg = frame.querySelector('.tl-legend');
    if (!lg) return;
    lg.innerHTML = '';
    lg.append(el('b', null, 'Events'));
    Object.entries(S.KIND_LABEL).forEach(([k, label]) => {
      const i = el('i', { 'data-hc': 'kind:' + k });
      i.style.background = A().KIND_COLOR[k];
      lg.append(el('span', { class: 'lg' }, i, label.toLowerCase()));
    });
    const si = el('i', { 'data-hc': 'align:sith' }); si.style.background = H.theme.align.sith;
    const ji = el('i', { 'data-hc': 'align:jedi' }); ji.style.background = H.theme.align.jedi;
    const sithLg = el('span', { class: 'lg' }, si, 'Sith academy open');
    sithLg.style.marginLeft = 'auto';
    lg.append(sithLg, el('span', { class: 'lg' }, ji, 'Jedi academy open'));
  }

  function plotDims() {
    const W = Math.max(frame.clientWidth || 900, 320);
    const ml = W < 560 ? 66 : W < 680 ? 92 : 132, mr = 14;
    return { W, ml, mr };
  }
  function plotW() { const { W, ml, mr } = plotDims(); return W - ml - mr; }
  function tAt(clientX) {
    const r = svg.getBoundingClientRect();
    const { ml } = plotDims();
    return state.t0 + (clientX - r.left - ml) / plotW() * (state.t1 - state.t0);
  }
  /* Eased zooming: interactions set a target domain and a short spring chases it,
     so wheel/button zooms feel fluid. Dragging writes the domain directly (finger-lock). */
  const noMotion = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animTarget = null, animRunning = false;
  function animateTo(a, b) {
    if (noMotion()) { state.t0 = a; state.t1 = b; animTarget = null; sched(); return; }
    animTarget = { a, b };
    if (!animRunning) { animRunning = true; requestAnimationFrame(animStep); }
  }
  function animStep() {
    if (!animTarget) { animRunning = false; return; }
    const ease = 0.26;
    state.t0 += (animTarget.a - state.t0) * ease;
    state.t1 += (animTarget.b - state.t1) * ease;
    const span = state.t1 - state.t0;
    if (Math.abs(animTarget.a - state.t0) < span * 0.0015 && Math.abs(animTarget.b - state.t1) < span * 0.0015) {
      state.t0 = animTarget.a; state.t1 = animTarget.b;
      animTarget = null; animRunning = false;
    } else requestAnimationFrame(animStep);
    render();
  }
  function clampDomain(a, b) {
    if (a < MIN_T) { b += MIN_T - a; a = MIN_T; }
    if (b > MAX_T) { a -= b - MAX_T; b = MAX_T; }
    return [Math.max(a, MIN_T), Math.min(b, MAX_T)];
  }
  function zoomAround(t, f) {
    const base = animTarget || { a: state.t0, b: state.t1 };   // compound fast wheel ticks
    let span = (base.b - base.a) * f;
    span = Math.max(MIN_SPAN, Math.min(span, MAX_T - MIN_T));
    const frac = (t - base.a) / (base.b - base.a);
    const [a, b] = clampDomain(t - span * frac, t - span * frac + span);
    animateTo(a, b);
  }
  function fitTo(a, b) {
    const pad = (b - a) * 0.06 + 4;
    const [ca, cb] = clampDomain(a - pad, b + pad);
    animateTo(ca, cb);
  }

  function tickStep(span) {
    if (span > 4200) return 1000;
    if (span > 1700) return 500;
    if (span > 800) return 200;
    if (span > 320) return 100;
    if (span > 140) return 50;
    if (span > 55) return 20;
    if (span > 28) return 10;
    return 5;
  }
  const fmtTick = t => t < 0 ? (-t).toLocaleString('en') + ' BBY' : t === 0 ? '0' : t.toLocaleString('en') + ' ABY';

  /* interactive helper: attach tooltip + click */
  function wire(node, entityId, ttFn) {
    node.style.cursor = 'pointer';
    node.addEventListener('pointerenter', e => { const t = ttFn(); if (t) A().showTip(e.clientX, e.clientY, t); });
    node.addEventListener('pointermove', e => { const t = ttFn(); if (t) A().showTip(e.clientX, e.clientY, t); });
    node.addEventListener('pointerleave', A().hideTip);
    if (entityId) node.addEventListener('click', e => { e.stopPropagation(); A().hideTip(); A().openEntity(entityId); });
  }

  function render() {
    if (!svg) return;
    const { W, ml, mr } = plotDims();
    const span = state.t1 - state.t0;
    const x = t => ml + (t - state.t0) / span * (W - ml - mr);
    const clampX = v => Math.max(ml, Math.min(W - mr, v));
    svg.innerHTML = '';

    const events = [...S.nodes.values()].filter(n => n.type === 'event')
      .filter(ev => state.kinds.has(ev.kind))
      .filter(ev => !state.era || ev.era === state.era)
      .sort((a, b) => a.year - b.year);
    const spans = events.filter(e => e.endYear != null);
    const points = events.filter(e => e.endYear == null);

    let y = 0;

    /* ── era ribbon ── */
    const ribbonH = 26;
    make('rect', { x: 0, y: 0, width: W, height: ribbonH, fill: T().ribbonBg }, svg);
    S.eras.forEach(e => {
      if (e.to < state.t0 || e.from > state.t1) return;
      const x0 = clampX(x(e.from)), x1 = clampX(x(e.to));
      if (x1 - x0 < 1) return;
      const r = make('rect', { x: x0, y: 3, width: x1 - x0, height: ribbonH - 6, rx: 3, fill: e.color, 'fill-opacity': state.era && state.era !== e.id ? 0.18 : 0.55 }, svg);
      wire(r, null, () => A().tipHTML(e.name, S.fmtSpan(e.from, e.to), e.tagline));
      r.addEventListener('click', () => fitTo(e.from, e.to));
      if (x1 - x0 > 74) {
        const t = make('text', {
          x: (x0 + x1) / 2, y: ribbonH / 2 + 4, 'text-anchor': 'middle',
          'font-family': 'Saira, sans-serif', 'font-size': 10.5, 'font-weight': 600,
          'letter-spacing': '.8', fill: T().ink, 'pointer-events': 'none'
        }, svg);
        t.textContent = e.name;
      }
      /* faint era tint through the plot */
      make('rect', { x: x0, y: ribbonH, width: x1 - x0, height: 2000, fill: e.color, 'fill-opacity': 0.045, 'pointer-events': 'none', class: 'era-tint' }, svg);
    });
    y = ribbonH;

    /* ── axis ── */
    const axisH = 24;
    let step = tickStep(span);
    while (step * (W - ml - mr) / span < 62) step *= 2;   // keep labels from colliding on narrow plots
    const first = Math.ceil(state.t0 / step) * step;
    for (let t = first; t <= state.t1; t += step) {
      const xx = x(t);
      make('line', { x1: xx, y1: y + axisH, x2: xx, y2: 4000, stroke: T().grid, 'stroke-width': 1 }, svg);
      const lbl = make('text', {
        x: xx, y: y + 15, 'text-anchor': 'middle',
        'font-family': 'Chivo Mono, monospace', 'font-size': 9.5, fill: T().inkFaint
      }, svg);
      lbl.textContent = fmtTick(t);
    }
    y += axisH;

    /* ── conflicts (span bars) ── */
    if (state.layers.conflicts && spans.length) {
      y += 6;
      gutterLabel('CONFLICTS', y + 4);
      const laneEnds = [];
      const rowH = 17;
      spans.forEach(ev => {
        if (ev.endYear < state.t0 || ev.year > state.t1) return;
        const x0 = clampX(x(ev.year)), x1 = clampX(x(ev.endYear));
        let lane = laneEnds.findIndex(end => x0 > end + 4);
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
        const showLbl = (x1 - x0) > ev.name.length * 5.6 + 10;
        laneEnds[lane] = showLbl ? Math.max(x1, x0 + ev.name.length * 5.6) : x1;
        const yy = y + lane * rowH;
        const color = A().KIND_COLOR[ev.kind] || H.theme.kind.war;
        const bar = make('rect', {
          x: x0, y: yy, width: Math.max(x1 - x0, 3), height: 11, rx: 3,
          fill: color, 'fill-opacity': 0.42, stroke: color, 'stroke-opacity': 0.8, 'stroke-width': ev.id === state.highlight ? 2.4 : 1
        }, svg);
        wire(bar, ev.id, () => A().tipHTML(ev.name, S.fmtYear(ev.year, ev.approx) + ' – ' + S.fmtYear(ev.endYear), ev.blurb));
        if (showLbl) {
          const t = make('text', { x: x0 + 5, y: yy + 9, 'font-family': 'Saira, sans-serif', 'font-size': 10.5, fill: T().ink, 'pointer-events': 'none' }, svg);
          t.textContent = ev.name;
        }
      });
      y += Math.max(laneEnds.length, 1) * rowH + 8;
    }

    /* ── point events ── */
    if (state.layers.events && points.length) {
      gutterLabel('EVENTS', y + 6);
      const labelsOn = span <= 2700;
      const laneEnds = [];
      const rowH = labelsOn ? 19 : 12;
      points.forEach(ev => {
        if (ev.year < state.t0 || ev.year > state.t1) return;
        const xx = x(ev.year);
        const w = labelsOn ? 12 + ev.name.length * 6.1 : 9;
        let lane = laneEnds.findIndex(end => xx > end + 3);
        if (lane === -1) { lane = laneEnds.length; laneEnds.push(0); }
        if (lane > 13) return;                       // safety valve at extreme densities
        laneEnds[lane] = xx + w;
        const yy = y + 8 + lane * rowH;
        const color = A().KIND_COLOR[ev.kind] || H.theme.kind.political;
        const hi = ev.id === state.highlight;
        if (hi) make('circle', { cx: xx, cy: yy, r: 9, fill: 'none', stroke: T().hl, 'stroke-width': 2 }, svg);
        const dot = make('circle', { cx: xx, cy: yy, r: 4.2, fill: color, stroke: T().dotStroke, 'stroke-width': 1.2 }, svg);
        wire(dot, ev.id, () => A().tipHTML(ev.name, S.fmtYear(ev.year, ev.approx) + ' · ' + (S.KIND_LABEL[ev.kind] || ev.kind), ev.blurb));
        if (COARSE) {
          const hit = make('circle', { cx: xx, cy: yy, r: 12, fill: 'transparent' }, svg);
          wire(hit, ev.id, () => A().tipHTML(ev.name, S.fmtYear(ev.year, ev.approx), ev.blurb));
        }
        if (labelsOn) {
          const t = make('text', { x: xx + 8, y: yy + 3.5, 'font-family': 'Saira, sans-serif', 'font-size': 10.8, fill: hi ? T().ink : T().inkDim }, svg);
          t.textContent = ev.name;
          wire(t, ev.id, () => A().tipHTML(ev.name, S.fmtYear(ev.year, ev.approx), ev.blurb));
        }
      });
      y += 12 + Math.max(laneEnds.length, 1) * rowH + 6;
    }

    /* ── academy cycles ── */
    if (state.layers.academies) {
      y += 8;
      make('line', { x1: 0, y1: y, x2: W, y2: y, stroke: T().line }, svg);
      y += 4;
      gutterLabel('ACADEMY CYCLES', y + 6);
      y += 14;
      const rowH = 15;
      (S.academies || []).forEach(a => {
        const loc = S.get(a.loc);
        const gutterChars = ml < 80 ? 11 : 20;
        const name = make('text', { x: 8, y: y + 8.5, 'font-family': 'Saira, sans-serif', 'font-size': ml < 80 ? 8.6 : 10, fill: a.side === 'sith' ? H.theme.align.sith : H.theme.align.jedi }, svg);
        name.textContent = a.name.length > gutterChars ? a.name.slice(0, gutterChars - 1) + '…' : a.name;
        wire(name, a.loc, () => A().tipHTML(a.name, loc ? 'on ' + loc.name : '', a.blurb));
        make('line', { x1: ml, y1: y + 5, x2: W - mr, y2: y + 5, stroke: T().grid, 'stroke-dasharray': '1 4' }, svg);
        a.periods.forEach(p => {
          const to = p.to == null ? MAX_T : p.to;
          if (to < state.t0 || p.from > state.t1) return;
          const x0 = clampX(x(p.from)), x1 = clampX(x(to));
          const color = a.side === 'sith' ? H.theme.align.sith : H.theme.align.jedi;
          const soft = p.approx || p.approxEnd;
          const bar = make('rect', {
            x: x0, y: y, width: Math.max(x1 - x0, 2.5), height: 10, rx: 2,
            fill: color, 'fill-opacity': soft ? 0.28 : 0.5,
            stroke: color, 'stroke-opacity': soft ? 0.45 : 0.75, 'stroke-width': 0.8
          }, svg);
          wire(bar, a.loc, () => A().tipHTML(a.name + ' — ' + p.by,
            S.fmtYear(p.from, p.approx) + ' – ' + (p.to == null ? '…' : S.fmtYear(p.to, p.approxEnd)), p.note || ''));
        });
        y += rowH;
      });
      y += 4;
    }

    /* ── lineages ── */
    if (state.layers.lineages) {
      y += 8;
      make('line', { x1: 0, y1: y, x2: W, y2: y, stroke: T().line }, svg);
      y += 4;
      gutterLabel('LINEAGES', y + 6);
      y += 14;
      const rowH = 27;
      (S.lineages || []).forEach(lin => {
        const linChars = ml < 80 ? 11 : 21;
        const name = make('text', { x: 8, y: y + 12, 'font-family': 'Saira, sans-serif', 'font-size': ml < 80 ? 8.6 : 10, fill: T().inkDim }, svg);
        name.textContent = lin.name.length > linChars ? lin.name.slice(0, linChars - 1) + '…' : lin.name;
        wire(name, null, () => A().tipHTML(lin.name, lin.members.map(m => (S.get(m) || {}).name).join(' → '), lin.note));
        const mid = y + 10;
        make('line', { x1: ml, y1: mid, x2: W - mr, y2: mid, stroke: T().grid, 'stroke-dasharray': '1 4' }, svg);
        let prevEnd = null, idx = 0;
        lin.members.forEach(memberId => {
          const c = S.get(memberId);
          if (!c) return;
          const color = A().ALIGN_COLOR[c.alignment] || '#9c8f9c';
          const stagger = (idx % 2 === 0) ? -5 : 5;  // consecutive lives overlap; alternate rows
          idx++;
          const gapBefore = lin.gaps && lin.gaps[lin.members[lin.members.indexOf(memberId) - 1]];
          const connect = xTo => {
            if (prevEnd != null) make('line', {
              x1: prevEnd, y1: mid, x2: Math.max(xTo, prevEnd), y2: mid,
              stroke: T().inkFaint, 'stroke-width': 1, 'stroke-dasharray': gapBefore ? '4 4' : 'none'
            }, svg);
          };
          const hi = memberId === state.highlight;
          if (c.born != null && c.died != null) {
            if (c.died < state.t0 || c.born > state.t1) { prevEnd = clampX(x(c.died)); return; }
            const x0 = clampX(x(c.born)), x1 = clampX(x(c.died));
            connect(x0);
            if (hi) make('rect', { x: x0 - 3, y: mid + stagger - 6.5, width: x1 - x0 + 6, height: 13, rx: 5, fill: 'none', stroke: T().hl, 'stroke-width': 2 }, svg);
            const bar = make('rect', {
              x: x0, y: mid + stagger - 4, width: Math.max(x1 - x0, 3), height: 8, rx: 4,
              fill: color, 'fill-opacity': 0.72
            }, svg);
            wire(bar, memberId, () => A().tipHTML(c.name, A().yearsOf(c), c.blurb));
            if (x1 - x0 > c.name.length * 5.6 + 8) {
              const t = make('text', { x: x0 + 4, y: mid + stagger + 3, 'font-family': 'Saira, sans-serif', 'font-size': 9.4, fill: T().barLabel, 'font-weight': 600, 'pointer-events': 'none' }, svg);
              t.textContent = c.name;
            }
            prevEnd = x1;
          } else {
            /* one known date (or none): a diamond marker, never a fabricated lifespan */
            const t = c.died != null ? c.died : c.born;
            if (t == null) return;
            if (t < state.t0 || t > state.t1) { prevEnd = clampX(x(t)); return; }
            const xx = x(t);
            connect(xx - 4);
            const d = make('path', {
              d: 'M' + xx + ' ' + (mid + stagger - 5) + ' l5 5 l-5 5 l-5 -5 Z',
              fill: color, 'fill-opacity': 0.85, stroke: hi ? T().hl : T().dotStroke, 'stroke-width': hi ? 2 : 1
            }, svg);
            wire(d, memberId, () => A().tipHTML(c.name, (c.died != null ? 'died ' : 'born ') + S.fmtYear(t, c.approx) + ' · lifespan unrecorded', c.blurb));
            prevEnd = xx + 4;
          }
        });
        y += rowH;
      });
      y += 4;
    }

    y += 10;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + y);
    svg.setAttribute('width', W);
    svg.setAttribute('height', y);
    /* trim era tints to the real height */
    svg.querySelectorAll('.era-tint').forEach(r => r.setAttribute('height', y - ribbonH));

    function gutterLabel(text, yy) {
      const t = make('text', { x: 8, y: yy + 4, 'font-family': 'Chivo Mono, monospace', 'font-size': 8.6, fill: T().inkFaint, 'letter-spacing': '1.6' }, svg);
      t.textContent = text;
    }
  }

  /* External API */
  function focusEra(eraId) {
    A().show('timeline');
    const e = S.eraById.get(eraId);
    if (e) fitTo(e.from, e.to);
  }
  function focusSpan(a, b) { A().show('timeline'); fitTo(a, b); }
  function focusEntity(id) {
    A().show('timeline');
    const n = S.get(id);
    if (!n) return;
    state.highlight = id;
    setTimeout(() => { state.highlight = null; sched(); }, 4200);
    if (n.type === 'event') fitTo(n.year - 45, (n.endYear != null ? n.endYear : n.year) + 45);
    else if (n.born != null || n.died != null) {
      const a = n.born != null ? n.born : n.died - 60;
      const b = n.died != null ? n.died : n.born + 60;
      fitTo(a - 30, b + 30);
    }
  }

  H.ui = H.ui || {};
  H.ui.timeline = { init, onShow: sched, focusEra, focusEntity, focusSpan };
})();

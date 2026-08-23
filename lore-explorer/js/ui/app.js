/* Holocron UI — app shell: router, tabs, shared drawer, tooltip, helpers. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;

  /* Live theme palettes — H.theme mutates these objects in place on skin switch. */
  const ALIGN_COLOR = H.theme.align;
  const KIND_COLOR = H.theme.kind;

  const $ = sel => document.querySelector(sel);
  const $$ = sel => [...document.querySelectorAll(sel)];

  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else if (v !== null && v !== undefined) n.setAttribute(k, v);
    }
    kids.flat().forEach(k => { if (k != null) n.append(k.nodeType ? k : document.createTextNode(k)); });
    return n;
  }

  function alignOf(node) {
    if (!node) return 'neutral';
    if (node.alignment) return node.alignment;
    if (node.type === 'event') return null;
    return 'neutral';
  }
  function colorOf(node) {
    if (node.type === 'event') return KIND_COLOR[node.kind] || '#9c8f9c';
    return ALIGN_COLOR[alignOf(node)] || ALIGN_COLOR.neutral;
  }

  function yearsOf(n) {
    if (n.type === 'event') return n.endYear != null ? S.fmtYear(n.year, n.approx) + ' – ' + S.fmtYear(n.endYear) : S.fmtYear(n.year, n.approx);
    if (n.type === 'character') {
      if (n.born == null && n.died == null) return '';
      return (n.born != null ? S.fmtYear(n.born, n.approx) : '…') + ' – ' + (n.died != null ? S.fmtYear(n.died, n.approx) : '…');
    }
    if (n.from != null || n.to != null) return S.fmtSpan(n.from, n.to, n.approx);
    return '';
  }

  /* Entity chip */
  function echip(id, opts) {
    const n = S.get(id);
    if (!n) return null;
    opts = opts || {};
    const dot = el('span', { class: 'dot', 'data-hc': 'ent:' + id });
    dot.style.background = colorOf(n);
    const kids = [dot, n.name];
    if (opts.year !== false) {
      const y = n.type === 'event' ? S.fmtYear(n.year, n.approx) : null;
      if (y) kids.push(el('span', { class: 'yr' }, y));
    }
    return el('button', { class: 'echip', type: 'button', onclick: () => openEntity(id) }, ...kids);
  }

  /* ── Tooltip ── */
  const tip = el('div', { class: 'tooltip' });
  document.addEventListener('DOMContentLoaded', () => document.body.append(tip));
  function showTip(x, y, html) {
    tip.innerHTML = html;
    tip.style.display = 'block';
    const w = tip.offsetWidth, h = tip.offsetHeight;
    const px = Math.min(x + 14, window.innerWidth - w - 10);
    const py = y + 16 + h > window.innerHeight ? y - h - 10 : y + 16;
    tip.style.left = px + 'px'; tip.style.top = Math.max(6, py) + 'px';
  }
  function hideTip() { tip.style.display = 'none'; }
  function tipHTML(title, sub, body) {
    return '<div class="tt-title">' + esc(title) + '</div>' +
      (sub ? '<div class="tt-sub">' + esc(sub) + '</div>' : '') +
      (body ? '<div class="tt-body">' + esc(body) + '</div>' : '');
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ── Drawer (shared entity panel) ── */
  let drawerEl, drawerBody, drawerTitle;
  function openEntity(id) {
    const n = S.get(id);
    if (!n) return;
    drawerTitle.textContent = n.name;
    drawerBody.innerHTML = '';
    const parts = entityDetail(n);
    parts.forEach((p, i) => { if (p && p.style) p.style.setProperty('--i', i); });
    drawerBody.append(...parts);
    drawerEl.classList.add('open');
    drawerEl.setAttribute('aria-hidden', 'false');
    drawerBody.scrollTop = 0;
    if (current) history.replaceState(null, '', '#/' + current + '/e/' + id);   // shareable deep link
  }
  function closeDrawer() {
    drawerEl.classList.remove('open');
    drawerEl.setAttribute('aria-hidden', 'true');
    if (current && /\/e\//.test(location.hash)) history.replaceState(null, '', '#/' + current);
  }

  function entityDetail(n) {
    const parts = [];
    /* meta line */
    const align = alignOf(n);
    const meta = el('div', { class: 'align-line' });
    meta.append(el('span', { class: 'type-tag' }, S.TYPE_LABEL[n.type] || n.type));
    if (n.type === 'event') meta.append(el('span', { class: 'type-tag' }, S.KIND_LABEL[n.kind] || n.kind));
    if (align && n.type !== 'event') {
      const t = el('span', { class: 'align-tag' }, el('span', { class: 'dot', 'data-hc': 'align:' + align }), S.ALIGN_LABEL[align]);
      t.querySelector('.dot').style.background = ALIGN_COLOR[align];
      meta.append(t);
    }
    const yrs = yearsOf(n);
    if (yrs) meta.append(el('span', { class: 'type-tag yr' }, yrs));
    S.erasOf(n).forEach(e => {
      const c = el('span', { class: 'align-tag' }, el('span', { class: 'dot', 'data-hc': 'era:' + e.id }), e.name);
      c.querySelector('.dot').style.background = e.color;
      c.style.cursor = 'pointer';
      c.addEventListener('click', () => { closeDrawer(); H.ui.timeline.focusEra(e.id); });
      meta.append(c);
    });
    parts.push(meta);

    if (n.aka && n.aka.length) parts.push(el('div', { class: 'hint-note' }, 'Also: ' + n.aka.join(' · ')));
    if (n.species) parts.push(el('div', { class: 'hint-note' }, n.species + (n.diedAt ? ' · died on ' + (S.get(n.diedAt) || {}).name : '')));
    if (n.region) parts.push(el('div', { class: 'hint-note' }, n.region));

    parts.push(el('p', { class: 'blurb' }, n.blurb));
    const body = n.bio || n.detail;
    if (body) parts.push(el('p', { class: 'bio' }, body));
    if (n.deathNote && n.type === 'character') {
      parts.push(section('Death', el('p', { class: 'bio', style: 'margin:0' }, n.deathNote)));
    }

    /* relations grouped by verb */
    const groups = new Map();
    S.neighbors(n.id).forEach(r => {
      if (r.derived) return; // event participation/locations get their own sections below
      const verb = S.relLabel(r.rel, r.dir);
      if (!groups.has(verb)) groups.set(verb, []);
      groups.get(verb).push(r);
    });
    const relWrap = el('div');
    let relCount = 0;
    [...groups.entries()].sort((a, b) => b[1].length - a[1].length).forEach(([verb, rows]) => {
      rows.slice(0, 14).forEach(r => {
        const other = S.get(r.other);
        if (!other) return;
        relCount++;
        const link = el('button', { class: 'rel-link', type: 'button', onclick: () => openEntity(r.other) }, other.name);
        const row = el('div', { class: 'rel-row' }, el('span', { class: 'rel-verb' }, verb), link);
        if (r.note) row.append(el('span', { class: 'rel-note' }, '— ' + r.note));
        relWrap.append(row);
      });
    });
    if (relCount) parts.push(section('Connections', relWrap));

    /* character/faction: events they touch */
    if (n.type !== 'event' && n.type !== 'location') {
      const evs = S.related(n.id, 'took-part', 'out').map(r => S.get(r.other)).filter(Boolean).sort((a, b) => a.year - b.year);
      if (evs.length) {
        const w = el('div');
        evs.forEach(ev => w.append(el('button', {
          class: 'battle-row', type: 'button', onclick: () => openEntity(ev.id)
        }, el('span', { class: 'yr' }, S.fmtYear(ev.year, ev.approx)), el('span', { class: 'b-name' }, ev.name))));
        parts.push(section('In the record', w));
      }
    }

    /* location: history there, academies, artifacts */
    if (n.type === 'location') {
      const evs = S.related(n.id, 'occurred-at', 'in').map(r => S.get(r.other)).filter(Boolean).sort((a, b) => a.year - b.year);
      if (evs.length) {
        const w = el('div');
        evs.forEach(ev => w.append(el('button', {
          class: 'battle-row', type: 'button', onclick: () => openEntity(ev.id)
        }, el('span', { class: 'yr' }, S.fmtYear(ev.year, ev.approx)), el('span', { class: 'b-name' }, ev.name))));
        parts.push(section('History here', w));
      }
      const acads = (S.academies || []).filter(a => a.loc === n.id);
      acads.forEach(a => {
        const w = el('div');
        if (a.blurb) w.append(el('p', { class: 'bio', style: 'margin:0 0 6px' }, a.blurb));
        a.periods.forEach(p => {
          w.append(el('div', { class: 'period-row' },
            el('div', { class: 'yr num' }, S.fmtYear(p.from, p.approx) + ' – ' + (p.to == null ? '…' : S.fmtYear(p.to, p.approxEnd))),
            el('div', { class: 'by' }, p.by),
            p.note ? el('div', { class: 'note' }, p.note) : null));
        });
        parts.push(section(a.name, w));
      });
      const arts = S.related(n.id, 'located-at', 'in').map(r => S.get(r.other)).filter(Boolean);
      if (arts.length) parts.push(section('Artifacts tied here', el('div', { class: 'chips' }, arts.map(a => echip(a.id)))));
    }

    /* event: where + who */
    if (n.type === 'event') {
      const at = S.related(n.id, 'occurred-at', 'out').map(r => S.get(r.other)).filter(Boolean);
      if (at.length) parts.push(section('Where', el('div', { class: 'chips' }, at.map(l => echip(l.id)))));
      const who = S.related(n.id, 'took-part', 'in').map(r => S.get(r.other)).filter(Boolean);
      if (who.length) parts.push(section('Who', el('div', { class: 'chips' }, who.map(c => echip(c.id, { year: false })))));
    }

    /* rabbit holes */
    const holes = S.rabbitHoles(n.id, 6).filter(h => S.get(h.id));
    if (holes.length) {
      const w = el('div', { class: 'chips' });
      holes.forEach(h => {
        const c = echip(h.id, { year: false });
        c.title = S.get(h.id).name + ' — ' + h.via + ' ' + n.name;
        w.append(c);
      });
      parts.push(section('Related rabbit holes', w));
    }

    /* sources */
    if (n.sources && n.sources.length) {
      parts.push(section('Sources', el('ul', { class: 'src-list' }, n.sources.map(s => el('li', null, s)))));
    }

    /* actions */
    const actions = el('div', { class: 'drawer-actions' });
    if (n.type === 'event' || (n.type === 'character' && (n.born != null || n.died != null))) {
      actions.append(el('button', { class: 'btn', type: 'button', onclick: () => { closeDrawer(); H.ui.timeline.focusEntity(n.id); } }, 'Show on timeline'));
    }
    if (n.type !== 'event') {
      actions.append(el('button', { class: 'btn', type: 'button', onclick: () => { closeDrawer(); H.ui.graph.focusNode(n.id); } }, 'Show in graph'));
    }
    actions.append(el('button', { class: 'btn', type: 'button', onclick: () => { closeDrawer(); H.ui.compare.addSlot(n.id); } }, 'Compare'));
    actions.append(el('button', { class: 'btn', type: 'button', onclick: () => { closeDrawer(); H.ui.ask.prefill('Tell me about ' + n.name); } }, 'Ask about this'));
    parts.push(actions);
    return parts;
  }

  function section(title, bodyEl) {
    return el('div', { class: 'd-section' }, el('h4', null, title), bodyEl);
  }

  /* ── Router ── */
  const VIEWS = ['timeline', 'graph', 'atlas', 'ask', 'eras', 'galaxy', 'compare'];
  let current = null;
  function show(view) {
    if (!VIEWS.includes(view)) view = 'timeline';
    current = view;
    VIEWS.forEach(v => {
      const elv = $('#view-' + v);
      if (elv) elv.hidden = v !== view;
      const tab = $('#tab-' + v);
      if (tab) {
        tab.classList.toggle('active', v === view);
        if (v === view) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
      }
    });
    const mod = H.ui[view === 'atlas' ? 'atlas' : view];
    if (mod && mod.onShow) mod.onShow();
    try { localStorage.setItem('holo-view', view); } catch (e) { /* private mode etc. */ }
    if (!location.hash.startsWith('#/' + view)) history.replaceState(null, '', '#/' + view);
  }

  function boot() {
    drawerEl = $('#drawer'); drawerBody = $('#drawer-body'); drawerTitle = $('#drawer-title');
    $('#drawer-close').addEventListener('click', closeDrawer);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDrawer(); $('#modal').classList.remove('open'); } });

    VIEWS.forEach(v => {
      const tab = $('#tab-' + v);
      if (tab) tab.addEventListener('click', () => {
        if (v === current) return;
        const sf = H.ui.starfield;
        if (sf && sf.jump) sf.jump(() => show(v));   // hyperspace between views
        else show(v);
      });
    });

    const gsearch = $('#global-search');
    gsearch.addEventListener('keydown', e => {
      if (e.key === 'Enter' && gsearch.value.trim()) {
        show('atlas');
        H.ui.atlas.query(gsearch.value.trim());
      }
    });

    /* init views */
    Object.values(H.ui).forEach(m => { if (m && m.init) m.init(); });

    /* initial route (view, optionally a deep-linked entity: #/atlas/e/darth-bane) */
    let v = null, deepEntity = null;
    const h = location.hash.match(/^#\/([a-z]+)(?:\/e\/([a-z0-9-]+))?/);
    if (h && VIEWS.includes(h[1])) { v = h[1]; deepEntity = h[2] || null; }
    if (!v) { try { v = localStorage.getItem('holo-view'); } catch (e) { v = null; } }
    show(VIEWS.includes(v) ? v : 'timeline');
    if (deepEntity && S.get(deepEntity)) setTimeout(() => openEntity(deepEntity), 80);
    window.addEventListener('hashchange', () => {
      const m = location.hash.match(/^#\/([a-z]+)/);
      if (m && VIEWS.includes(m[1]) && m[1] !== current) show(m[1]);
    });
  }

  H.ui = H.ui || {};
  H.app = { el, $, $$, echip, openEntity, closeDrawer, show, showTip, hideTip, tipHTML, esc, colorOf, alignOf, yearsOf, ALIGN_COLOR, KIND_COLOR };
  document.addEventListener('DOMContentLoaded', boot);
})();

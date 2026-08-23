/* Holocron UI — compare: side-by-side character/era (and anything else) comparison. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;

  let inputA, inputB, out;
  const byName = new Map();
  const slots = [null, null];

  function init() {
    const { el } = A();
    const root = document.getElementById('view-compare');
    inputA = root.querySelector('#cmp-a');
    inputB = root.querySelector('#cmp-b');
    out = root.querySelector('#cmp-out');
    const dl = root.querySelector('#cmp-names');

    S.nodes.forEach(n => {
      const label = n.name + '  (' + S.TYPE_LABEL[n.type] + ')';
      byName.set(label.toLowerCase(), n.id);
      byName.set(S.norm(n.name), n.id);
      dl.append(el('option', { value: label }));
    });
    S.deepDives.forEach(dd => {
      const label = dd.name + '  (Era)';
      byName.set(label.toLowerCase(), 'dd:' + dd.id);
      byName.set(S.norm(dd.name), 'dd:' + dd.id);
      dl.append(el('option', { value: label }));
    });

    [inputA, inputB].forEach((inp, i) => {
      inp.addEventListener('change', () => { slots[i] = resolve(inp.value); render(); });
      inp.addEventListener('keydown', e => { if (e.key === 'Enter') { slots[i] = resolve(inp.value); render(); } });
    });

    /* default demo pairing */
    slots[0] = 'revan'; slots[1] = 'darth-bane';
    inputA.value = 'Revan  (Character)';
    inputB.value = 'Darth Bane  (Character)';
    render();
  }

  function resolve(text) {
    if (!text) return null;
    const t = text.trim().toLowerCase();
    if (byName.has(t)) return byName.get(t);
    const nrm = S.norm(text);
    if (byName.has(nrm)) return byName.get(nrm);
    const linked = S.linkEntities(text, 1)[0];
    if (linked) return linked.id;
    const hit = H.search.search(text, { limit: 1 })[0];
    return hit && hit.node ? hit.id : null;
  }

  function addSlot(id) {
    A().show('compare');
    const n = S.get(id);
    if (!n) return;
    const label = n.name + '  (' + S.TYPE_LABEL[n.type] + ')';
    if (!slots[0] || slots[0] === id) { slots[0] = id; inputA.value = label; }
    else { slots[1] = id; inputB.value = label; }
    render();
  }

  /* DOM append() stringifies null — route every maybe-null field through this. */
  function put(parent, node) { if (node) parent.append(node); }

  function field(title, bodyEl) {
    const { el } = A();
    if (!bodyEl) return null;
    return el('div', { class: 'cmp-field' }, el('h5', null, title), el('div', { class: 'body' }, bodyEl));
  }
  function chipRow(ids) {
    const { el } = A();
    ids = [...new Set(ids)].filter(id => S.get(id));
    if (!ids.length) return null;
    return el('div', { class: 'chips' }, ids.slice(0, 10).map(id => A().echip(id, { year: false })));
  }
  function relNames(id, rel, dir) { return S.related(id, rel, dir).map(r => r.other); }

  function columnFor(ref) {
    const { el } = A();
    if (ref && ref.startsWith('dd:')) return eraColumn(ref.slice(3));
    const n = S.get(ref);
    if (!n) return el('div', { class: 'cmp-col hint-note' }, 'Pick an entry — type a name and choose from the list.');
    const col = el('div', { class: 'cmp-col' });
    col.append(el('h3', null, n.name));
    const meta = el('div', { class: 'align-line' });
    meta.append(el('span', { class: 'type-tag' }, S.TYPE_LABEL[n.type]));
    const align = A().alignOf(n);
    if (align && n.type !== 'event') {
      const t = el('span', { class: 'align-tag' }, el('span', { class: 'dot' }), S.ALIGN_LABEL[align]);
      t.querySelector('.dot').style.background = A().ALIGN_COLOR[align];
      meta.append(t);
    }
    const yrs = A().yearsOf(n);
    if (yrs) meta.append(el('span', { class: 'type-tag yr' }, yrs));
    S.erasOf(n).slice(0, 3).forEach(e => {
      const t = el('span', { class: 'type-tag' }, e.name);
      t.style.color = e.color;
      meta.append(t);
    });
    col.append(meta);
    col.append(el('p', { class: 'bio', style: 'margin:6px 0 2px' }, n.blurb));

    if (n.type === 'character') {
      put(col, field('Masters', chipRow(relNames(n.id, 'trained', 'in'))));
      put(col, field('Apprentices & students', chipRow(relNames(n.id, 'trained', 'out'))));
      put(col, field('Killed', chipRow(relNames(n.id, 'killed', 'out'))));
      put(col, field('Killed by', chipRow(relNames(n.id, 'killed', 'in'))));
      put(col, field('Affiliations', chipRow([...relNames(n.id, 'member', 'out'), ...relNames(n.id, 'led', 'out'), ...relNames(n.id, 'founded', 'out')])));
      put(col, field('Wielded & practiced', chipRow([...relNames(n.id, 'wielded', 'out'), ...relNames(n.id, 'created', 'out'), ...relNames(n.id, 'practiced', 'out'), ...relNames(n.id, 'authored', 'out')])));
      const evs = relNames(n.id, 'took-part', 'out');
      put(col, field('In the record', el('span', null, evs.length + ' events across ' + S.erasOf(n).length + ' era(s)')));
    } else if (n.type === 'faction') {
      put(col, field('Founded by', chipRow(relNames(n.id, 'founded', 'in'))));
      put(col, field('Leaders', chipRow(relNames(n.id, 'led', 'in'))));
      put(col, field('In its ranks', chipRow(relNames(n.id, 'member', 'in'))));
    } else if (n.type === 'location') {
      put(col, field('Region', el('span', null, n.region)));
      const evs = relNames(n.id, 'occurred-at', 'in').map(id => S.get(id)).filter(Boolean).sort((a, b) => a.year - b.year);
      put(col, field('History here', chipRow(evs.slice(0, 8).map(e => e.id))));
      const acads = (S.academies || []).filter(a => a.loc === n.id);
      if (acads.length) put(col, field('Academies', el('span', null, acads.map(a => a.name + ' (' + a.periods.length + ' cycles)').join(' · '))));
    } else {
      put(col, field('Created / authored by', chipRow([...relNames(n.id, 'created', 'in'), ...relNames(n.id, 'authored', 'in')])));
      put(col, field('Wielded / practiced by', chipRow([...relNames(n.id, 'wielded', 'in'), ...relNames(n.id, 'practiced', 'in'), ...relNames(n.id, 'bore', 'in'), ...relNames(n.id, 'embodies', 'in')])));
    }
    return col;
  }

  function eraColumn(ddId) {
    const { el } = A();
    const dd = S.deepDives.find(d => d.id === ddId);
    if (!dd) return el('div', { class: 'cmp-col hint-note' }, 'Unknown era.');
    const era = S.eraById.get(dd.era);
    const col = el('div', { class: 'cmp-col' });
    col.append(el('h3', null, dd.name));
    const meta = el('div', { class: 'align-line' },
      el('span', { class: 'type-tag' }, 'Era'),
      el('span', { class: 'type-tag yr' }, S.fmtSpan(dd.span[0], dd.span[1])));
    if (era) { const t = el('span', { class: 'type-tag' }, era.name); t.style.color = era.color; meta.append(t); }
    col.append(meta);
    col.append(el('p', { class: 'bio', style: 'margin:6px 0 2px' }, dd.summary.split('. ').slice(0, 2).join('. ') + '.'));
    put(col, field('Key battles', chipRow(dd.battles)));
    put(col, field('Key figures', chipRow(dd.figures)));
    put(col, field('Warfare & technology', el('span', null, dd.techState)));
    put(col, field('Jedi vs. Sith', el('span', null, dd.statusQuo)));
    return col;
  }

  function sharedSection(a, b) {
    const { el } = A();
    if (!a || !b || a.startsWith('dd:') || b.startsWith('dd:')) return null;
    const na = S.get(a), nb = S.get(b);
    if (!na || !nb) return null;
    const wrap = el('div', { class: 'cmp-col cmp-shared' });
    wrap.append(el('h3', null, 'Between them'));
    let any = false;
    /* direct edges */
    const direct = S.neighbors(a).filter(r => r.other === b);
    if (direct.length) {
      any = true;
      const w = el('div');
      direct.forEach(r => w.append(el('div', { class: 'rel-row' },
        el('span', { class: 'rel-verb' }, na.name),
        el('span', null, S.relLabel(r.rel, r.dir) + ' ' + nb.name + (r.note ? ' — ' + r.note : '')))));
      put(wrap, field('Direct connection', w));
    }
    /* shared events */
    const evA = new Set(relNames(a, 'took-part', 'out'));
    const evShared = relNames(b, 'took-part', 'out').filter(id => evA.has(id));
    if (evShared.length) { any = true; put(wrap, field('Shared events', chipRow(evShared))); }
    /* shared neighbors */
    const nA = new Set(S.neighbors(a).map(r => r.other));
    const shared = [...new Set(S.neighbors(b).map(r => r.other))].filter(id => nA.has(id) && id !== a && id !== b);
    if (shared.length) { any = true; put(wrap, field('Shared connections', chipRow(shared))); }
    if (!any) wrap.append(el('p', { class: 'hint-note' }, 'No recorded link — six thousand years is a lot of room.'));
    return wrap;
  }

  function render() {
    const { el } = A();
    out.innerHTML = '';
    const grid = el('div', { class: 'cmp-grid' });
    grid.append(columnFor(slots[0]));
    grid.append(columnFor(slots[1]));
    const shared = sharedSection(slots[0], slots[1]);
    if (shared) grid.append(shared);
    out.append(grid);
  }

  H.ui = H.ui || {};
  H.ui.compare = { init, addSlot };
})();

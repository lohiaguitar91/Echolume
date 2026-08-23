/* Holocron UI — atlas: full-text lore database with type filters and browse index. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;

  const TYPE_FILTERS = [
    { id: null, label: 'Everything' },
    { id: 'character', label: 'Characters' },
    { id: 'faction', label: 'Factions' },
    { id: 'location', label: 'Worlds' },
    { id: 'event', label: 'Events' },
    { id: 'artifact', label: 'Artifacts' },
    { id: 'concept', label: 'Concepts' }
  ];
  const FEATURED = ['Korriban academy history', 'Rule of Two origins', 'Revan’s lineage', 'thought bomb',
    'battle meditation', 'Mandalorian Wars', 'wound in the Force', 'Star Forge'];

  let input, resultsEl, typeFilter = null, chipsEl;

  function init() {
    const { el } = A();
    const root = document.getElementById('view-atlas');
    input = root.querySelector('#atlas-q');
    resultsEl = root.querySelector('#atlas-results');
    chipsEl = root.querySelector('#atlas-types');

    TYPE_FILTERS.forEach(t => {
      const c = el('button', { class: 'chip' + (t.id === null ? ' active' : ''), type: 'button', 'data-t': t.id || '' }, t.label);
      c.addEventListener('click', () => {
        typeFilter = t.id;
        chipsEl.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', (x.dataset.t || null) === typeFilter));
        run();
      });
      chipsEl.append(c);
    });

    let deb = null;
    input.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(run, 140); });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') run(); });
    run();
  }

  function query(q) { input.value = q; run(); }

  function markSnippet(sn) {
    return A().esc(sn).replace(/⟪/g, '<mark>').replace(/⟫/g, '</mark>');
  }

  function resultRow(r) {
    const { el } = A();
    const n = r.node;
    if (!n && r.academy) {
      const a = r.academy;
      return el('button', {
        class: 'result', type: 'button', onclick: () => A().openEntity(a.loc)
      },
        el('div', { class: 'result-top' },
          el('span', { class: 'result-name' }, a.name),
          el('span', { class: 'type-tag' }, 'Academy'),
          el('span', { class: 'type-tag' }, a.side === 'sith' ? 'Sith' : 'Jedi')),
        el('div', { class: 'result-snippet', html: markSnippet(r.snippet) }));
    }
    const yrs = A().yearsOf(n);
    return el('button', {
      class: 'result', type: 'button', onclick: () => A().openEntity(n.id)
    },
      el('div', { class: 'result-top' },
        el('span', { class: 'result-name' }, n.name),
        el('span', { class: 'type-tag' }, S.TYPE_LABEL[n.type]),
        yrs ? el('span', { class: 'type-tag yr' }, yrs) : null,
        ...S.erasOf(n).slice(0, 2).map(e => {
          const t = el('span', { class: 'type-tag' }, e.name);
          t.style.color = e.color; t.style.borderColor = e.color + '55';
          return t;
        })),
      el('div', { class: 'result-snippet', html: markSnippet(r.snippet) }));
  }

  function run() {
    const { el } = A();
    const q = input.value.trim();
    resultsEl.innerHTML = '';
    if (!q) {
      /* featured + browse */
      const feat = el('div', { class: 'chips' });
      FEATURED.forEach(f => feat.append(el('button', { class: 'chip', type: 'button', onclick: () => query(f) }, f)));
      resultsEl.append(el('div', { class: 'panel' },
        el('div', { class: 'toolbar-label', style: 'margin-bottom:9px' }, 'Try a thread'),
        feat));

      const order = ['character', 'faction', 'location', 'event', 'artifact', 'concept'];
      order.forEach(type => {
        if (typeFilter && typeFilter !== type) return;
        const group = [...S.nodes.values()].filter(n => n.type === type)
          .sort((a, b) => type === 'event' ? a.year - b.year : a.name.localeCompare(b.name));
        if (!group.length) return;
        const g = el('div', { class: 'browse-group' },
          el('h3', null, S.TYPE_LABEL[type] + 's — ' + group.length));
        const chips = el('div', { class: 'chips' });
        group.forEach(n => chips.append(A().echip(n.id)));
        g.append(chips);
        resultsEl.append(g);
      });
      return;
    }
    const res = H.search.search(q, { limit: 28, types: typeFilter ? [typeFilter] : null });
    if (!res.length) {
      resultsEl.append(el('div', { class: 'panel hint-note' },
        'Nothing in the record matches “' + q + '”. Try a character, world, war, artifact, or doctrine — or ask it as a question in the Ask view.'));
      return;
    }
    res.forEach(r => resultsEl.append(resultRow(r)));
  }

  H.ui = H.ui || {};
  H.ui.atlas = { init, query, onShow: () => input && input.focus() };
})();

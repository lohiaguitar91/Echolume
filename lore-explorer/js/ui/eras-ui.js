/* Holocron UI — era deep-dives: collapsible period studies with battles, figures,
   technological state, and the Jedi-vs-Sith balance. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;
  const A = () => H.app;

  function init() {
    const { el } = A();
    const root = document.getElementById('view-eras');
    const list = root.querySelector('#era-list');

    S.deepDives.forEach((dd, i) => {
      const era = S.eraById.get(dd.era);
      const acc = el('div', { class: 'era-acc' + (i === 0 ? ' open' : '') });
      const bar = el('span', { class: 'era-bar' });
      bar.style.background = era ? era.color : '#c9a06a';

      const head = el('button', { class: 'era-head', type: 'button', 'aria-expanded': i === 0 ? 'true' : 'false' },
        bar,
        el('span', { class: 'era-title' }, dd.name),
        el('span', { class: 'era-span num' }, S.fmtSpan(dd.span[0], dd.span[1])),
        el('span', { class: 'era-caret' }, '▸'));
      head.addEventListener('click', () => {
        const open = acc.classList.toggle('open');
        head.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      const body = el('div', { class: 'era-body' });
      body.append(el('p', { class: 'summary' }, dd.summary));

      const grid = el('div', { class: 'era-grid' });

      /* battles & turning points */
      const battles = el('div', { class: 'era-cell' }, el('h4', null, 'Battles & turning points'));
      (dd.battles || []).map(id => S.get(id)).filter(Boolean).sort((a, b) => a.year - b.year).forEach(ev => {
        battles.append(el('button', { class: 'battle-row', type: 'button', onclick: () => A().openEntity(ev.id) },
          el('span', { class: 'yr' }, S.fmtYear(ev.year, ev.approx)),
          el('span', { class: 'b-name' }, ev.name)));
      });
      grid.append(battles);

      /* figures */
      const figs = el('div', { class: 'era-cell' }, el('h4', null, 'Key figures'));
      const chips = el('div', { class: 'chips' });
      (dd.figures || []).forEach(id => { const c = A().echip(id, { year: false }); if (c) chips.append(c); });
      figs.append(chips);
      grid.append(figs);

      grid.append(el('div', { class: 'era-cell' }, el('h4', null, 'Warfare & technology'), el('p', null, dd.techState)));
      grid.append(el('div', { class: 'era-cell' }, el('h4', null, 'Jedi vs. Sith — the balance'), el('p', null, dd.statusQuo)));

      body.append(grid);
      body.append(el('div', { style: 'margin-top:16px' },
        el('button', {
          class: 'btn', type: 'button',
          onclick: () => H.ui.timeline.focusSpan(dd.span[0], dd.span[1])
        }, 'Open this span on the timeline')));

      acc.append(head, body);
      list.append(acc);
    });
  }

  H.ui = H.ui || {};
  H.ui.eras = { init };
})();

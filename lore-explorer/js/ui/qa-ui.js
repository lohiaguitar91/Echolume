/* Holocron UI — Ask: natural-language questions answered from the lore graph, with citations. */
(function () {
  'use strict';
  const H = window.HOLO;
  const A = () => H.app;

  const SAMPLES = [
    'When did the Sith academy reopen after Bane?',
    'Who trained Darth Nihilus?',
    'Who killed Darth Malak?',
    'What is the Rule of Two?',
    'Revan’s lineage',
    'What happened in 3996 BBY?',
    'Where did Darth Bane die?',
    'Who led the Army of Light?',
    'History of the Korriban academy'
  ];

  let input, cards;

  function init() {
    const { el } = A();
    const root = document.getElementById('view-ask');
    input = root.querySelector('#ask-q');
    cards = root.querySelector('#ask-cards');
    const btn = root.querySelector('#ask-go');
    const samplesEl = root.querySelector('#ask-samples');

    SAMPLES.forEach(s => samplesEl.append(el('button', {
      class: 'chip', type: 'button', onclick: () => { input.value = s; go(); }
    }, s)));

    btn.addEventListener('click', go);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') go(); });
  }

  function go() {
    const q = input.value.trim();
    if (!q) return;
    const { el } = A();
    const a = H.qa.answer(q);
    const card = el('div', { class: 'qa-card' });
    card.append(el('div', { class: 'qa-q' }, '» ' + q));
    card.append(el('div', { class: 'qa-a' }, a.text));

    const meta = el('div', { class: 'qa-meta' });
    if (a.chips && a.chips.length) {
      const chips = el('div', { class: 'chips' });
      [...new Set(a.chips)].slice(0, 8).forEach(id => { const c = A().echip(id, { year: false }); if (c) chips.append(c); });
      meta.append(chips);
    }
    if (a.cites && a.cites.length) {
      meta.append(el('div', { class: 'qa-cites', html: '<b>Sources:</b> ' + a.cites.map(A().esc).join(' · ') }));
    }
    if (a.followups && a.followups.length) {
      const f = el('div', { class: 'qa-followups' });
      a.followups.forEach(s => f.append(el('button', {
        class: 'chip', type: 'button', onclick: () => { input.value = s; go(); }
      }, s)));
      meta.append(f);
    }
    card.append(meta);
    cards.prepend(card);
    input.select();
  }

  function prefill(q) {
    A().show('ask');
    input.value = q;
    go();
  }

  H.ui = H.ui || {};
  H.ui.ask = { init, prefill, onShow: () => input && input.focus() };
})();

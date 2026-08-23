/* Holocron UI — theme engine. Two skins:
   - archive: the Sith-archive look (crimson obsidian, Saira body)
   - console: classic Star Wars console/datapad (phosphor green on black, mono body, CRT)
   CSS chrome swaps via body[data-skin] custom-property overrides; canvas/SVG drawing code
   reads live tokens from H.theme.t / .align / .kind, and era colors are remapped in place.
   Swatches tagged data-hc="era:X|align:X|kind:X|ent:ID" are re-painted on switch. */
(function () {
  'use strict';
  const H = window.HOLO;
  const S = H.store;

  const SKINS = {
    archive: {
      label: 'Archive',
      t: {
        canvasBg: '#120e12', ribbonBg: '#171114',
        ink: '#ece4da', inkDim: '#a8998f', inkFaint: '#75655e', labelInk: '#cfc4ba',
        grid: '#241a1f', line: '#33242b', dotStroke: '#0d0a0c',
        hl: '#c9a06a',
        starColors: ['#8fb4d8', '#f2e9dc', '#cfc4ba'],
        mapInner: '#141013', sithSpace: '#8e2a26', lane: '#8e2a26', laneLabel: '#8e5a50',
        barLabel: '#0d0a0c'
      },
      align: { sith: '#e0463c', jedi: '#58a6f2', gray: '#c9a06a', neutral: '#8f8f9c' },
      kind: {
        war: '#8e2a26', battle: '#e0463c', duel: '#e28f4a', founding: '#c9a06a', political: '#9c8f9c',
        death: '#b9463e', catastrophe: '#a03cc2', academy: '#58a6f2', discovery: '#5fc6b8',
        ritual: '#8f6fd8', turning: '#d8c26f'
      },
      eras: null   // null = use the authored era colors
    },
    console: {
      label: 'Console',
      t: {
        canvasBg: '#020a06', ribbonBg: '#041209',
        ink: '#cdeed3', inkDim: '#7fbf95', inkFaint: '#47765b', labelInk: '#a8dcb4',
        grid: '#0c281b', line: '#144030', dotStroke: '#02120a',
        hl: '#ffe066',
        starColors: ['#9adfb4', '#47ff96', '#2f9e5c'],
        mapInner: '#03140c', sithSpace: '#ff5240', lane: '#2f9e5c', laneLabel: '#54a878',
        barLabel: '#02160c'
      },
      align: { sith: '#ff5240', jedi: '#47ff96', gray: '#ffb432', neutral: '#8fd8d0' },
      kind: {
        war: '#e85a3d', battle: '#ff7a52', duel: '#ffb432', founding: '#7df0a8', political: '#56b88a',
        death: '#ff4838', catastrophe: '#ffe066', academy: '#38d0f0', discovery: '#8ff0d0',
        ritual: '#66c8e8', turning: '#d8f07a'
      },
      eras: ['#2f9e5c', '#35b06b', '#52c47a', '#86c96a', '#b8d05a', '#57d8b0', '#e8b84a', '#f09a42', '#f0663d', '#4ad8d0']
    }
  };

  /* Live token objects — modules hold references; set() mutates them in place. */
  const theme = {
    skin: 'archive',
    t: Object.assign({}, SKINS.archive.t),
    align: Object.assign({}, SKINS.archive.align),
    kind: Object.assign({}, SKINS.archive.kind),
    listeners: [],
    onChange(cb) { this.listeners.push(cb); }
  };

  function set(skin, opts) {
    if (!SKINS[skin]) skin = 'archive';
    theme.skin = skin;
    const def = SKINS[skin];
    Object.assign(theme.t, def.t);
    Object.assign(theme.align, def.align);
    Object.assign(theme.kind, def.kind);
    /* era colors remapped in place (originals kept on first switch) */
    S.eras.forEach((e, i) => {
      if (e._c0 === undefined) e._c0 = e.color;
      e.color = def.eras ? (def.eras[i] || e._c0) : e._c0;
    });
    document.body.dataset.skin = skin;
    const btn = document.getElementById('skin-toggle');
    if (btn) btn.textContent = skin === 'archive' ? '▤ Console mode' : '◈ Archive mode';
    /* repaint every tagged swatch */
    document.querySelectorAll('[data-hc]').forEach(el => {
      const i = el.dataset.hc.indexOf(':');
      const kind = el.dataset.hc.slice(0, i), id = el.dataset.hc.slice(i + 1);
      let c = null;
      if (kind === 'era') { const e = S.eraById.get(id); c = e && e.color; }
      else if (kind === 'align') c = theme.align[id];
      else if (kind === 'kind') c = theme.kind[id];
      else if (kind === 'ent') { const n = S.get(id); if (n && H.app) c = H.app.colorOf(n); }
      if (c) el.style.background = c;
    });
    if (!(opts && opts.silent)) theme.listeners.forEach(cb => { try { cb(skin); } catch (e) { /* keep going */ } });
    try { localStorage.setItem('holo-skin', skin); } catch (e) { /* fine */ }
  }
  theme.set = set;

  /* Apply the saved skin immediately (script runs before first paint of the app UI). */
  let saved = 'archive';
  try { saved = localStorage.getItem('holo-skin') || 'archive'; } catch (e) { /* fine */ }
  if (!SKINS[saved]) saved = 'archive';
  document.body.dataset.skin = saved;

  function init() {
    const btn = document.getElementById('skin-toggle');
    if (btn) btn.addEventListener('click', () => set(theme.skin === 'archive' ? 'console' : 'archive'));
    set(saved, { silent: true });   // paints swatches created during module init
  }

  H.theme = theme;
  H.ui = H.ui || {};
  H.ui.theme = { init };
})();

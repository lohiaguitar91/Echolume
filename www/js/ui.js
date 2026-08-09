// DOM overlay: screens, HUD, toasts. Pure view layer — main.js wires events.

import { LEVELS } from './levels.js';
import { formatTime } from './util.js';

const $ = (id) => document.getElementById(id);

export class UI {
  constructor() {
    this.screens = {
      hud: $('screen-hud'),
      title: $('screen-title'),
      levels: $('screen-levels'),
      settings: $('screen-settings'),
      about: $('screen-about'),
      howto: $('screen-howto'),
      paused: $('screen-pause'),
      results: $('screen-results'),
      gameover: $('screen-gameover'),
      credits: $('screen-credits'),
      rotate: $('screen-rotate'),
    };
    this.el = {
      hearts: $('hud-hearts'),
      motes: $('hud-motes'),
      pings: $('hud-pings'),
      depth: $('hud-depth'),
      levelName: $('hud-level-name'),
      hint: $('hud-hint'),
      toast: $('hud-toast'),
      levelGrid: $('level-grid'),
      totalStars: $('total-stars'),
      resultsTitle: $('results-title'),
      resultsStars: $('results-stars'),
      resultsStats: $('results-stats'),
      gameoverSub: $('gameover-sub'),
      btnAbyss: $('btn-abyss'),
      btnNext: $('btn-next'),
      versionLine: $('version-line'),
    };
    this._hintTimer = null;
    this._toastTimer = null;
    this._activeOverlays = new Set();
  }

  // ---- screens ----
  show(name) {
    for (const [key, elem] of Object.entries(this.screens)) {
      if (key === 'rotate') continue;
      const on = key === name || (key === 'hud' && this._hudWith(name));
      if (on) {
        elem.hidden = false;
        requestAnimationFrame(() => elem.classList.add('visible'));
      } else {
        elem.classList.remove('visible');
        elem.hidden = true;
      }
    }
  }

  _hudWith(name) {
    return name === 'paused' || name === 'results' || name === 'gameover' || name === 'credits';
  }

  showRotate(on) {
    this.screens.rotate.hidden = !on;
    this.screens.rotate.classList.toggle('visible', on);
  }

  // ---- HUD ----
  setHearts(n, max) {
    const h = this.el.hearts;
    if (h.childElementCount !== max) {
      h.innerHTML = '';
      for (let i = 0; i < max; i++) {
        const d = document.createElement('span');
        d.className = 'heart';
        h.appendChild(d);
      }
    }
    [...h.children].forEach((c, i) => c.classList.toggle('lost', i >= n));
  }

  loseHeartFx() {
    document.body.classList.remove('flash-damage');
    void document.body.offsetWidth; // restart animation
    document.body.classList.add('flash-damage');
  }

  setMotes(got, total) {
    this.el.motes.textContent = total > 0 ? `${got}/${total}` : `${got}`;
    const wrap = this.el.motes.parentElement;
    wrap.classList.remove('pop');
    void wrap.offsetWidth;
    wrap.classList.add('pop');
  }

  setPings(n) { this.el.pings.textContent = n; }

  setDepth(m) {
    this.el.depth.hidden = false;
    this.el.depth.textContent = `${m} m`;
  }
  hideDepth() { this.el.depth.hidden = true; }

  setLevelName(text) { this.el.levelName.textContent = text; }

  hint(text, ms = 4600) {
    const h = this.el.hint;
    clearTimeout(this._hintTimer);
    h.textContent = text;
    h.hidden = false;
    h.classList.remove('visible');
    void h.offsetWidth;
    h.classList.add('visible');
    this._hintTimer = setTimeout(() => {
      h.classList.remove('visible');
      setTimeout(() => { h.hidden = true; }, 400);
    }, ms);
  }

  toast(text, ms = 2600) {
    const t = this.el.toast;
    clearTimeout(this._toastTimer);
    t.textContent = text;
    t.hidden = false;
    t.classList.remove('visible');
    void t.offsetWidth;
    t.classList.add('visible');
    this._toastTimer = setTimeout(() => {
      t.classList.remove('visible');
      setTimeout(() => { t.hidden = true; }, 650);
    }, ms);
  }

  setDangerLow(on) {
    document.body.classList.toggle('danger-low', on);
  }

  // ---- level select ----
  buildLevelGrid(save, onPick) {
    const grid = this.el.levelGrid;
    grid.innerHTML = '';
    for (const lvl of LEVELS) {
      const unlocked = save.isUnlocked(lvl.id);
      const rec = save.data.levels[lvl.id];
      const btn = document.createElement('button');
      btn.className = 'level-cell' + (unlocked ? '' : ' locked');
      btn.disabled = !unlocked;
      const stars = rec ? rec.stars : 0;
      btn.innerHTML = `
        <span class="level-num">${lvl.id}</span>
        <span class="level-name">${unlocked ? lvl.name : '???'}</span>
        <span class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}</span>`;
      if (unlocked) btn.addEventListener('click', () => onPick(lvl.id));
      grid.appendChild(btn);
    }
    const total = save.totalStars();
    this.el.totalStars.textContent = `${total} / ${LEVELS.length * 3} stars`;
  }

  refreshAbyssButton(save) {
    const b = this.el.btnAbyss;
    b.disabled = !save.data.abyssUnlocked;
    b.textContent = save.data.abyssUnlocked
      ? `The Abyss${save.data.abyssBestDepth ? ` · ${save.data.abyssBestDepth} m` : ''}`
      : 'The Abyss · locked';
  }

  // ---- results ----
  fillResults(defName, stars, stats, opts = {}) {
    this.el.resultsTitle.textContent = opts.finale ? 'The deep opens' : 'Vent reached';
    const starEls = this.el.resultsStars.querySelectorAll('.star');
    starEls.forEach((s, i) => {
      s.classList.remove('earned', 'pop1', 'pop2', 'pop3');
      if (i < stars) {
        setTimeout(() => s.classList.add('earned', `pop${i + 1}`), 350 + i * 380);
      }
    });
    // Show what each star wants, so a missed star is a goal, not a mystery.
    if (opts.def) {
      const need = Math.ceil((opts.def.stars?.motePct || 1) * stats.moteTotal);
      const labels = {
        1: 'reach the vent',
        2: `gather ${need} motes`,
        3: `≤ ${opts.def.stars?.maxPings ?? '—'} songs`,
      };
      for (const [n, text] of Object.entries(labels)) {
        const el = this.el.resultsStars.querySelector(`[data-starlabel="${n}"]`);
        if (el) el.textContent = text;
      }
    }
    this.el.resultsStats.innerHTML = `
      <div class="stat-row"><span>Motes</span><span>${stats.motes} / ${stats.moteTotal}</span></div>
      <div class="stat-row"><span>Songs</span><span>${stats.pings}</span></div>
      <div class="stat-row"><span>Time</span><span>${formatTime(stats.time)}</span></div>`;
    this.el.btnNext.hidden = !!opts.finale || !opts.hasNext;
  }

  fillGameover(mode, stats) {
    this.el.gameoverSub.textContent = mode === 'abyss'
      ? `You reached ${stats.depth} m before the dark closed in.`
      : stats.lastHit === 'hunter'
        ? `Sing softer this time.`
        : `The thorns do not listen. Sing before you rush.`;
  }

  setVersion(v) { this.el.versionLine.textContent = `v${v}`; }
}

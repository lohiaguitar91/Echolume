// DOM overlay: screens, HUD, toasts. Pure view layer — main.js wires events.

import { LEVELS, parTime, teaser } from './levels.js';
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
      abyssintro: $('screen-abyss-intro'),
      abyssrecap: $('screen-abyss-recap'),
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
    return name === 'paused' || name === 'results' || name === 'gameover' ||
           name === 'credits' || name === 'abyssrecap';
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
  static moteTotal(lvl) {
    return (lvl.moteCount || 0) + (lvl.extraMotes || []).reduce((s, em) => s + em.count, 0);
  }

  buildLevelGrid(save, onPick) {
    const grid = this.el.levelGrid;
    grid.innerHTML = '';
    let motesGathered = 0, motesInGame = 0;
    for (const lvl of LEVELS) {
      const unlocked = save.isUnlocked(lvl.id);
      const rec = save.data.levels[lvl.id];
      const total = UI.moteTotal(lvl);
      motesInGame += total;
      if (rec) motesGathered += Math.min(rec.bestMotes, total);
      const btn = document.createElement('button');
      btn.className = 'level-cell' + (unlocked ? '' : ' locked');
      btn.disabled = !unlocked;
      const stars = rec ? rec.stars : 0;
      const bestLine = rec
        ? `<span class="level-best">${Math.min(rec.bestMotes, total)}/${total} motes</span>`
        : (unlocked ? `<span class="level-best dim">${total} motes wait</span>` : '');
      const par = parTime(lvl.id);
      const hasMedal = rec && par && rec.bestTime <= par;
      const medalLine = hasMedal ? `<span class="level-medal">⏱ ${formatTime(rec.bestTime)}</span>` : '';
      btn.innerHTML = `
        <span class="level-num">${lvl.id}</span>
        <span class="level-name">${unlocked ? lvl.name : '???'}</span>
        <span class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, 3 - stars))}</span>
        ${bestLine}${medalLine}`;
      if (unlocked) btn.addEventListener('click', () => onPick(lvl.id));
      grid.appendChild(btn);
    }
    const total = save.totalStars();
    this.el.totalStars.textContent =
      `${total} / ${LEVELS.length * 3} stars · ${motesGathered} / ${motesInGame} motes`;
  }

  refreshAbyssButton(save) {
    const b = this.el.btnAbyss;
    b.disabled = !save.data.abyssUnlocked;
    b.textContent = save.data.abyssUnlocked
      ? `The Abyss${save.data.abyssBestDepth ? ` · ${save.data.abyssBestDepth} m` : ''}`
      : 'The Abyss · clear depth 7';
  }

  // ---- results ----
  fillResults(defName, stars, stats, opts = {}) {
    this.el.resultsTitle.textContent = opts.finale ? 'The deep opens' : 'Vent reached';
    const starEls = this.el.resultsStars.querySelectorAll('.star');
    // Light each star by its own criterion, staggered among the earned ones.
    const earned = opts.breakdown
      ? [opts.breakdown.vent, opts.breakdown.motes, opts.breakdown.songs]
      : [true, stars >= 2, stars >= 3];
    let popIndex = 0;
    starEls.forEach((s, i) => {
      s.classList.remove('earned', 'pop1', 'pop2', 'pop3');
      if (earned[i]) {
        const delay = 350 + popIndex * 380;
        popIndex++;
        setTimeout(() => s.classList.add('earned', `pop${i + 1}`), delay);
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
    // Trench medal: beat par to earn it, and always show what par was.
    const chip = document.getElementById('medal-chip');
    const par = opts.def ? parTime(opts.def.id) : null;
    if (par) {
      const earned = stats.time <= par;
      chip.hidden = false;
      chip.classList.toggle('missed', !earned);
      chip.textContent = earned
        ? `⏱ ${formatTime(stats.time)} · trench medal`
        : `⏱ ${formatTime(stats.time)} · par ${formatTime(par)}`;
    } else {
      chip.hidden = true;
    }

    // A line of anticipation for what's next.
    const tease = document.getElementById('next-tease');
    const nextDef = opts.def ? LEVELS.find((l) => l.id === opts.def.id + 1) : null;
    const nextLine = nextDef ? teaser(nextDef.id) : null;
    if (opts.hasNext && nextDef && nextLine) {
      tease.hidden = false;
      tease.innerHTML = `Next · <span class="accent">${nextDef.name}</span> — ${nextLine}`;
    } else {
      tease.hidden = true;
    }

    const bestRow = opts.record
      ? `<div class="stat-row best"><span>Level best</span><span>${Math.min(opts.record.bestMotes, stats.moteTotal)} / ${stats.moteTotal} motes · ${opts.record.bestPings} songs</span></div>`
      : '';
    this.el.resultsStats.innerHTML = `
      <div class="stat-row"><span>Motes</span><span>${stats.motes} / ${stats.moteTotal}</span></div>
      <div class="stat-row"><span>Songs</span><span>${stats.pings}</span></div>
      <div class="stat-row"><span>Time</span><span>${formatTime(stats.time)}</span></div>
      ${bestRow}`;
    this.el.btnNext.hidden = !!opts.finale || !opts.hasNext;
  }

  // The Abyss earns its own ending: was this a record, how close, what's next.
  fillAbyssRecap(stats, opts) {
    const { prevBest, isRecord, milestonesThisRun, nextMilestone } = opts;
    const $$ = (id) => document.getElementById(id);
    $$('btn-recap-board').hidden = !opts.canShowLeaderboard;
    const badge = $$('recap-badge');
    badge.hidden = !isRecord;

    $$('recap-depth').textContent = stats.depth.toLocaleString();

    const compare = $$('recap-compare');
    if (isRecord) {
      compare.textContent = prevBest > 0
        ? `previous best · ${prevBest.toLocaleString()} m`
        : 'your first mark on the deep';
    } else {
      const short = prevBest - stats.depth;
      compare.textContent = short <= 0
        ? `best · ${prevBest.toLocaleString()} m`
        : `${short.toLocaleString()} m short of your best · ${prevBest.toLocaleString()} m`;
    }

    // Bar: this run measured against the best (or the best marked inside a record run).
    const fill = $$('recap-bar-fill');
    const mark = $$('recap-bar-mark');
    fill.classList.toggle('record', !!isRecord);
    fill.style.width = '0%';
    if (isRecord && prevBest > 0) {
      mark.style.display = 'block';
      mark.style.left = `${Math.min(97, (prevBest / Math.max(stats.depth, 1)) * 100)}%`;
    } else {
      mark.style.display = 'none';
    }
    const pct = isRecord ? 100 : Math.min(100, (stats.depth / Math.max(prevBest, 1)) * 100);
    requestAnimationFrame(() => { fill.style.width = `${pct}%`; });

    $$('recap-stats').innerHTML = `
      <div class="stat-row"><span>Songs sung</span><span>${stats.pings}</span></div>
      <div class="stat-row"><span>Motes eaten</span><span>${stats.motes}</span></div>
      <div class="stat-row"><span>Milestones this run</span><span>${milestonesThisRun}</span></div>`;

    const next = $$('recap-next');
    if (nextMilestone) {
      const pctNext = Math.min(100, Math.round((stats.depth / nextMilestone) * 100));
      next.innerHTML = `Next milestone · <span class="accent">${nextMilestone.toLocaleString()} m</span> — ${pctNext}% there`;
    } else {
      next.textContent = 'Every milestone claimed. The deep has nothing left to name.';
    }
  }

  fillGameover(mode, stats) {
    this.el.gameoverSub.textContent = mode === 'abyss'
      ? `You reached ${stats.depth} m before the dark closed in.`
      : stats.lastHit === 'hunter'
        ? `Sing softer this time.`
        : `The thorns do not listen. Sing before you rush.`;
  }

  setVersion(v) { this.el.versionLine.textContent = `v${v}`; }

  // Title front door: one tap back into the water, plus the reason to go.
  setContinueChip(label, showDepthsLink) {
    document.getElementById('btn-play').textContent = label;
    document.getElementById('btn-depths').hidden = !showDepthsLink;
  }

  setMicroGoal(html) {
    const el = document.getElementById('micro-goal');
    if (!html) { el.hidden = true; return; }
    el.hidden = false;
    el.innerHTML = html;
  }

  setThreatVeil(v) {
    document.getElementById('threat-veil').style.opacity = v.toFixed(3);
  }
}

// DOM overlay: screens, HUD, toasts. Pure view layer — main.js wires events.

import {
  LEVELS, CHAPTERS, parTime, teaser, chapterOf, chapterGate, prevChapter,
  STARS_PER_LEVEL, gateKind, gateSpan, gateCapacity, GATE_EVERY,
} from './levels.js';
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
      gate: $('screen-gate'),
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
      gateDepth: $('gate-depth'),
      gateName: $('gate-name'),
      gateMark: $('gate-mark'),
      gateCarry: $('gate-carry'),
      gateBarFill: $('gate-bar-fill'),
      gateBuys: $('gate-buys'),
    };
    this._hintTimer = null;
    this._toastTimer = null;
    this._hintQueue = [];
    this._hintUntil = 0;
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

  // The gate. Says what you carry, what it buys, and offers the way back.
  // "Lean" is a warning about the dark, never a prompt to buy anything.
  fillGate(def, boon, fullLight = false) {
    const lean = boon.grade < 0.34;
    this.el.gateDepth.textContent = `Depth ${boon.id}`;
    this.el.gateName.textContent = def.name;
    this.el.gateCarry.textContent =
      `You carry ${boon.banked} light${boon.banked === 1 ? '' : 's'} of ${boon.capacity}.`;
    this.el.gateBarFill.style.width = `${Math.round(boon.grade * 100)}%`;
    this.el.gateMark.classList.toggle('lean', lean);
    // Every depth behind this gate banked to its full light: the mark burns whole.
    this.el.gateMark.classList.toggle('fulllight', fullLight);
    this.el.gateBarFill.classList.toggle('lean', lean);
    this.el.gateBuys.classList.toggle('lean', lean);
    return lean;
  }

  setGateBuys(line) { this.el.gateBuys.textContent = line; }

  // The two verbs, shown while the level waits for your first touch. Driven
  // per-frame from the shell off game.state, so it needs no timers and can
  // never linger into play.
  setControlsVisible(on) {
    if (this._controlsOn === on) return;
    this._controlsOn = on;
    const el = document.getElementById('hud-controls');
    if (!el) return;
    if (on) {
      el.hidden = false;
      requestAnimationFrame(() => el.classList.add('visible'));
    } else {
      el.classList.remove('visible');
      setTimeout(() => { if (!this._controlsOn) el.hidden = true; }, 850);
    }
  }

  // Carried light, made visible while you play. The gate used to promise
  // something the fight never showed: silent songs decremented with no readout,
  // a wider glow was indistinguishable from a normal one. Countable boons get
  // pips that go dark as they are spent; continuous ones just say they are on.
  showBoon(boon) {
    const el = document.getElementById('hud-boon');
    if (!el) return;
    if (!boon) { el.hidden = true; return; }
    const label = document.getElementById('hud-boon-label');
    const pips = document.getElementById('hud-boon-pips');
    let text = null, count = 0;
    // Labels name what you will SEE, not the mechanism: "Glow" told a
    // playtester nothing, "Afterglow" is the walls staying lit after you pass.
    if (boon.silentSongs > 0) { text = 'Silent'; count = boon.silentSongs; }
    else if (boon.orbitSecs > 0) { text = 'Orbits'; count = 0; }
    else if (boon.revealLures) { text = 'True sight'; count = 0; }
    else if (boon.iceSteady) { text = 'Steady'; count = 0; }
    else if (boon.hushRelief > 0.05) { text = 'Heard'; count = 0; }
    else if (boon.aura > 0.05) { text = 'Afterglow'; count = 0; }
    if (!text) { el.hidden = true; return; }
    label.textContent = text;
    pips.innerHTML = '';
    this._boonMax = count;
    for (let i = 0; i < count; i++) pips.appendChild(document.createElement('i'));
    el.classList.remove('empty');
    el.hidden = false;
  }

  // Called every time a silent song is spent: darken one pip and flash the chip
  // so the cost is felt rather than merely tracked.
  spendBoonPip(remaining) {
    const el = document.getElementById('hud-boon');
    const pips = document.getElementById('hud-boon-pips');
    if (!el || el.hidden || !pips) return;
    [...pips.children].forEach((p, i) => p.classList.toggle('spent', i >= remaining));
    el.classList.toggle('empty', remaining <= 0);
    el.classList.remove('spend');
    void el.offsetWidth;
    el.classList.add('spend');
  }

  hideBoon() {
    const el = document.getElementById('hud-boon');
    if (el) el.hidden = true;
  }

  // A boss should announce itself. Depth 14 used to declare a boss on the gate
  // screen and then hand the player an ordinary corridor.
  showBossCard(name, tell, ms = 4200) {
    const el = document.getElementById('boss-card');
    if (!el || !name) return;
    document.getElementById('boss-card-name').textContent = name;
    document.getElementById('boss-card-tell').textContent = tell || '';
    clearTimeout(this._bossTimer);
    el.hidden = false;
    el.classList.remove('visible');
    void el.offsetWidth;
    el.classList.add('visible');
    this._bossTimer = setTimeout(() => {
      el.classList.remove('visible');
      setTimeout(() => { el.hidden = true; }, 700);
    }, ms);
  }

  hideBossCard() {
    clearTimeout(this._bossTimer);
    const el = document.getElementById('boss-card');
    if (el) { el.classList.remove('visible'); el.hidden = true; }
  }

  // Motes lost their star, so this is where they report instead: what you just
  // banked, and how full the run into the next gate is. Nothing is spent here.
  fillLightBank(save, levelId) {
    const wrap = document.getElementById('light-bank');
    if (!wrap) return;
    // The gate this depth is feeding: the next multiple of seven at or past it.
    const gateId = Math.ceil((levelId + (gateKind(levelId) ? 1 : 0)) / GATE_EVERY) * GATE_EVERY;
    const target = LEVELS.some((l) => l.id === gateId) ? gateId : null;
    if (!target) { wrap.hidden = true; return; }
    const { from, to } = gateSpan(target);
    const banked = save.moteBank(from, to);
    const cap = gateCapacity(target);
    const pct = cap > 0 ? Math.min(1, banked / cap) : 0;
    document.getElementById('light-bank-count').textContent = `${banked} / ${cap}`;
    document.getElementById('light-bank-fill').style.width = `${Math.round(pct * 100)}%`;
    document.getElementById('light-bank-note').textContent =
      `Carried into depth ${target}. Your best run of each depth counts.`;
    wrap.hidden = false;
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

  // Objectives read as status, not as a sentence. Motes show what is here and
  // how much you have; songs show the budget you are spending against, so the
  // star you are chasing is legible without anyone writing it out in prose.
  setMoteGoal(need) { this._moteGoal = need > 0 ? need : 0; }
  setSongBudget(n) { this._songBudget = Number.isFinite(n) ? n : 0; }

  setMotes(got, total) {
    this.el.motes.textContent = total > 0 ? `${got}/${total}` : `${got}`;
    const wrap = this.el.motes.parentElement;
    wrap.classList.toggle('goal-met', total > 0 && got >= total);
    wrap.classList.remove('pop');
    void wrap.offsetWidth;
    wrap.classList.add('pop');
  }

  setPings(n) {
    const b = this._songBudget || 0;
    this.el.pings.textContent = b > 0 ? `${n}/${b}` : `${n}`;
    const wrap = this.el.pings.parentElement;
    wrap.classList.toggle('over', b > 0 && n > b);
  }

  setDepth(m) {
    this.el.depth.hidden = false;
    this.el.depth.textContent = `${m} m`;
  }
  hideDepth() { this.el.depth.hidden = true; }

  setLevelName(text) { this.el.levelName.textContent = text; }

  // Reading time, not a flat number. A hint that fires while another is still
  // being read waits its turn instead of overwriting it — several depths place
  // triggers half a second apart, which used to cut the first one to shreds for
  // anyone swimming faster than par.
  // ~18 chars/sec, which is unhurried for prose you are reading while swimming,
  // plus a beat to notice it arrived. Capped so a queue always drains inside the
  // level: at 95ms/char depth 1's four tutorial hints needed 45s against a 35s par.
  hintDuration(text, plain) {
    const n = text.length + (plain ? plain.length : 0);
    return Math.min(8000, Math.max(3000, 1200 + n * 55));
  }

  hint(text, ms, plain, glyph) {
    if (performance.now() < this._hintUntil) {
      if (!this._hintQueue.some((q) => q.text === text)) {
        // A teach is why you are alive right now; it goes to the front.
        const item = { text, plain, glyph };
        if (glyph) this._hintQueue.unshift(item); else this._hintQueue.push(item);
      }
      return;
    }
    this._showHint(text, ms || this.hintDuration(text, plain), plain, glyph);
  }

  // Two voices: the trench's line, then what it actually means. The poetry was
  // carrying the whole instruction and a playtester read right past it.
  _showHint(text, ms, plain, glyph) {
    const h = this.el.hint;
    clearTimeout(this._hintTimer);
    h.textContent = '';
    h.classList.toggle('teach', !!glyph);
    if (glyph) {
      const g = document.createElement('span');
      g.className = 'teach-glyph';
      g.innerHTML = glyph;
      h.appendChild(g);
    }
    const body = glyph ? document.createElement('span') : h;
    const lead = document.createElement('span');
    lead.className = 'hint-lead';
    lead.textContent = text;
    body.appendChild(lead);
    if (plain) {
      const sub = document.createElement('span');
      sub.className = 'hint-plain';
      sub.textContent = plain;
      body.appendChild(sub);
    }
    if (glyph) h.appendChild(body);
    h.hidden = false;
    h.classList.remove('visible');
    void h.offsetWidth;
    h.classList.add('visible');
    this._hintUntil = performance.now() + ms;
    this._hintTimer = setTimeout(() => {
      h.classList.remove('visible');
      setTimeout(() => {
        h.hidden = true;
        const next = this._hintQueue.shift();
        if (next) {
          this._showHint(next.text, this.hintDuration(next.text, next.plain), next.plain, next.glyph);
        }
      }, 400);
    }, ms);
  }

  // Leaving a level must not leak its hints into the next one.
  clearHints() {
    clearTimeout(this._hintTimer);
    this._hintQueue.length = 0;
    this._hintUntil = 0;
    this.el.hint.classList.remove('visible');
    this.el.hint.hidden = true;
  }

  // A teach: shown the first time you ever meet something, once, ever. A glyph
  // so the card points at a shape you can find on screen, and a line short
  // enough to read while moving. It goes through the same queue as every other
  // transient message, so it can never land on top of one.
  teach(glyphSvg, lead, plain) {
    this.hint(lead, undefined, plain, glyphSvg);
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
    for (const chapter of CHAPTERS) {
      const head = document.createElement('div');
      head.className = 'level-chapter';
      const gate = chapterGate(chapter);
      const prev = prevChapter(chapter);
      const open = save.isUnlocked(chapter.from);
      // A shut chapter says exactly what opens it — the gate is a goal, not a wall.
      const gateLine = (!open && gate !== null)
        ? `<span class="chapter-gate">${save.starsIn(prev.from, prev.to)} / ${gate} stars to open</span>`
        : '';
      head.innerHTML = `<span>${chapter.id} · ${chapter.name}</span>${gateLine}`;
      grid.appendChild(head);
      this._buildChapterCells(grid, save, chapter, onPick, (got, total) => {
        motesGathered += got; motesInGame += total;
      });
    }
    const total = save.totalStars();
    this.el.totalStars.textContent =
      `${total} / ${LEVELS.length * STARS_PER_LEVEL} stars · ${motesGathered} / ${motesInGame} light`;
  }

  _buildChapterCells(grid, save, chapter, onPick, tally) {
    for (const lvl of LEVELS) {
      if (lvl.id < chapter.from || lvl.id > chapter.to) continue;
      const unlocked = save.isUnlocked(lvl.id);
      const rec = save.data.levels[lvl.id];
      const total = UI.moteTotal(lvl);
      tally(rec ? Math.min(rec.bestMotes, total) : 0, total);
      const btn = document.createElement('button');
      // A depth banked to its full light wears gold, permanently.
      const fullLight = !!rec && total > 0 && rec.bestMotes >= total;
      btn.className = 'level-cell' + (unlocked ? '' : ' locked') + (fullLight ? ' fulllight' : '');
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
        <span class="level-stars">${'★'.repeat(stars)}${'☆'.repeat(Math.max(0, STARS_PER_LEVEL - stars))}</span>
        ${bestLine}${medalLine}`;
      if (unlocked) btn.addEventListener('click', () => onPick(lvl.id));
      grid.appendChild(btn);
    }
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
    this.el.resultsTitle.textContent = opts.finale
      ? 'The deep opens'
      : opts.chapterEnd ? `${opts.chapterEnd} · cleared` : 'Vent reached';
    const starEls = this.el.resultsStars.querySelectorAll('.star');
    // Light each star by its own criterion, staggered among the earned ones.
    const earned = opts.breakdown
      ? [opts.breakdown.vent, opts.breakdown.songs]
      : [true, stars >= 2];
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
      const labels = {
        1: 'reach the vent',
        2: `≤ ${opts.def.stars?.maxPings ?? '—'} songs`,
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
      // Crossing into a new chapter names the chapter, not just the depth.
      const nextChapter = chapterOf(nextDef.id);
      const label = nextDef.id === nextChapter.from
        ? `${nextChapter.name} · ${nextDef.name}`
        : nextDef.name;
      tease.innerHTML = `Next · <span class="accent">${label}</span> — ${nextLine}`;
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

  fillGameover(mode, stats, opts = {}) {
    const lines = {
      hunter: 'Sing softer this time.',
      lure: 'Not everything that glows is food. Sing at it first.',
      leviathan: 'It never saw you. It only heard you.',
      urchin: 'The thorns do not listen. Sing before you rush.',
    };
    this.el.gameoverSub.textContent = mode === 'abyss'
      ? `You reached ${stats.depth} m before the dark closed in.`
      : (lines[stats.lastHit] || lines.urchin);
    // A banked lair mouth turns Retry into "carry on from where it took you".
    const retry = document.getElementById('btn-retry');
    retry.textContent = opts.fromCheckpoint ? 'Back to the lair mouth' : 'Try again';
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

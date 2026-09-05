// Versioned persistence. localStorage is the source of truth (synchronous),
// mirrored to Capacitor Preferences when available so native storage survives
// webview data eviction.

import { SAVE_KEY } from './config.js';
import { chapterOf, chapterGate, prevChapter, getLevel, STARS_PER_LEVEL, moteCapacity } from './levels.js';

const SAVE_VERSION = 3;   // 2: motes stopped being a star; 3: the third star returns, for ALL motes

const DEFAULTS = {
  version: SAVE_VERSION,
  levels: {},          // id -> { stars, bestMotes, bestPings, bestTime }
  abyssBestDepth: 0,
  abyssUnlocked: false,
  tutorialSeen: false,
  abyssIntroSeen: false,
  abyssNudgeSeen: false,   // the one-time "sing to see again" nudge
  aboutSeen: false,
  achievements: [],    // milestone ids unlocked locally (source of truth)
  // Ads and the one purchase. `adsRemoved` is an entitlement, not progress:
  // reset() deliberately preserves it.
  adsRemoved: false,
  adWins: 0,           // level wins since the last interstitial
  adOfferTick: 0,      // interstitials that have reached the "remove ads?" offer
  adOfferDeclines: 0,  // times the offer was declined; enough of them silences it
  settings: {
    sound: true,
    music: true,
    haptics: true,
    reducedMotion: false,
    highContrast: false,
    visualThreat: false,
  },
};

export class Save {
  constructor() {
    this.data = structuredClone(DEFAULTS);
    this.capPrefs = window.Capacitor?.Plugins?.Preferences || null;
    this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = {
          ...structuredClone(DEFAULTS),
          ...parsed,
          settings: { ...DEFAULTS.settings, ...(parsed.settings || {}) },
          levels: parsed.levels || {},
        };
      }
    } catch (e) {
      console.warn('Save load failed; starting fresh.', e);
      this.data = structuredClone(DEFAULTS);
    }
    this._migrate();
    // Async restore from native storage if webview storage was wiped.
    if (this.capPrefs && !localStorage.getItem(SAVE_KEY)) {
      this.capPrefs.get({ key: SAVE_KEY }).then((res) => {
        if (res && res.value) {
          try {
            localStorage.setItem(SAVE_KEY, res.value);
            this.load();
          } catch (e) { /* ignore */ }
        }
      }).catch(() => {});
    }
  }

  persist() {
    try {
      const raw = JSON.stringify(this.data);
      localStorage.setItem(SAVE_KEY, raw);
      if (this.capPrefs) this.capPrefs.set({ key: SAVE_KEY, value: raw }).catch(() => {});
    } catch (e) {
      console.warn('Save persist failed.', e);
    }
  }

  // `stars` is the full count for display (0-3); `core` is vent + songs only
  // (0-2), and it is what chapter gates read. Kept apart because a count of 2
  // cannot say whether the second star was songs or motes.
  levelResult(id, stars, stats, core = Math.min(2, stars)) {
    const prev = this.data.levels[id] || { stars: 0, core: 0, bestMotes: 0, bestPings: Infinity, bestTime: Infinity };
    this.data.levels[id] = {
      stars: Math.max(prev.stars, stars),
      core: Math.max(prev.core || 0, core),
      bestMotes: Math.max(prev.bestMotes, stats.motes),
      bestPings: Math.min(prev.bestPings ?? Infinity, stats.pings),
      bestTime: Math.min(prev.bestTime ?? Infinity, stats.time),
    };
    this.persist();
  }

  // A failed run still proves you gathered something. Records the haul so a
  // retry never feels like erasure. Time and stars stay win-only — a death
  // isn't a fast clear.
  levelAttempt(id, stats) {
    const prev = this.data.levels[id];
    if (!prev) {
      this.data.levels[id] = {
        stars: 0, core: 0, bestMotes: stats.motes, bestPings: Infinity, bestTime: Infinity,
      };
    } else if (stats.motes > prev.bestMotes) {
      prev.bestMotes = stats.motes;
    } else {
      return;
    }
    this.persist();
  }

  // v1 -> v2: motes stopped earning a star, so three became two.
  //
  // Recomputed from what the save already holds rather than clamped: clamping
  // would hand two stars to a player who only ever earned the vent, and take
  // one from nobody. bestPings is the song star's own record, so the answer is
  // already on disk — this reads it back rather than guessing.
  _migrate() {
    const from = this.data.version || 1;
    if (from >= SAVE_VERSION) return;
    for (const [id, rec] of Object.entries(this.data.levels || {})) {
      if (!rec || typeof rec.stars !== 'number') continue;
      if (rec.stars === 0) continue;              // never cleared; nothing to move
      const def = getLevel(Number(id));
      if (from < 2) {
        // v1 → v2: motes stopped being a star; recompute vent + songs.
        const maxPings = def?.stars?.maxPings ?? Infinity;
        const song = Number.isFinite(rec.bestPings) && rec.bestPings <= maxPings;
        rec.stars = Math.min(2, 1 + (song ? 1 : 0));
      }
      // Everything up to here is vent + songs, which is exactly what `core` is.
      rec.core = Math.min(2, rec.stars);
      // v2 → v3: the mote star is back, for every mote. A depth already banked
      // to its full light earned it; nobody replays a clear they already did.
      if (def && rec.bestMotes >= moteCapacity(def)) rec.stars = Math.min(STARS_PER_LEVEL, rec.stars + 1);
    }
    this.data.version = SAVE_VERSION;
    this.persist();
  }

  // The depth the Continue chip should send you to: first unlocked level
  // without a star, otherwise the furthest unlocked one.
  // Skips locked depths rather than stopping at them: a chapter can open on
  // stars while an earlier depth is still unbeaten, and Continue should point
  // at the new water rather than the wall.
  nextDepth(levelCount) {
    let furthest = 1;
    for (let id = 1; id <= levelCount; id++) {
      if (!this.isUnlocked(id)) continue;
      furthest = id;
      const rec = this.data.levels[id];
      if (!rec || rec.stars === 0) return id;
    }
    return furthest;
  }

  hasProgress() {
    return Object.keys(this.data.levels).length > 0;
  }

  abyssResult(depth) {
    if (depth > this.data.abyssBestDepth) {
      this.data.abyssBestDepth = depth;
      this.persist();
    }
  }

  unlockAbyss() {
    if (!this.data.abyssUnlocked) {
      this.data.abyssUnlocked = true;
      this.persist();
    }
  }

  isUnlocked(levelId) {
    if (levelId === 1) return true;
    const chapter = chapterOf(levelId);
    if (levelId === chapter.from) {
      // A chapter opens on stars banked in the one before it, never on
      // clearing every one of its depths.
      const gate = chapterGate(chapter);
      if (gate === null) return true;
      const prev = prevChapter(chapter);
      return this.starsIn(prev.from, prev.to) >= gate;
    }
    const prev = this.data.levels[levelId - 1];
    return !!(prev && prev.stars > 0);
  }

  // Light banked for a gate: the sum of your BEST haul on each depth behind it.
  // Never consumed, never lost. Replaying a depth you rushed raises it; failing
  // a gate costs nothing but the attempt. bestMotes is already recorded on
  // deaths as well as wins, so an existing save carries a real bank on day one.
  moteBank(from, to) {
    let n = 0;
    for (let id = from; id <= to; id++) n += this.data.levels[id]?.bestMotes || 0;
    return n;
  }

  // Core stars (vent + songs) in a range: what opens the next chapter. The
  // mote star is deliberately not in here; see GATE_STARS_PER_LEVEL.
  starsIn(from, to) {
    let sum = 0;
    for (let id = from; id <= to; id++) {
      const rec = this.data.levels[id];
      if (rec) sum += rec.core ?? Math.min(2, rec.stars || 0);
    }
    return sum;
  }

  totalStars() {
    return Object.values(this.data.levels).reduce((sum, l) => sum + (l.stars || 0), 0);
  }

  // Erases progress, NEVER entitlements. Someone who paid to remove ads still
  // paid; wiping that here would charge them again for restarting the game.
  // (The store is the real source of truth and a restore would bring it back,
  // but a player should never have to discover that.)
  reset() {
    const paid = !!this.data.adsRemoved;
    this.data = structuredClone(DEFAULTS);
    this.data.adsRemoved = paid;
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    if (this.capPrefs) this.capPrefs.remove({ key: SAVE_KEY }).catch(() => {});
    this.persist();
  }
}

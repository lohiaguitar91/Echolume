// Versioned persistence. localStorage is the source of truth (synchronous),
// mirrored to Capacitor Preferences when available so native storage survives
// webview data eviction.

import { SAVE_KEY } from './config.js';

const DEFAULTS = {
  version: 1,
  levels: {},          // id -> { stars, bestMotes, bestPings, bestTime }
  abyssBestDepth: 0,
  abyssUnlocked: false,
  tutorialSeen: false,
  settings: {
    sound: true,
    music: true,
    haptics: true,
    reducedMotion: false,
    highContrast: false,
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

  levelResult(id, stars, stats) {
    const prev = this.data.levels[id] || { stars: 0, bestMotes: 0, bestPings: Infinity, bestTime: Infinity };
    this.data.levels[id] = {
      stars: Math.max(prev.stars, stars),
      bestMotes: Math.max(prev.bestMotes, stats.motes),
      bestPings: Math.min(prev.bestPings ?? Infinity, stats.pings),
      bestTime: Math.min(prev.bestTime ?? Infinity, stats.time),
    };
    this.persist();
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
    const prev = this.data.levels[levelId - 1];
    return !!(prev && prev.stars > 0);
  }

  totalStars() {
    return Object.values(this.data.levels).reduce((sum, l) => sum + (l.stars || 0), 0);
  }

  reset() {
    this.data = structuredClone(DEFAULTS);
    try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* ignore */ }
    if (this.capPrefs) this.capPrefs.remove({ key: SAVE_KEY }).catch(() => {});
    this.persist();
  }
}

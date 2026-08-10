// Platform play services: Game Center (iOS) / Google Play Games (Android)
// through the capacitor-game-connect plugin when it's present, degrading to
// local-only milestone tracking on plain web or if the plugin is missing.
// The local save is always the source of truth for what's been earned.

// Abyss depth milestones (meters): 1k-5k by 1000, then 10k, then 20k-100k by 10000.
export const MILESTONES = [
  1000, 2000, 3000, 4000, 5000,
  10000, 20000, 30000, 40000, 50000,
  60000, 70000, 80000, 90000, 100000,
];

// Game Center uses these string ids verbatim (set them when creating the
// achievements in App Store Connect). Play Console generates opaque ids —
// after console setup, fill PLAY_IDS with { 'abyss_1000': 'CgkI…', … } and
// PLAY_LEADERBOARD_ID. Until then, native unlock calls fall back to the
// string id (harmless no-op server-side if unknown).
export const LEADERBOARD_ID = 'abyss_depth';
const PLAY_IDS = {};
const PLAY_LEADERBOARD_ID = null;

export class GameServices {
  constructor(save) {
    this.save = save;
    this.plugin = window.Capacitor?.Plugins?.GameConnect || null;
    this.signedIn = false;
    this._signingIn = false;
    this.isAndroid = window.Capacitor?.getPlatform?.() === 'android';
  }

  get available() { return !!this.plugin; }

  idFor(meters) { return `abyss_${meters}`; }

  _platformAchievementId(meters) {
    const id = this.idFor(meters);
    return (this.isAndroid && PLAY_IDS[id]) || id;
  }

  _platformLeaderboardId() {
    return (this.isAndroid && PLAY_LEADERBOARD_ID) || LEADERBOARD_ID;
  }

  async signIn() {
    if (!this.plugin || this.signedIn || this._signingIn) return;
    this._signingIn = true;
    try {
      const res = await this.plugin.signIn();
      // Native resolves { authenticated }; treat a missing flag as success so a
      // future plugin revision that resolves bare doesn't lock us out.
      this.signedIn = !res || res.authenticated !== false;
      if (this.signedIn) this._flushPending();
    } catch (e) {
      this.signedIn = false;      // declined or unavailable — stay local
    } finally {
      this._signingIn = false;
    }
  }

  // Anything earned before sign-in completes is replayed once it does.
  _flushPending() {
    for (const id of this.save.data.achievements) {
      const meters = parseInt(id.split('_')[1], 10);
      if (!Number.isNaN(meters)) {
        this.plugin.unlockAchievement({ achievementID: this._platformAchievementId(meters) })
          .catch(() => {});
      }
    }
    if (this.save.data.abyssBestDepth > 0) this.submitDepth(this.save.data.abyssBestDepth);
  }

  canShowLeaderboard() { return !!this.plugin && this.signedIn; }

  async showLeaderboard() {
    if (!this.plugin) return false;
    if (!this.signedIn) await this.signIn();
    if (!this.signedIn) return false;
    try {
      await this.plugin.showLeaderboard({ leaderboardID: this._platformLeaderboardId() });
      return true;
    } catch (e) {
      return false;
    }
  }

  // Returns true if this milestone was newly earned (caller shows the moment).
  unlock(meters) {
    const id = this.idFor(meters);
    if (this.save.data.achievements.includes(id)) return false;
    this.save.data.achievements.push(id);
    this.save.persist();
    if (this.plugin && this.signedIn) {
      this.plugin.unlockAchievement({ achievementID: this._platformAchievementId(meters) })
        .catch(() => {});
    }
    return true;
  }

  submitDepth(meters) {
    if (meters <= 0) return;
    if (this.plugin && this.signedIn) {
      this.plugin.submitScore({
        leaderboardID: this._platformLeaderboardId(),
        totalScoreAmount: meters,
      }).catch(() => {});
    }
  }

  unlockedCount() { return this.save.data.achievements.length; }
  totalCount() { return MILESTONES.length; }
}

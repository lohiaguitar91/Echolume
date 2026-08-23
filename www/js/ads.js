// Ad and purchase surface. Dormant until the IDs below are filled in AND the
// @capacitor-community/admob plugin is installed; then every call here is real.
//
// The plugin is reached through window.Capacitor.Plugins.AdMob — the same way
// gameservices.js reaches GameConnect — because www/ has no bundler to resolve
// a package import. Method and event names are per the plugin's v8 README:
// initialize / trackingAuthorizationStatus / requestTrackingAuthorization,
// prepareInterstitial / showInterstitial, prepareRewardVideoAd /
// showRewardVideoAd, and the event strings in EV below.
//
// TO ENABLE (macOS):
//   1. npm i @capacitor-community/admob     (v8 targets Capacitor 8)
//   2. Fill AD_IDS below, per platform: the app id plus the interstitial and
//      rewarded unit ids. Add the matching GADApplicationIdentifier (Info.plist)
//      and com.google.android.gms.ads.APPLICATION_ID (AndroidManifest.xml) at
//      the same moment — the exact snippets are in comments at the point of use.
//   3. Create the `remove_ads` non-consumable in both consoles, set
//      IAP_PRODUCT_ID, and wire purchaseRemoveAds() to your purchase plugin.
//   4. npx cap sync. Then: die at depth 14 and confirm "Watch ad to try again"
//      appears, plays, and resumes you where you died with your hearts back.

// ---------------------------------------------------------------------------
// FILL THESE IN. While any is null the whole surface stays dormant.
// ---------------------------------------------------------------------------
export const AD_IDS = {
  ios:     { interstitial: null, rewarded: null, appId: null },
  android: { interstitial: null, rewarded: null, appId: null },
};
export const IAP_PRODUCT_ID = null;   // e.g. 'com.wibesllc.echolume.remove_ads'
// ---------------------------------------------------------------------------

// Placement rules, decided before any money was involved and not up for
// renegotiation by whatever the network would prefer:
//   - Interstitials run after a GATE WIN only, never after a death, never after
//     a failed gate, never on the gate warning screen, never on first launch.
//   - The rewarded revive is offered at bosses, once per attempt, as a BUTTON
//     the player taps ("Watch ad to try again"); it is never auto-played, and
//     it resumes the run where it ended rather than from the door.
//   - Buying `remove_ads` removes interstitials permanently. The rewarded
//     revive stays available, because it is a choice the player makes, not an
//     interruption.
export const AD_RULES = {
  interstitialOnGateWinOnly: true,
  neverAfterDeath: true,
  rewardedReviveAtBossesOnly: true,
};

// Plugin event names (exact strings from the plugin's README).
const EV = {
  intDismissed: 'interstitialAdDismissed',
  intFailedShow: 'interstitialAdFailedToShow',
  rwReward: 'onRewardedVideoAdReward',
  rwDismissed: 'onRewardedVideoAdDismissed',
  rwFailedShow: 'onRewardedVideoAdFailedToShow',
};

export class Ads {
  constructor(save) {
    this.save = save;
    this.ready = false;        // initialized against a real plugin
    this._intReady = false;    // an interstitial is loaded and waiting
    this._rwReady = false;     // a rewarded ad is loaded and waiting
    this._npa = true;          // non-personalised until tracking is authorised
    this._busy = false;        // an ad is on screen right now
  }

  get platform() { return window.Capacitor?.getPlatform?.() || 'web'; }
  get ids() { return this.platform === 'android' ? AD_IDS.android : AD_IDS.ios; }
  get plugin() { return window.Capacitor?.Plugins?.AdMob || null; }

  get configured() {
    const p = this.ids;
    return !!(p && p.interstitial && p.appId && this.plugin);
  }

  get removed() {
    return !!this.save?.data?.adsRemoved;
  }

  // Initialize the SDK, ask for tracking once (iOS), and preload both ads.
  // Dormant on purpose while unconfigured: returns false and touches nothing.
  async init() {
    if (!this.configured) return false;
    try {
      const A = this.plugin;
      await A.initialize({});
      if (this.platform === 'ios') {
        // ATT: ask once, before any tracking request. Declining simply means
        // non-personalised ads — nothing else in the game changes.
        let st = await A.trackingAuthorizationStatus().catch(() => null);
        if (st && st.status === 'notDetermined') {
          await A.requestTrackingAuthorization().catch(() => {});
          st = await A.trackingAuthorizationStatus().catch(() => null);
        }
        this._npa = !(st && st.status === 'authorized');
      } else {
        this._npa = false;
      }
      this.ready = true;
      this._preloadInterstitial();
      this._preloadRewarded();
      return true;
    } catch (e) {
      console.warn('Ads init failed; staying dormant.', e);
      this.ready = false;
      return false;
    }
  }

  async _preloadInterstitial() {
    if (!this.ready || this.removed || !this.ids.interstitial) return;
    this._intReady = false;
    try {
      await this.plugin.prepareInterstitial({ adId: this.ids.interstitial, npa: this._npa });
      this._intReady = true;
    } catch (e) { this._intReady = false; }
  }

  async _preloadRewarded() {
    if (!this.ready || !this.ids.rewarded) return;
    this._rwReady = false;
    try {
      await this.plugin.prepareRewardVideoAd({ adId: this.ids.rewarded, npa: this._npa });
      this._rwReady = true;
    } catch (e) { this._rwReady = false; }
  }

  // Listen for the first of several plugin events, then detach. addListener
  // registers synchronously and resolves to a handle (Capacitor 3+).
  _once(names) {
    const A = this.plugin;
    const handles = [];
    const fired = new Promise((resolve) => {
      for (const n of names) handles.push(A.addListener(n, () => resolve(n)));
    });
    return fired.then((name) => {
      for (const h of handles) Promise.resolve(h).then((x) => x && x.remove && x.remove()).catch(() => {});
      return name;
    });
  }

  // Called on a level win. Returns whether an ad was actually shown, so callers
  // can keep their own flow honest rather than assuming.
  async maybeInterstitial({ won, isGate }) {
    if (!won || !isGate) return false;    // the rule, enforced here not at call sites
    if (this.removed || !this.ready || !this._intReady || this._busy) return false;
    this._busy = true;
    try {
      const done = this._once([EV.intDismissed, EV.intFailedShow]);
      await this.plugin.showInterstitial();
      await done;
      return true;
    } catch (e) {
      return false;
    } finally {
      this._busy = false;
      this._intReady = false;
      this._preloadInterstitial();
    }
  }

  // Is a revive genuinely on offer right now? Synchronous so the death screen
  // can decide whether to show the button at all — no dead buttons.
  canRevive({ isBoss }) {
    return !!isBoss && this.ready && this._rwReady && !this._busy;
  }

  // Play the rewarded ad. Resolves true only if the player earned the reward
  // (watched it through); closing early or a failed show resolves false.
  async showRevive({ isBoss }) {
    if (!this.canRevive({ isBoss })) return false;
    this._busy = true;
    let rewarded = false;
    let rewardHandle = null;
    try {
      const A = this.plugin;
      rewardHandle = A.addListener(EV.rwReward, () => { rewarded = true; });
      const done = this._once([EV.rwDismissed, EV.rwFailedShow]);
      await A.showRewardVideoAd();
      await done;
      return rewarded;
    } catch (e) {
      return false;
    } finally {
      Promise.resolve(rewardHandle).then((h) => h && h.remove && h.remove()).catch(() => {});
      this._busy = false;
      this._rwReady = false;
      this._preloadRewarded();
    }
  }

  // Older name, same offer.
  async offerRevive(o) { return this.showRevive(o); }

  async purchaseRemoveAds() {
    if (!IAP_PRODUCT_ID) return false;
    return false;   // wire to the purchase plugin when the product exists
  }
}

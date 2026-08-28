// Ad and purchase surface, driving @capacitor-community/admob through the
// Capacitor plugin bridge (window.Capacitor.Plugins.AdMob — this project has
// no bundler, so the npm package's JS wrapper is never imported; the native
// plugin registers itself on the global and we call it directly).
//
// This file is the merge of two verified halves (Aug 2026): the Windows
// session's shell contract — a synchronous canRevive() decides whether the
// death screen shows the revive button, showRevive() resolves true only on a
// completed reward, and the shell owns once-per-attempt and the snapshot
// restart (that revive surface has since been RETIRED — see the placement
// rules below — but its internals stay, dormant) — and the Mac session's
// device-proven SDK internals, learned the hard way on a real iPhone:
//   - Nothing native runs at boot. Consent (UMP, defensive until a message is
//     published) + the ATT prompt + SDK init + the first loads all happen
//     lazily on the first gate/boss depth, so the cold open stays a cold open.
//   - prepare* resolves only when an ad is actually LOADED (verified against
//     the plugin source), so the loaded flags below are truthful.
//   - The plugin's show* promises are fire-and-observe, never the sequencer:
//     the native side settles them at inconsistent moments per ad type
//     (interstitial: on present; rewarded: only when the reward is EARNED)
//     and on some failure paths never settles them at all — awaiting one
//     wedged the revive button on device with no visible effect. The plugin
//     EVENTS are the truth; a 15s watchdog covers an ad that never presents,
//     and a failed offer says so out loud.
//
// On plain web, or if the plugin is missing, every call is a no-op that
// resolves false — the game never knows the difference.

// ---------------------------------------------------------------------------
// AD IDS.
//
// iOS ids are REAL (AdMob app "Echolume", Aug 20 2026) — the same app id also
// lives in ios/App/App/Info.plist as GADApplicationIdentifier; change them
// together or the SDK throws at launch. Android still carries Google's sample
// ids (they serve "Test Ad" creatives regardless of any flag) until the Play
// side of the console work happens — swap them plus AndroidManifest.xml then.
// ---------------------------------------------------------------------------
export const AD_IDS = {
  ios: {
    appId:        'ca-app-pub-8548952723271768~2532274468',
    interstitial: 'ca-app-pub-8548952723271768/2668005832',
    rewarded:     'ca-app-pub-8548952723271768/1354924167',
  },
  android: {
    appId:        'ca-app-pub-3940256099942544~3347511713',   // sample — see above
    interstitial: 'ca-app-pub-3940256099942544/1033173712',   // sample
    rewarded:     'ca-app-pub-3940256099942544/5224354917',   // sample
  },
};
export const ADS_ARE_SAMPLE = false;  // iOS ids above are real units
// ⚠ TEST-ADS MODE — true through every BETA round, false for the STORE build
// (SHIP.md 3.6). Passes isTesting to the plugin, which swaps in Google's
// sample ad UNITS at request time: guaranteed fill, "Test Ad" label, zero
// invalid-traffic risk. Beta testers are ~100% of a brand-new account's
// traffic, which is exactly the ratio Google's invalid-traffic systems
// dislike — so betas serve test creatives, and the live units get their
// pre-launch proof from an impressions-only smoke run instead (never tap).
export const FORCE_TEST_ADS = true;
// ⚠ DEBUG RIG — must be false in any distributed build (SHIP.md 3.6). Paints
// an on-screen breadcrumb log of the ad flow, because a USB console attach
// dies whenever iOS relaunches the app and we were debugging blind.
export const AD_DEBUG = false;
export const TEST_DEVICE_IDS = [
  // Disha's iPhone 14 Pro Max "Disha (2)" — identifierForVendor, captured from
  // the UMP debug log Aug 20 2026. Registered devices get test creatives on
  // live requests once real units serve to them.
  '4DCB9E8E-D14A-4A0D-B275-3F1974FC81B5',
];
export const IAP_PRODUCT_ID = null;   // e.g. 'com.wibesllc.echolume.remove_ads'
// ---------------------------------------------------------------------------

// Placement rules (revised Aug 26 2026 playtest), decided by design and not
// up for renegotiation by whatever the network would prefer:
//   - Interstitials run after a LEVEL WIN, every 2–3 wins (the counter
//     persists in the save; the 2-vs-3 rerolls after each ad). Never after a
//     death, never after a failed gate, never on the gate warning screen.
//   - No rewarded revive. Any unlocked depth can be restarted for free at any
//     time, so an ad-to-revive bought nothing and read as noise. The rewarded
//     plumbing below stays dormant (device-proven, a future placement may
//     want it) but nothing preps or offers it.
//   - Buying `remove_ads` removes interstitials permanently — with an ad
//     every few depths, that purchase is the whole pitch.
export const AD_RULES = {
  interstitialEveryNWins: [2, 3],
  neverAfterDeath: true,
  noRewardedRevive: true,
};

export class Ads {
  constructor(save, ui) {
    this.save = save;
    this.ui = ui;                // only for honest failure toasts
    this.plugin = window.Capacitor?.Plugins?.AdMob || null;
    this.platform = window.Capacitor?.getPlatform?.() === 'android' ? 'android' : 'ios';
    this.ready = false;          // SDK initialized (consent gathered, listeners on)
    this._starting = null;       // in-flight _ensureStarted, so it runs once
    this._interstitialLoaded = false;
    this._rewardLoaded = false;
    this._showing = false;       // a fullscreen ad is up right now
    this._earned = false;
    this._showed = false;
    this._closed = null;         // resolver for "the fullscreen ad went away"
    this._npa = false;           // non-personalized, decided by the ATT answer
    this._bug(`boot plugin=${this.plugin ? 'yes' : 'no'} ids=${this.configured ? 'set' : 'missing'} testads=${FORCE_TEST_ADS}`);
  }

  get ids() { return AD_IDS[this.platform]; }
  get configured() { return !!(this.plugin && this.ids && this.ids.appId && this.ids.interstitial); }
  get removed() { return !!this.save?.data?.adsRemoved; }

  // On-screen breadcrumbs (AD_DEBUG only): the phone tells us what happened
  // without a cable. Also exported as window.__adbug for shell-side taps.
  _bug(msg) {
    if (!AD_DEBUG) return;
    try {
      if (!this._bugEl) {
        const el = document.createElement('div');
        el.id = 'ad-debug';
        el.style.cssText = 'position:fixed;top:70px;left:8px;z-index:9999;font:10px/1.5 ui-monospace,monospace;'
          + 'color:#7ef0ff;background:rgba(3,7,17,0.72);border:1px solid rgba(126,240,255,0.4);'
          + 'padding:4px 6px;border-radius:4px;'
          + 'pointer-events:none;white-space:pre;max-width:74vw;overflow:hidden';
        document.body.appendChild(el);
        this._bugEl = el;
        this._bugLines = [];
        window.__adbug = (m) => this._bug(m);
      }
      const t = (performance.now() / 1000).toFixed(1);
      this._bugLines.push(`${t} ${msg}`);
      if (this._bugLines.length > 14) this._bugLines.shift();
      this._bugEl.textContent = this._bugLines.join('\n');
      console.log('[adbug] ' + msg);
    } catch (e) { /* the rig must never break the flow it watches */ }
  }

  // Called once at boot. Deliberately does nothing native — see header.
  async init() { return this.configured; }

  // How many wins the next interstitial costs: 2 or 3, rerolled per cycle.
  _rollCadence() { const [a, b] = AD_RULES.interstitialEveryNWins; return a + Math.floor(Math.random() * (b - a + 1)); }

  // Called by the shell on every real level entry. This is where the
  // interstitial preloads — only once the cadence says this depth's win could
  // actually show one, so the first SDK start (consent + ATT) comes with the
  // first depth that matters and not one screen later.
  levelStarted() {
    if (!this.configured || this.removed) return;
    if (this._adEvery == null) this._adEvery = this._rollCadence();
    if ((this.save.data.adWins || 0) + 1 >= this._adEvery) this._prepInterstitial();
  }

  // Consent, SDK init, listeners. Runs once, the first time an ad could matter.
  _ensureStarted() {
    if (this._starting) return this._starting;
    this._starting = (async () => {
      // Google's UMP consent (GDPR). Until a consent message is published in
      // the AdMob console this resolves NOT_REQUIRED or rejects; both fine.
      try {
        const info = await this.plugin.requestConsentInfo();
        if (info?.isConsentFormAvailable && info?.status === 'REQUIRED') {
          await this.plugin.showConsentForm();
        }
      } catch (e) { /* no message published, or unreachable — carry on */ }
      // Apple's ATT prompt, once ever. Denied is a fine answer: ads simply go
      // non-personalized (npa rides every request from here on). The usage
      // string lives in Info.plist.
      try {
        let { status } = await this.plugin.trackingAuthorizationStatus();
        this._bug(`att=${status}`);
        if (status === 'notDetermined') {
          await this.plugin.requestTrackingAuthorization();
          status = (await this.plugin.trackingAuthorizationStatus())?.status;
        }
        this._npa = status !== 'authorized';
      } catch (e) { /* pre-iOS-14 or plugin oddity — carry on */ }
      try {
        await this.plugin.initialize({
          initializeForTesting: ADS_ARE_SAMPLE || FORCE_TEST_ADS || TEST_DEVICE_IDS.length > 0,
          testingDevices: TEST_DEVICE_IDS,
        });
        this._bug('sdk init ok');
      } catch (e) {
        this._bug(`sdk init FAIL: ${e?.message || e}`);
        return false;             // SDK refused — stay silent for this session
      }
      this._listen();
      this.ready = true;
      return true;
    })();
    return this._starting;
  }

  _listen() {
    const on = (ev, fn) => { try { this.plugin.addListener(ev, fn); } catch (e) {} };
    // Event names verified against the plugin's native source, not its README.
    // FailedToLoad carries Google's real error text; the prepare* promise only
    // ever rejects with the plugin's generic "Loading failed".
    on('interstitialAdFailedToLoad',   (d) => { this._bug(`inter err: ${d?.message || '?'}`); });
    on('onRewardedVideoAdFailedToLoad',  (d) => { this._bug(`reward err: ${d?.message || '?'}`); });
    on('interstitialAdDismissed',      () => { this._bug('ev i.dismiss'); this._interstitialLoaded = false; this._closed?.('dismissed'); });
    on('interstitialAdFailedToShow',   () => { this._bug('ev i.failshow'); this._interstitialLoaded = false; this._closed?.('failed'); });
    on('onRewardedVideoAdReward',        () => { this._bug('ev r.reward'); this._earned = true; });
    on('onRewardedVideoAdShowed',        () => { this._bug('ev r.showed'); this._showed = true; });
    on('onRewardedVideoAdDismissed',     () => { this._bug('ev r.dismiss'); this._rewardLoaded = false; this._closed?.('dismissed'); });
    on('onRewardedVideoAdFailedToShow',  () => { this._bug('ev r.failshow'); this._rewardLoaded = false; this._closed?.('failed'); });
  }

  async _prepInterstitial() {
    if (this._interstitialLoaded || this._prepI) return;
    this._prepI = true;
    try {
      if (!(await this._ensureStarted())) return;
      await this.plugin.prepareInterstitial({
        adId: this.ids.interstitial,
        isTesting: ADS_ARE_SAMPLE || FORCE_TEST_ADS,
        npa: this._npa,
      });
      this._interstitialLoaded = true;
      this._bug('inter loaded');
    } catch (e) { this._bug(`inter load FAIL: ${e?.message || e}`); }
    finally { this._prepI = false; }
  }

  async _prepReward() {
    if (this._rewardLoaded || this._prepR) return;
    this._prepR = true;
    try {
      if (!(await this._ensureStarted())) return;
      await this.plugin.prepareRewardVideoAd({
        adId: this.ids.rewarded,
        isTesting: ADS_ARE_SAMPLE || FORCE_TEST_ADS,
        npa: this._npa,
      });
      this._rewardLoaded = true;
      this._bug('reward loaded');
    } catch (e) { this._bug(`reward load FAIL: ${e?.message || e}`); }
    finally { this._prepR = false; }
  }

  // A promise that settles ('dismissed' | 'failed') when the current
  // fullscreen ad goes away. Self-clearing so a stale resolver can't leak.
  _untilClosed() {
    return new Promise((res) => {
      this._closed = (why) => { this._closed = null; res(why); };
    });
  }

  // Called on every level win. Counts the win, and shows an interstitial once
  // the cadence is due AND one is actually loaded — if the network was slow,
  // the debt carries to the next win instead of being forgiven. Returns
  // whether an ad was actually shown, so callers stay honest.
  async maybeInterstitial({ won }) {
    if (!won) return false;               // never after a death — enforced here
    if (this.removed || !this.configured) return false;
    if (this._adEvery == null) this._adEvery = this._rollCadence();
    this.save.data.adWins = (this.save.data.adWins || 0) + 1;
    this.save.persist();
    if (this.save.data.adWins < this._adEvery) return false;
    if (!this.ready || !this._interstitialLoaded || this._showing) return false;
    this._showing = true;
    try {
      const closed = this._untilClosed();
      this._interstitialLoaded = false;    // consumed either way
      this.save.data.adWins = 0;
      this.save.persist();
      this._adEvery = this._rollCadence();
      this._bug('inter show →');
      this.plugin.showInterstitial().catch((e) => { this._bug(`inter show REJECT: ${e?.message || e}`); this._closed?.('failed'); });
      return (await closed) === 'dismissed';
    } finally { this._showing = false; }
  }

  // ---- DORMANT: the rewarded revive was retired in the Aug 26 2026 playtest
  // (see AD_RULES). Nothing preps or calls these; they stay because the show/
  // reward event handling was hard-won on device and a future rewarded
  // placement will want it verbatim. ----
  canRevive({ isBoss }) {
    return !!isBoss && this.ready && this._rewardLoaded && !this._showing;
  }

  // Plays the rewarded ad. Resolves true only when the network confirms the
  // reward; false for early close, no-show, or any failure — and a failure
  // says so, because a button that does nothing reads as broken.
  async showRevive({ isBoss }) {
    if (!this.canRevive({ isBoss })) return false;
    this._showing = true;
    try {
      this._earned = false;
      this._showed = false;
      const closed = this._untilClosed();
      this._rewardLoaded = false;          // consumed either way
      this._bug('reward show →');
      this.plugin.showRewardVideoAd().catch((e) => { this._bug(`reward show REJECT: ${e?.message || e}`); this._closed?.('failed'); });
      // Watchdog: if the ad hasn't even PRESENTED in 15s, call it failed —
      // but once it's on screen, wait as long as the player does.
      const dog = setTimeout(() => { if (!this._showed) { this._bug('watchdog: never presented'); this._closed?.('failed'); } }, 15000);
      const how = await closed;            // reward event lands before dismissal
      clearTimeout(dog);
      this._bug(`closed=${how} earned=${this._earned}`);
      if (how === 'failed' && !this._earned) this.ui?.toast?.('The ad never surfaced');
      return this._earned;
    } finally { this._showing = false; }
  }

  async purchaseRemoveAds() {
    if (!IAP_PRODUCT_ID) return false;    // needs a purchase plugin + store product
    return false;
  }
}

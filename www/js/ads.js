// Ad and purchase surface. Inert until the IDs below are filled in.
//
// Nothing here is wired to a network yet: there is no AdMob account and no
// store product, so every call is a no-op that resolves. The point of shipping
// it dormant is that the *placement rules* get built and tested now, and
// turning ads on later is a matter of pasting IDs rather than re-threading the
// game's flow. Same pattern as game_services_project_id on the Android side.
//
// TO ENABLE, once the accounts exist:
//   1. npm i @capacitor-community/admob     (8.1.0 supports Capacitor 8)
//   2. Fill AD_IDS below with the real unit ids, per platform.
//   3. Create the `remove_ads` non-consumable in App Store Connect and Play
//      Console, then fill IAP_PRODUCT_ID.
//   4. Ads change your data disclosure: update PrivacyInfo.xcprivacy, the
//      store data-safety forms, and add the iOS ATT prompt before shipping.
//   5. npx cap sync

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
//   - The rewarded revive is offered at bosses, once per attempt, and is never
//     auto-played.
//   - Buying `remove_ads` removes interstitials permanently. The rewarded
//     revive stays available, because it is a choice the player makes, not an
//     interruption.
export const AD_RULES = {
  interstitialOnGateWinOnly: true,
  neverAfterDeath: true,
  rewardedReviveAtBossesOnly: true,
};

export class Ads {
  constructor(save) {
    this.save = save;
    this.ready = false;
  }

  get configured() {
    const p = window.Capacitor?.getPlatform?.() === 'android' ? AD_IDS.android : AD_IDS.ios;
    return !!(p && p.interstitial && p.appId);
  }

  get removed() {
    return !!this.save?.data?.adsRemoved;
  }

  async init() {
    if (!this.configured) return false;   // dormant on purpose
    this.ready = true;
    return true;
  }

  // Called on a gate win. Returns whether an ad was actually shown, so callers
  // can keep their own flow honest rather than assuming.
  async maybeInterstitial({ won, isGate }) {
    if (!won || !isGate) return false;    // the rule, enforced here not at call sites
    if (this.removed || !this.ready) return false;
    return false;                          // no network yet
  }

  // Offer, never impose. Resolves false when there is nothing to offer.
  async offerRevive({ isBoss }) {
    if (!isBoss || !this.ready) return false;
    return false;
  }

  async purchaseRemoveAds() {
    if (!IAP_PRODUCT_ID) return false;
    return false;
  }
}

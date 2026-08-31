// The one purchase: Remove Ads, bought once, kept forever.
//
// Same shape as ads.js — this project has no bundler, so nothing is imported
// from npm; the native plugin registers itself on window.Capacitor.Plugins and
// we call it directly. On plain web, or with the plugin missing, or before the
// store product exists, EVERY path here fails closed: `available` is false, the
// settings row and the pre-ad offer never appear, and the game behaves exactly
// as it does today. A purchase surface that might not work must never be shown.
//
// ⚠ THE PLUGIN CALLS BELOW ARE UNVERIFIED AGAINST A REAL DEVICE. ads.js carries
// a scar about exactly this: its event names came from a README, were wrong,
// and wedged a button on device until they were checked against the plugin's
// native source. Before trusting this file, the Mac session must (a) install
// the plugin, (b) read its source for the real method names and result shapes,
// (c) run a sandbox purchase, a restore, and a CANCELLED purchase. Until then
// `PURCHASES.plugin` stays null and none of it runs.

// ---------------------------------------------------------------------------
// CONFIG. All of it has to exist before the purchase surface turns on:
//   1. the non-consumable created in App Store Connect AND Play Console,
//   2. a purchase plugin installed and named here,
//   3. `productId` set (and `apiKey`/`entitlementId` if the plugin needs them).
// Missing any of these leaves the feature invisible rather than broken.
// ---------------------------------------------------------------------------
export const PURCHASE = {
  // The Capacitor plugin's registered global name. SHIP.md §3.6 researched
  // @revenuecat/purchases-capacitor (13.x, registers as "Purchases"); the
  // adapter at the bottom of this file implements that one. Swapping plugins
  // means rewriting _adapter and nothing else.
  pluginName: 'Purchases',
  // The store product. Same string in both consoles.
  productId: null,          // e.g. 'com.wibesllc.echolume.remove_ads'
  // RevenueCat only: public SDK keys and the entitlement the product grants.
  // A direct-to-StoreKit plugin would not need these.
  apiKey: { ios: null, android: null },
  entitlementId: 'no_ads',
  // Shown only until the store's own localized price arrives. Never shown in
  // place of a real price at the moment of purchase — see priceText().
  fallbackPrice: '$2.99',
};

export class Purchases {
  constructor(save) {
    this.save = save;
    this.platform = window.Capacitor?.getPlatform?.() === 'android' ? 'android' : 'ios';
    this._price = null;       // localized price string, once the store answers
    this._started = null;     // in-flight init, so configure runs once
    this._ready = false;
  }

  get plugin() { return window.Capacitor?.Plugins?.[PURCHASE.pluginName] || null; }

  // Everything the store side needs before we may show a buy button.
  get configured() {
    return !!(this.plugin && PURCHASE.productId &&
      (!PURCHASE.apiKey || PURCHASE.apiKey[this.platform]));
  }

  // May the UI offer this purchase right now? False on web and in any build
  // where the plumbing is incomplete, which is what keeps the surface honest.
  get available() { return this.configured && !this.owned; }

  get owned() { return !!this.save?.data?.adsRemoved; }

  // The price to put on a button. Falls back to the configured string only
  // while the store has not answered yet; a real price replaces it silently.
  priceText() { return this._price || PURCHASE.fallbackPrice; }

  // Configure the SDK and refresh both entitlement and price. Safe to call any
  // time, including when nothing is configured (it just returns false).
  async init() {
    if (!this.configured) return false;
    if (this._started) return this._started;
    this._started = (async () => {
      try {
        await this._adapter.configure();
        this._ready = true;
      } catch (e) {
        console.warn('[iap] configure failed', e);
        return false;
      }
      // Entitlement first: a reinstall on the same account already owns this.
      try {
        if (await this._adapter.isEntitled()) this._grant();
      } catch (e) { /* offline is not a purchase failure; ask again later */ }
      try {
        const p = await this._adapter.price();
        if (p) this._price = p;
      } catch (e) { /* keep the fallback price */ }
      return true;
    })();
    return this._started;
  }

  // Buy. Resolves to one of:
  //   'owned'       — the purchase went through (or was already owned)
  //   'cancelled'   — the player backed out. NOT an error, and never surfaced
  //                   as one; a cancelled sheet is a normal thing to do.
  //   'unavailable' — nothing is configured, so nothing was attempted
  //   'failed'      — the store said no
  async buy() {
    if (this.owned) return 'owned';
    if (!this.configured) return 'unavailable';
    if (!(await this.init())) return 'unavailable';
    try {
      const res = await this._adapter.purchase();
      if (res === 'cancelled') return 'cancelled';
      if (res === 'owned') { this._grant(); return 'owned'; }
      return 'failed';
    } catch (e) {
      console.warn('[iap] purchase failed', e);
      return 'failed';
    }
  }

  // Restore. Apple requires a restore path for a non-consumable (App Store
  // Review 3.1.1) — without a visible one, this feature fails review.
  //   'owned' | 'none' | 'unavailable' | 'failed'
  async restore() {
    if (!this.configured) return 'unavailable';
    if (!(await this.init())) return 'unavailable';
    try {
      const entitled = await this._adapter.restore();
      if (entitled) { this._grant(); return 'owned'; }
      return 'none';
    } catch (e) {
      console.warn('[iap] restore failed', e);
      return 'failed';
    }
  }

  _grant() {
    if (this.save.data.adsRemoved) return;
    this.save.data.adsRemoved = true;
    this.save.persist();
  }

  // -------------------------------------------------------------------------
  // ADAPTER — the only plugin-specific code. Written for RevenueCat's
  // Capacitor plugin; every call and result shape here is from its docs and is
  // UNVERIFIED on device (see the header). Swapping to a direct StoreKit /
  // Play Billing plugin means replacing this object and nothing above it.
  // -------------------------------------------------------------------------
  get _adapter() {
    const p = this.plugin;
    const entitled = (info) =>
      !!info?.customerInfo?.entitlements?.active?.[PURCHASE.entitlementId];
    return {
      configure: () => p.configure({ apiKey: PURCHASE.apiKey[this.platform] }),
      isEntitled: async () => entitled(await p.getCustomerInfo()),
      price: async () => {
        const offerings = await p.getOfferings();
        const pkgs = offerings?.current?.availablePackages || [];
        const match = pkgs.find((k) => k?.product?.identifier === PURCHASE.productId)
          || pkgs[0];
        this._pkg = match || null;
        return match?.product?.priceString || null;
      },
      purchase: async () => {
        if (!this._pkg) await this._adapter.price();      // need the package
        if (!this._pkg) return 'failed';
        try {
          const res = await p.purchasePackage({ aPackage: this._pkg });
          return entitled(res) ? 'owned' : 'failed';
        } catch (e) {
          // The plugin reports a user-cancelled sheet as an error; treating it
          // as a failure would show "something went wrong" to someone who
          // simply changed their mind.
          if (e?.code === 'PURCHASE_CANCELLED' || e?.userCancelled ||
              /cancel/i.test(e?.message || '')) return 'cancelled';
          throw e;
        }
      },
      restore: async () => entitled(await p.restorePurchases()),
    };
  }
}

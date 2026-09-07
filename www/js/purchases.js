// The one purchase: Remove Ads, bought once, kept forever.
//
// Same shape as ads.js — this project has no bundler, so nothing is imported
// from npm; the native plugin registers itself on window.Capacitor.Plugins and
// we call it directly. On plain web, or with the plugin missing, or before the
// store product exists, EVERY path here fails closed: `available` is false, the
// settings row and the pre-ad offer never appear, and the game behaves exactly
// as it does today. A purchase surface that might not work must never be shown.
//
// The native half is `ios/App/App/StorePlugin.swift` — StoreKit 2, written for
// this app rather than taken from npm, exactly as GameConnectPlugin was. Echolume
// sells one non-consumable and needs no receipt server, so a purchases SDK would
// buy nothing and would be the only third-party data collector in the app.
// Bubble Popper ships the same architecture (expo-iap, direct to StoreKit).
//
// Android has no implementation yet: `configured` is false there, so the surface
// stays invisible rather than broken. See ANDROID-TODO.md.

// ---------------------------------------------------------------------------
// CONFIG. Both halves have to exist before the purchase surface turns on:
//   1. the non-consumable created in App Store Connect (and Play Console later),
//   2. a native plugin registering under `pluginName` on this platform.
// Missing either leaves the feature invisible rather than broken, which is why
// Android shows nothing today.
// ---------------------------------------------------------------------------
export const PURCHASE = {
  // The registered global name of our own plugin (StorePlugin.swift's `jsName`).
  pluginName: 'Store',
  // The store product. The SAME string in App Store Connect and Play Console.
  productId: 'com.wibesllc.echolume.remove_ads',
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

  // Everything the store side needs before we may show a buy button. The
  // plugin's mere presence is the platform check: StorePlugin is iOS-only, so
  // Android has no `Store` global and the surface stays hidden there.
  get configured() { return !!(this.plugin && PURCHASE.productId); }

  // May the UI offer this purchase right now? False on web and in any build
  // where the plumbing is incomplete, which is what keeps the surface honest.
  get available() { return this.configured && !this.owned; }

  get owned() { return !!this.save?.data?.adsRemoved; }

  // The store's own localized price, or null until it answers. There is
  // deliberately NO fallback: a hardcoded price is a guess, it goes stale the
  // moment the App Store price changes, and it is wrong in every currency but
  // one. Callers render the button without a price until this returns a string.
  priceText() { return this._price; }

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
      // A purchase can also land while nobody is looking: an Ask to Buy that a
      // parent approves later, or a buy made on another device. The native side
      // finishes those transactions and tells us here.
      try {
        this.plugin.addListener?.('purchaseUpdated', (ev) => {
          if (!ev || ev.productId === PURCHASE.productId) this._grant();
        });
      } catch (e) { /* no listener support is not fatal */ }
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
  //   'pending'     — Ask to Buy, or an interrupted payment. Nothing is owed and
  //                   nothing is owned; the grant arrives later through the
  //                   plugin's Transaction.updates watcher if it is approved.
  //   'unavailable' — nothing is configured, so nothing was attempted
  //   'failed'      — the store said no
  async buy() {
    if (this.owned) return 'owned';
    if (!this.configured) return 'unavailable';
    if (!(await this.init())) return 'unavailable';
    try {
      const res = await this._adapter.purchase();
      if (res === 'cancelled') return 'cancelled';
      if (res === 'pending') return 'pending';
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
  // ADAPTER — the only plugin-specific code, and the only thing that changes if
  // the native half is ever replaced. Talks to StorePlugin.swift.
  // -------------------------------------------------------------------------
  get _adapter() {
    const p = this.plugin;
    const id = PURCHASE.productId;
    const owns = (res) => Array.isArray(res?.owned) && res.owned.includes(id);
    return {
      // StoreKit needs no configuration step; the plugin is live once loaded.
      configure: async () => true,
      isEntitled: async () => owns(await p.isEntitled()),
      price: async () => {
        const res = await p.products({ productIds: [id] });
        return (res?.products || []).find((x) => x.id === id)?.price || null;
      },
      purchase: async () => {
        const { status } = await p.purchase({ productId: id });
        if (status === 'purchased') return 'owned';
        if (status === 'cancelled') return 'cancelled';
        if (status === 'pending') return 'pending';
        return 'failed';
      },
      restore: async () => owns(await p.restore()),
    };
  }
}

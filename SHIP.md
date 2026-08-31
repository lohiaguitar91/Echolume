# Echolume — ship checklist

Everything automatable is done and committed. These are the remaining human steps, in order.
Details for each live in docs/BUILDING.md and docs/PUBLISHING.md.

## 0. Repo
- [x] Pushed to github.com/lohiaguitar91/Echolume, `main` tracking `origin/main`.

## 1. Accounts (one-time)
- [ ] Google Play Console account ($25 once)
- [ ] Apple Developer Program ($99/yr)
- [ ] Host `store/privacy-policy.md` somewhere public (GitHub Pages of this repo works); save the URL.

## 2. Android build (any machine with Android Studio)
- [ ] Install Android Studio, open `android/` (`npx cap open android`), let Gradle sync.
- [ ] Run on a real device once; check: audio unlocks on first tap, haptics fire, 60fps feel,
      safe-area insets on a notched phone, portrait lock.
- [ ] Build → Generate Signed App Bundle; create keystore, BACK IT UP.
- [ ] Play Console: internal testing → upload .aab → test → promote to production.
- [ ] Store listing from `store/listing-android.md`; Data Safety = **Yes, collects**
      (ads ship at launch — the exact per-type answers are written in that file);
      icon `assets-out/pwa/icon-512.png` (regenerate via `/__dev/gen` if missing);
      feature graphic `store/feature-graphic.png`; screenshots `store/screenshots/`.

## 3. iOS build (Mac with current Xcode)
- [ ] Clone repo, `npm install`, `npx cap sync ios`, `npx cap open ios`.
- [x] Set signing Team (Wibes LLC, RV5N43T74L); bundle id `com.wibesllc.echolume`.
- [ ] Run on a real iPhone once (same spot-checks as Android).
- [x] Product → Archive → upload to App Store Connect. (build 1.0 (1) uploaded via
      CLI — see the xcodebuild commands in docs/BUILDING.md)
- [ ] Listing from `store/listing-ios.md`; App Privacy = **Yes, collects** (the
      per-type table is written in that file); paste its review notes into App
      Review Information.

## 3.5 Game services — Game Center & Play Games

The native bridge is **written and in the repo** (no third-party plugin: the only one
available is stuck on Capacitor 5). Both platforms expose the same JS API as
`Capacitor.Plugins.GameConnect`, and `www/js/gameservices.js` already drives it:
sign-in on Abyss entry, milestone unlocks as you cross them, depth submitted on each
death, a Leaderboard button on the recap, and a replay of anything earned offline once
sign-in completes. With no bridge present it silently stays local-only.

Files: `ios/App/App/GameConnectPlugin.swift` (GameKit) ·
`android/app/src/main/java/com/wibesllc/echolume/GameConnectPlugin.java` (Play Games v2,
registered in `MainActivity.java`, dependency in `app/build.gradle`).

**Verification status.** The Android plugin **compiles clean** against the real
Play Games Services 22.0.0 API (javac, JDK 21, `android-36` platform, real
`classes.jar`s from the resolved AARs) — every call, generic and lambda type-checks,
and `registerPlugin(Class<? extends Plugin>)` matches `BridgeActivity`. A full Gradle
assemble could not finish on this machine because the only JDK available is PyCharm's
JBR, which ships without `jlink` (needed by the compileSdk-36 JDK-image transform);
that's a local toolchain gap, not a project one — Android Studio's bundled JBR has it.

The **iOS plugin has not been compiled** (no macOS/Xcode). It was written against the
Capacitor 8 sources in `node_modules/@capacitor/ios` and matches the framework's own
reference plugins (`Console.swift` et al.) exactly: `@objc(...)`,
`CAPPlugin, CAPBridgedPlugin`, `public let identifier/jsName/pluginMethods`. Deployment
target is iOS 15, so every GameKit API used (all iOS 14+) is available.

### iOS
- [x] `GameConnectPlugin.swift` is in `App.xcodeproj` (file reference, App group, Sources
      build phase) **and registered with the bridge at runtime** by
      `EchoBridgeViewController` in `SceneDelegate.swift`. The runtime half matters:
      Capacitor auto-registers only npm plugin packages (`cap sync` writes their class
      names into the bundled config's `packageClassList` and overwrites it every run), so
      an app-target plugin that isn't registered in `capacitorDidLoad()` silently never
      exists on the JS side. Verified compiling on macOS/Xcode 26.4.
- [x] **Game Center capability**: `App/App.entitlements` is now in the repo and wired to
      both build configurations (`CODE_SIGN_ENTITLEMENTS`) — no Xcode click needed.
- [ ] App Store Connect → your app → Game Center: create a leaderboard with ID
      `abyss_depth` (integer, higher is better, "Best score" aggregation) and 15
      achievements with EXACTLY these IDs (1 point each is fine):

      abyss_1000  abyss_2000  abyss_3000  abyss_4000   abyss_5000
      abyss_10000 abyss_20000 abyss_30000 abyss_40000  abyss_50000
      abyss_60000 abyss_70000 abyss_80000 abyss_90000  abyss_100000

- [ ] Suggested display names: "First Thousand", "Two Thousand Metres", … ,
      "The Hundred-Kilometre Song".

### Android
- [ ] Play Console → Play Games Services → Setup: create the games project, link the app,
      add your signing certificate (both upload and release certs).
- [ ] Copy the numeric **project ID** into `game_services_project_id` in
      `android/app/src/main/res/values/strings.xml`, replacing the `REPLACE_WITH_...`
      placeholder. Until you do, the plugin stays dormant by design rather than crashing.
- [ ] Create the same leaderboard + 15 achievements. Play generates opaque IDs
      (`CgkI...`), so map them in `www/js/gameservices.js`:
      fill `PLAY_IDS` as `{ 'abyss_1000': 'CgkI…', … }` and set `PLAY_LEADERBOARD_ID`.
      Then `npx cap sync`.
- [ ] Add testers in Play Games Services → Testers, or sign-in fails before publishing.

## 3.6 Ads and the one purchase (v1.2 surface, currently dormant)

`www/js/ads.js` is written against the real plugin API (`Capacitor.Plugins.AdMob`, per
the plugin's v8 README), wired into the real flow, and **inert until the IDs exist and
the plugin is installed**. `Ads.maybeInterstitial()` is called on every level win; the
boss death screen shows a **"Watch ad to try again"** button only while
`Ads.canRevive()` is true (an ad loaded, a boss, not yet used this attempt) and
`Ads.showRevive()` resolves true only on a completed reward. Everything returns false
while dormant, so shipping it that way is safe.

The placement rules are enforced **inside `ads.js`**, not at the call sites, so they hold
no matter who calls them later (revised Aug 26 and Aug 31 2026):
- Interstitial after a **level win**, every 2–3 wins; the counter persists in the save
  and the 2-vs-3 rerolls per cycle.
- **Never** after a death, a failed gate, on the gate warning, or on first launch.
- **No rewarded revive.** Retired Aug 26: any unlocked depth restarts free, so it bought
  nothing. Its device-proven internals stay dormant in `ads.js` for a future placement.
- Before an interstitial the player is offered the way out (`AD_RULES.offerBeforeAd`,
  every Nth ad, silent for good after enough declines). Continuing is one plain tap.
- `remove_ads` kills interstitials permanently.

Current state (Aug 2026): **implemented and live against Google's SAMPLE ids.**
`@capacitor-community/admob` 8.1.0 is installed and `ads.js` drives it via
`Capacitor.Plugins.AdMob` (no bundler, so the npm JS wrapper is never imported).
Consent (UMP, defensive until a message is published) + the ATT prompt + SDK init all
run lazily on the first gate/boss depth, so the cold open stays clean. Interstitials
preload on gate-depth entry and show on the win screen; the rewarded revive preloads on
boss-depth entry and **resumes the run where you fell** (`Game.revive()`: full hearts,
`TUNING.reviveGrace` i-frames, world untouched) — it has to outbid the free lair-mouth
retry or it would be a scam. Declining is just using the ordinary death-screen buttons.

- [x] **iOS ids are real** (AdMob app + both units created Aug 20 2026; `ADS_ARE_SAMPLE`
      is false). Still open: put the test iPhone's id in `TEST_DEVICE_IDS` (the SDK logs
      it on the first ad request from an unlisted device), and swap the Android sample
      ids in `AD_IDS` + `AndroidManifest.xml` when the Play console work happens. Then
      `npx cap sync`.
- [ ] Publish the GDPR consent message in AdMob (Privacy & messaging) before any
      public release; the code already calls the consent APIs and no-ops until then.
- [ ] **Turn the purchase on.** `www/js/purchases.js` holds the whole buying surface
      (settings block + pre-ad offer, both already built and verified against a fake
      plugin). It stays invisible until all of this exists, so shipping without it is
      safe. To enable, in order:
      1. Create the `remove_ads` **non-consumable** in App Store Connect AND Play
         Console (same product id in both).
      2. Install a purchase plugin and put its registered global in
         `PURCHASE.pluginName`. `@revenuecat/purchases-capacitor` 13.x (registers as
         `Purchases`, declares `@capacitor/core >=8.0.0`) is what the adapter at the
         bottom of `purchases.js` is written for. **Note it is a third-party SDK: it
         adds a privacy-manifest / data-safety entry.** A direct StoreKit + Play
         Billing plugin avoids that, and swapping means rewriting `_adapter` only.
      3. Set `PURCHASE.productId` (and `apiKey`/`entitlementId` if the plugin needs
         them). `npx cap sync`.
      4. **Verify the adapter's calls against the plugin's own source, not its
         README** — that exact mistake wedged the ad button on device once. Then test
         on a device with a sandbox account: buy, restore, and a **cancelled** sheet
         (cancel must be silent, not an error), plus a fresh install → Restore.
      Until this lands, interstitials simply cannot be turned off — fine for testing.
- [ ] Re-test that a death never produces an interstitial.
- [ ] **`AD_DEBUG` stays false everywhere; `FORCE_TEST_ADS` stays TRUE through every
      beta and flips to false only for the STORE submission build.** Test-ads betas are
      deliberate: beta testers are ~100% of a new account's traffic, the worst possible
      invalid-traffic ratio. Before submitting: flip false, rebuild, one impressions-only
      smoke run (never tap), confirm requests appear in the AdMob dashboard, submit.
      (TestFlight history: build 5 = live ads, build 6 = test ads / the beta build.)

### Metadata: already written for an ad-supported launch

Ads are shipping in v1.0, so all of this is **already updated in the repo** and
describes the launch build. It is listed here so you can check it, not redo it.

- [x] `store/privacy-policy.md` — rewritten with an advertising section covering the
      six data types the Google Mobile Ads SDK collects, the ATT choice, the advertising
      ID reset, and the Remove Ads purchase.
- [x] `store/listing-ios.md` — App Privacy now answers **Yes** to data collection, with
      a per-type table (linked / used-for-tracking). Review notes explain the ad
      placement rules and the ATT prompt.
- [x] `store/listing-android.md` — Data Safety answers **Yes**, declares the four
      collected-and-shared categories, and the listing is marked **contains ads**.
- [x] `ios/App/App/PrivacyInfo.xcprivacy` — `NSPrivacyTracking` is `false` with empty
      domains, settled by ITMS-91064 on build 1.0.0 (6) (true + empty domains is
      rejected as "invalid tracking information"). The SDK's own manifest and the ASC
      App Privacy answers carry the tracking disclosure. Do not copy Google's
      declarations into ours.
- [x] `ios/App/App/Info.plist` — `NSUserTrackingUsageDescription` added (without it the
      ATT call silently no-ops and the build is rejected), plus Google's SKAdNetwork id.

The two app-id keys are now **present with Google's sample values** (the SDK throws at
launch if either is missing *or* malformed, and the sample ids are the documented safe
way to run before the console exists). Swap both to the real ids with the `AD_IDS` swap
above — the ⚠ comments sit at the point of use:
- [ ] iOS `GADApplicationIdentifier` in `Info.plist` — real id
- [ ] Android `com.google.android.gms.ads.APPLICATION_ID` in `AndroidManifest.xml` — real id

- [ ] **Re-check both disclosure tables against Google's current pages before each
      submission** ([iOS](https://developers.google.com/admob/ios/privacy/data-disclosure),
      [Android](https://developers.google.com/admob/android/privacy/data-disclosure)).
      What the SDK collects has changed between versions, and the obligation is yours
      regardless of what the SDK's own manifest says.

## 4. Final sanity before each submit
- [ ] Version stamps agree: `www/js/config.js` GAME_VERSION, `package.json`,
      `www/sw.js` VERSION, `android/app/build.gradle` versionName, Xcode
      MARKETING_VERSION. All are **1.0.0** (reset for the first public release); Android `versionCode 3`, iOS build number 4 keep counting upward.
      Bump the build number on every upload — App Store Connect rejects a repeat.
      (The `docs/plan-v1.*.html` names are internal milestones, not store versions.)
- [ ] Name check: "Echolume" still free on both stores.
- [ ] Privacy policy URL is live and linked in both listings.

## 5. After launch
- [ ] Reply to first reviews quickly.
- [ ] Keep the privacy policy URL alive.
- [ ] For updates: bump all five version stamps, `npx cap sync`, rebuild, never reuse a build number.

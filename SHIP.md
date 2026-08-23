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
- [x] `GameConnectPlugin.swift` is already registered in `App.xcodeproj` (file reference,
      App group, and Sources build phase) — it compiles without any Xcode file wrangling.
- [ ] Enable the **Game Center** capability on the App target
      (Signing & Capabilities → + → Game Center). This needs your signing team, so it
      can't be pre-set in the repo; it's one click and writes the entitlement for you.
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
no matter who calls them later:
- Interstitial **only** after clearing a gate depth (every 7th), on the win screen.
- **Never** after a death, a failed gate, on the gate warning, or on first launch.
- Rewarded revive at bosses only, once per attempt, as a button the player taps; it
  resumes the run where it ended (hearts back) — the free lair-mouth retry stays.
- `remove_ads` kills interstitials permanently; the revive stays as a player choice.

To turn it on:
- [ ] `npm i @capacitor-community/admob` (8.1.0 supports Capacitor 8 — verified against
      the registry; no hand-written bridge needed this time).
- [ ] AdMob account → register both apps → fill `AD_IDS` in `www/js/ads.js` with the
      per-platform app id and the interstitial/rewarded unit ids.
- [ ] Create the `remove_ads` non-consumable in **both** App Store Connect and Play
      Console, then set `IAP_PRODUCT_ID`. Pick a purchase plugin
      (`@revenuecat/purchases-capacitor` 13.x declares `@capacitor/core >=8.0.0`).
- [ ] `npx cap sync`, then re-test that a death never produces an interstitial.

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
- [x] `ios/App/App/PrivacyInfo.xcprivacy` — `NSPrivacyTracking` is now `true`.
      `NSPrivacyTrackingDomains` is intentionally empty: the ad SDK declares its own
      domains in its own manifest and Apple aggregates them. Do not copy Google's
      declarations into ours.
- [x] `ios/App/App/Info.plist` — `NSUserTrackingUsageDescription` added (without it the
      ATT call silently no-ops and the build is rejected), plus Google's SKAdNetwork id.

Two identifiers are **deliberately absent**, because the SDK throws at launch if either
is missing *or* malformed — a placeholder would crash every build. Add both at the same
moment you add the SDK; the exact snippets are in comments at the point of use:
- [ ] iOS `GADApplicationIdentifier` in `Info.plist`
- [ ] Android `com.google.android.gms.ads.APPLICATION_ID` in `AndroidManifest.xml`

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

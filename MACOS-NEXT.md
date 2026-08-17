# For the Claude on Disha's MacBook — start here

You are picking up Echolume on macOS. A Claude session on the Windows box wrote
this for you. Read `CLAUDE.md` (project rules), then this file, then `SHIP.md`
for the full human checklist.

**The state in one line:** all 50 depths are built and verified, the gate
economy is in, the ad surface is written and wired but deliberately inert, and
everything still open needs Xcode, Android Studio, or a store console — which is
why it is waiting for you and not for the Windows box.

---

## Read this before you touch anything

Three things will waste your time if you learn them the hard way. The Windows
session learned all three the hard way.

1. **`npx cap sync` on Windows corrupts `ios/App/CapApp-SPM/Package.swift`**,
   rewriting the two plugin paths with backslashes. It has happened twice. On
   macOS it should be fine, but if the iOS build suddenly cannot resolve
   `CapacitorHaptics`, check that file first and run
   `git checkout -- ios/App/CapApp-SPM/Package.swift`.
2. **`__echo.autoplay()` is not deterministic** — hunter wander uses
   `Math.random()`. A single `verifyAll()` pass proves nothing about a marginal
   level. Run 9–11 trials and read the *pass rate*. Depths 1–28 sit at 100%;
   34 and 36 sit at 89%, which matches shipped depth 27. Treat under ~90% as a
   real problem, not noise.
3. **Text has been damaged crossing machines before.** A previous handoff lost
   the space in `func signIn` (four times) and the backslashes in
   `Package.swift`. If native code written on Windows will not compile, suspect
   a dropped character before you suspect the logic.

---

## What is actually done

- **All 50 depths.** Four chapters: Shallows (1–14), Trench (15–28), Hush
  (29–42), Warm Dark (43–50). Verified: placement, reachability, and a
  dodging bot's survival rate (0.996 average over 9 trials × 50 depths).
- **The gate economy.** Every 7th depth is a gate, every 14th a boss. Motes
  banked across the seven depths behind it buy a passive boon. Two invariants,
  both tested, both load-bearing — do not break them:
  - every gate is winnable at **zero** motes (verified 5/5 on an empty save);
  - the bank is **never consumed** (sum of `bestMotes` per depth).
- **Two stars, not three.** Motes stopped being graded and got their own light
  bar. Save migrates v1→v2 by recomputing from stored `bestPings`.
- **The ad surface**, dormant. See below.
- iOS compiles (simulator, signing disabled) and has run on a real device via
  TestFlight. Android has **never been built at all**, on any machine.

## What is not done, and needs you

Ordered by what unblocks the most.

### 1. Android has never been compiled — do this first
It is the single biggest untested surface in the project. `npx cap open android`,
let Gradle sync, `assembleDebug`. Resource linking is known-good (it caught a
real adaptive-icon bug already), and `GameConnectPlugin.java` type-checks against
the real Play Games 22.0.0 API, but no full build has ever completed.

### 2. Look at the new screens on a device
The **gate screen** and the **results light bar** have never been seen rendered
anywhere. The Windows box could only verify them through `classList` and
`textContent`, because the preview pane never composites, so CSS transitions
never advance and every overlay reads `opacity: 0`. Layout is genuinely
unverified. Files: `#screen-gate` and `#light-bank` in `www/index.html`,
styles under `/* ---------- gate ---------- */` in `www/css/ui.css`.

### 3. Game Center capability
One click, and it cannot be pre-committed because it needs the signing team:
Signing & Capabilities → + → Game Center. Then create the leaderboard and the 15
achievements exactly as listed in `SHIP.md` §3.5 — the IDs are emitted verbatim
by `www/js/gameservices.js`, so a typo silently breaks unlocks.

### 4. Ads and the one purchase
`www/js/ads.js` is written, wired, and inert. `maybeInterstitial()` runs on every
level win and `offerRevive()` on every boss death; both return false while
`AD_IDS` is null. **The placement rules are enforced inside `ads.js`, not at the
call sites** — an interstitial is refused for a death or a non-gate win no matter
who asks. Keep it that way.

Turning it on is: install `@capacitor-community/admob` (8.1.0 supports Capacitor
8), paste the ids, create `remove_ads` in both consoles, set `IAP_PRODUCT_ID`.

**The metadata is already done.** Ads ship at launch, so the repo now describes
an ad-supported app rather than an offline one: the privacy policy has an
advertising section, both listings declare collection with per-type tables,
`PrivacyInfo.xcprivacy` sets `NSPrivacyTracking` true, and `Info.plist` has the
ATT usage string and Google's SKAdNetwork id. `SHIP.md` §3.6 has the checklist.

Two identifiers are **deliberately missing** and you must add both when you add
the SDK: iOS `GADApplicationIdentifier` and Android
`com.google.android.gms.ads.APPLICATION_ID`. The SDK throws at launch if either
is absent *or* malformed, so a placeholder would have crashed every build. The
exact snippets are in comments at the point of use in `Info.plist` and
`AndroidManifest.xml`.

One thing I could not settle from here: `NSPrivacyTrackingDomains` is empty on
purpose, because this app makes no tracking connections of its own and the ad
SDK declares its own domains. That reading matches Apple's aggregation model,
but I could not test it against a real submission — if the validator complains,
that is the first place to look.

### 5. Chapter 3's difficulty is unmeasured
The bot navigates by corridor geometry, not by what it can see, so it is
structurally blind to how hard a hush zone is — a hush level that is miserable
for a human scores the same as an easy one. Someone has to actually play 29–42.

---

## Design rules that must survive

These are not preferences. Breaking any of them re-introduces a bug that was
already found and fixed.

- **No hue may be reused.** The mote chain ladder once stepped through
  `#5effc2`, the vent's exact colour, while the tutorial taught "the green vent
  takes you deeper" — a playtester read a good chain as a new kind of object.
  Motes are amber at every tier now; the chain speaks through size, pulse and
  halo. The palette is crowded; separate new things by shape and scale first.
- **A warm vent pins you to the centre line at speed.** In any level with
  `warmVents`, urchins and ice must hug the wall (|off| ≥ ~0.7 × half-width).
  Depth 44 failed 0/7 until one urchin moved outward, then 7/7.
- **Lures hug the wall too**, at |off| ≈ half-width. `lureBaitRadius` is 50, so
  a centred lure in a 90-wide corridor walls the seam completely.
- **Never more than 2 hunters** in a corridor under ~110 wide.
- **Difficulty sawtooths from non-gate levels only.** Gates are designed spikes;
  using them as the baseline opens the next chapter at boss difficulty.
- **The gate screen states a fact and offers a door back.** No shop, no
  purchase, nothing that could read as a paywall. There is no way to buy light,
  and the copy must never imply otherwise.
- **Ads: after a win, never after a death.**

---

## How to verify anything you change

```bash
npm run dev            # port 3852
```

Then in the browser console:

```js
__echo.verifyAll()                    // placement, reachability, survival, all 50
__echo.autoplay(id, {})               // one depth, dodging bot, no god mode
__echo.autoplay(id, { god: true })    // reachability only; par is ~9.5x this
```

Drive the sim with `__echo.game.update(1/60)` in a synchronous loop rather than
waiting on frames. After any change to `www/`: `npx cap sync`.

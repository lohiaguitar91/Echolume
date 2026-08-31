# For the Claude on Disha's MacBook — start here

You are picking up Echolume on macOS. A Claude session on the Windows box wrote
this for you. Read `CLAUDE.md` (project rules), then this file, then `SHIP.md`
for the full human checklist.

**The state in one line:** all 50 depths are built and verified, the gate
economy (now v1.3, with carried boons) is in, ads are device-proven and run on
a 2–3 win cadence, and everything still open needs Xcode, Android Studio, or a
store console — which is why it is waiting for you and not for the Windows box.

**The final Windows commit is `6bc70df`** ("Bosses perform casting; final
verified pass before the Mac", Aug 17 2026). Its message lists exactly what was
verified on that tree and what only thumbs can judge. If `git log` shows
anything after it that did not come from your own Mac session, read that first.
**After your Build 8 (`aa35883`), a remote session landed the Aug 26 feedback
round** — `16e7b34..e7a967a`, Aug 28–29 2026 — summarized in the next section.

---

## The Aug 31 round (remote session) — the purchase surface

`www/` + docs only, but it is the one thing that needs **store console work from
you** before it does anything. Two surfaces are built and verified against a fake
plugin: a **Settings block** (Remove ads + Restore purchase) and an **offer shown
just before an interstitial** ("An ad is next", with Remove ads or Watch the ad).
Both are **invisible until the store side is live**, so this ships safely as-is.

Buying lives in the new `www/js/purchases.js`, never in `ads.js`. Turning it on is
SHIP.md §3.6's checklist: create the non-consumable in both consoles, install a
plugin, set `PURCHASE.productId`. **Read the ⚠ header in `purchases.js` first** —
its adapter is written for RevenueCat from docs and is UNVERIFIED on device, which
is precisely the mistake that wedged the ad button once. Verify the call names
against plugin source, then sandbox-test buy, restore, and a cancelled sheet.

Two rules baked in that must survive: `save.reset()` preserves `adsRemoved` (erasing
progress must never revoke a purchase), and the pre-ad offer is rate-limited by
`AD_RULES.offerBeforeAd` so it stays an offer instead of a toll booth. Also in this
round: the How to sing copy, teach cards and a few level hints were rewritten to
drop em-dashes and colon-splice explainers.

---

## The Aug 28–29 round (remote session) — new since Build 8

All of it is `www/` + docs; nothing native moved. Pull main, `npx cap sync`,
build. What changed, from Disha's Aug 26 TestFlight notes plus a design round:

- **The water stopped cheating.** `TUNING.sink` is gone — an idle lume settles
  to a stop; only currents and warm vents move you for free. Blue water got a
  visible body: a two-layer breathing wash under denser, brighter streaks
  (chosen from screenshotted options; a +30% `currentForce` variant was
  deliberately NOT shipped — bump it only if the current looks right on device
  but rides weak, and re-verify if you do).
- **The light economy earns its keep (v1.3).** Each collect surges the aura
  (~+25% for 4s); the gate boon now carries at 30% strength through the six
  depths after its gate (`carriedBoon` in `levels.js`); cast commit and range
  scale with this run's motes (2.4s→3.79s, 420→500 at the glow cap —
  `effectiveCastCommit/Range`, and the aim glyph clamps with the same call);
  a fully banked depth wears gold in the level select, a fully lit chapter
  gilds its gate mark, and the last mote of a depth emits a grand silent bloom.
  Hard mote quotas were considered and rejected on data — CLAUDE.md has the
  numbers; do not reopen it without them.
- **Ads were rewired (see §4, which was updated to match).** Interstitials now
  run after level wins on a 2–3 win cadence; the rewarded revive is RETIRED —
  the death screen has no ad button anymore and the shell plumbing is gone,
  though the device-proven rewarded internals stay dormant in `ads.js`. Sole
  monetization: ads + pay-once Remove Ads, framed as supporting the developer.
- **Guidance dedupe.** Authored hints that restate a first-encounter teach card
  carry a `subject` and stay quiet on the play where that card fires (the two
  used to stack the same lesson back to back on depths 1/3/4/6/...).
- **Feel fixes.** Taps within ~70px scale down to a 45% floor so "thread the
  needle" is real; the cast charge arc also closes around the player (it drew
  only under the thumb — a tester thought the charge was removed); the title
  lume swims ~3× faster; fresh saves see About → How to sing → water, and the
  About button says "To the depths".

Verified before push: `verifyAll` 50/50, live bot 9/9 on the twenty sensitive
depths on BOTH an empty save and a maxed bank, all economy numbers exact.

**What only thumbs can judge in this round:** does the surge read on a phone
in daylight (`moteSurge`/`moteSurgeTime`); is a 3.79s fed commit too soft on
the double-hunter depths (19, 25); is `BOON_CARRY` = 0.3 too generous through
chapter 2's opening; and does an ad every 2–3 wins feel fair in a real session
(`AD_RULES.interstitialEveryNWins`).

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
   level. Run 9–11 trials and read the *pass rate*. The final Windows pass put
   every depth at 10/11 or better; depth 37 straddles (one round 24/25, another
   round a single-sample fail) and that is known and acceptable. Treat a *rate*
   under ~90% as a real problem, not one bad sample.
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
- **Bosses perform their relationship to casting** (render-only, sim untouched):
  a listening warden turns its body toward your cast-aim landing and parts its
  plates (`_attend`/`_face`, fed by `main.js`, consumed by `draw.js` — the strike
  still uses `w.aim`, and a committed warden ignores the lure); the Twins' tell
  now says a thrown song can pull one wide; the Deaf God visibly swallows songs —
  the ring's arc facing it grays out and crumbles while the god does not react.
  Ash tones, not alert red, so it reads the same with the visual-threat toggle
  on or off.
- **Store screenshots are current.** Six new 1320×2868 captures in
  `store/screenshots/` (cold open with the verbs strip, mote chain, gate screen,
  Listener mid-telegraph, hush + ice, Warm Dark finale), rendered by the actual
  game with the DOM HUD composited in. Nothing left to capture for submission.
- **Playtest round (Aug 17), from Disha's TestFlight notes:** song budgets are
  15% tighter on every depth (the second star was too easy); a thrown song now
  *commits* its listeners for `castCommit` = 2.4s so your next tap cannot undo the
  lie (the verb "didn't work as well as I thought" because it lasted one song);
  the boon chip no longer ghosts on every depth and its label says what you see
  ("Afterglow", "Heard") with a once-per-gate plain-words hint and a rewritten
  depth-7 gate line (no more "glow 35%"); the "0 m" meter is Abyss-only again;
  and the boss death screen gained the "Watch ad to try again" button (retired
  in the Aug 28–29 round — see §4). Budget factor and `castCommit` are the two
  numbers most worth a human's opinion (`castCommit` now also scales with
  gathered light — judge the fed end too).
- **Two small HUD fixes from the final layout battery:** the depth toast now
  wraps instead of clipping on ≤430px-wide screens ("The Trench Mouth" was 398px
  wide at its tracking), and on short screens (≤640px tall) the verbs strip
  rides higher and smaller so a depth's opening hint cannot sit on top of it.
  Worth one glance on an SE-class phone.
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
The **gate screen** and the HUD have now been *seen* — the new store screenshots
composite them with computed styles, and collision boxes pass at 375×812 and
320×568 — but transitions and easing have still never advanced anywhere (the
Windows pane never composites, so every fade was forced to its resting state).
Watch the gate screen appear, the boss card fade, and the verbs strip dissolve
on first touch. Files: `#screen-gate` in `www/index.html`, styles under
`/* ---------- gate ---------- */` in `www/css/ui.css`.

### 3. Game Center capability — DONE on the Mac (Aug 20 2026)
The entitlement no longer needs an Xcode click: `App/App.entitlements` is in the
repo and wired into both build configs. More importantly, the Mac session found
and fixed a real registration hole: Capacitor 8 only auto-registers plugins named
in the synced config's `packageClassList`, which the CLI rebuilds from npm
packages on every sync — an app-target plugin never makes the list, so
`Capacitor.Plugins.GameConnect` was silently undefined. `EchoBridgeViewController`
(in `SceneDelegate.swift`) now registers it in `capacitorDidLoad()`. What remains
is console-side only: create the leaderboard and the 15 achievements exactly as
listed in `SHIP.md` §3.5 — the IDs are emitted verbatim by
`www/js/gameservices.js`, so a typo silently breaks unlocks.

### 4. Ads and the one purchase — DEVICE-PROVEN, REWIRED Aug 28–29
The placement rules changed in the Aug 28–29 round, from Disha's Aug 26 notes:
interstitials now run after a LEVEL WIN every 2–3 wins (the counter persists in
the save, the 2-vs-3 rerolls per cycle, and an unloaded ad carries the debt to
the next win instead of forgiving it), never after a death. **The rewarded
revive is retired** — any unlocked depth restarts free, so it bought nothing;
the death-screen button, `_reviveSpent`, and the `startLevel({revive})` path
are gone from the shell, while the device-proven rewarded internals (event-
driven shows, the 15s watchdog) stay dormant in `ads.js` for any future
rewarded placement. The shell contract is now two calls: `levelStarted()` on
every depth entry (preloads once the cadence says this win could show one —
which also means consent/UMP + ATT now fire around depth 2, not depth 7,
answering the Aug 20 note) and `maybeInterstitial({won})` on wins. The Mac's
SDK internals are untouched: lazy consent with `npa` after a denial, prepare
resolves only when loaded, shows driven by plugin EVENTS (the show promises
settle inconsistently and can hang forever — this wedged a button on device
once), and an honest toast on failure.
**The placement rules are still enforced inside `ads.js`, not at the call
sites.** Keep it that way. Real iOS ids are live (AdMob app + units, Aug 20);
`FORCE_TEST_ADS` serves Google's sample units through every beta and flips
false only for the store build; `AD_DEBUG` paints an on-screen breadcrumb log
when a device needs interrogating. TestFlight: builds 5 (live ads, reserve),
6 (ITMS-91064, superseded), 7 (the beta build), 8 (the reconciled tree).

Remaining: Android ids when the Play console work happens, publish the GDPR
message in AdMob before public release, create `remove_ads` in both consoles +
a purchase plugin, set `IAP_PRODUCT_ID`.

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

The `NSPrivacyTrackingDomains` question is now SETTLED by a real submission
(Aug 20 2026): `NSPrivacyTracking=true` with an empty domains list drew
ITMS-91064 "invalid tracking information" on build 1.0.0 (6). The fix that
matches Google's own GMA manifest (which omits the top-level tracking key and
declares tracking per data type): the app manifest says `false` + empty
domains, and the SDK manifest + ASC App Privacy answers carry the disclosure.

### 5. Play with the new verb: hold to throw your voice
Casting is the biggest gameplay change since the gate economy, and it is tuned
entirely by eye. Hold past ~320ms and release: the song lands where you held,
everything listening goes there, and you go nowhere. Things only a human can
judge:
- does 320ms feel right as the threshold, or do taps trigger casts by accident?
- tap now fires on pointer RELEASE (so tap and cast cannot collide), adding the
  finger's contact time (~80-120ms) to every tap. Does tap still feel snappy?
- is the aim thread legible while your thumb is on the screen?
- try a silent cast (carry banked light into 14): it should light distant water
  and wake nothing. That interaction is load-bearing — keep it.

### 6. Play the bosses, and watch the boon chip
Two things were rebuilt because they were real but invisible, and both need a
human to confirm they now read:

- **Bosses.** There are four, each a different creature with a different
  counter. Depth 14's is new: an anchored *warden* that strikes along the line
  to your **last song**, so you beat it by singing somewhere you are not. Its
  telegraph is a red arc that widens during windup — the whole fight is whether
  that arc is legible in time. The bot cannot judge this, because it sings
  exactly where it swims. Three cast-performances also need human eyes: does
  the warden's body-turn toward your held aim *read* as "it hears where the
  song will land"; does the Deaf God's gray ring-death read as "my voice does
  not work here" rather than a glitch; and does the Twins' new tell line land.
- **The boon chip.** Carried light used to be promised at the gate and then
  never shown. There is now a chip above the HUD naming the active boon, with
  pips that darken as silent songs are spent, plus a flash and a burst when one
  goes. Check that the spend actually reads at a glance.

### 7. Chapter 3's difficulty is unmeasured
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
- **Ads: after a win, never after a death.** The cadence (every 2–3 wins) and
  the retired revive live inside `ads.js` — placement decisions stay there.
- **Every gate winnable at zero light, the bank never consumed, no way to buy
  light.** The carried boon (v1.3) dims the gate's gift through the chapter; it
  must never become permission. Hard mote quotas were rejected on measured
  floor data (CLAUDE.md has it) — don't reopen without new numbers.

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

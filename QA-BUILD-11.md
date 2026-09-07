# Echolume — what to test in TestFlight build 11

**Build:** 1.0.0 (11) · uploaded Sept 6 2026 · iPhone only
**Note:** gameplay is identical to build 10; 11 only drops iPad support. Test on an
iPhone. If you already installed 10, update to 11 before starting.
**Time needed:** about 90 minutes for the focused list, longer if you play all 50 depths.

Read this before you start. Echolume is verified automatically by a bot that plays
every depth, and it passes 50 out of 50. That result is worth less than it sounds,
because **the bot cannot see**. It navigates by the shape of the cave, not by what is
lit, and it only ever uses one of the game's two controls. Everything below is a place
where the automated result is either meaningless or actively misleading. That is why a
person is being asked.

Play normally first, then come back and work the list.

---

## How to play, in one paragraph

You are a blind creature in a dark cave. **Tap** to sing: it pushes you, briefly lights
the world, and makes noise that things can hear. **Press and hold, then release** to
throw your voice: the song lands where you held, lights the world *there*, and anything
listening goes *there* instead of to you — but you do not move. Amber **motes** are
collectibles. Green **vents** are the exit. You have hearts.

---

## The six things to judge

For each one: what to do, and what we need to know. **"It felt fine" is a useful
answer.** So is "I could not tell." Please do not try to be diplomatic - a lukewarm yes
is the least useful thing you can report.

### 1. The Listener (depth 14) — most important

This is a boss. It is anchored in place and it strikes along a line toward **wherever
you last sang**, so the way to beat it is to sing somewhere you are not.

Just before it strikes, a warning appears: **two curved bones grow along the edges of
the area it is about to hit**, with red specks streaming between them. You get about
1.35 seconds. One tap sideways is enough to get out of the way.

Play this fight at least five times, even after you win.

- Could you tell **where** it was about to hit, in time to move? Or did you die not
  knowing what killed you?
- Did you work out on your own that singing somewhere else moves its attention? If so,
  roughly which attempt?
- Does the arena feel like a fight, or does it feel **cramped** - like you do not have
  room to dodge? (This is a specific worry. The arena was made narrower on purpose and
  it may have gone too far.)
- Do the bones read as a warning, or as decoration?

### 2. Can you see the light surge outdoors?

When you collect a mote, your glow gets brighter for about 4 seconds.

Play a few depths **outside in daylight, or by a bright window**, on normal screen
brightness. This has only ever been checked on a desk monitor indoors.

- Can you see the brightening at all outdoors?
- If you can't: does collecting motes feel pointless as a result?

### 3. Depths 19 and 25 — too easy?

These two have two hunters each. After a thrown song, hunters stay committed to that
spot for a few seconds, and the more light you have collected on that run, the longer
they stay fooled (up to about 3.8 seconds).

Play both **twice: once having collected every mote you can, once ignoring motes.**

- With lots of light collected, is throwing your voice so effective that the hunters
  stop being a threat?
- Is there a real difference between the two runs, or did it feel the same?

### 4. Depths 15 to 20 — does chapter 2 open with any teeth?

Depth 14 is a boss; after it you get a lingering bonus that fades over the following
depths.

- Do 15 through 20 feel too easy, like the game got easier after the boss instead of
  harder?
- Where does it start feeling like a real challenge again?

### 5. Ads — fair or annoying?

An ad appears after you complete a depth, roughly every 2nd or 3rd completion. Never
after you die. Sometimes you will first be offered a "remove ads" option; you can
decline with one tap.

**These are test ads and earn nothing. Never tap an ad deliberately.** Just close them.

Play one uninterrupted 20-minute session and judge it as a player:

- Did the frequency feel reasonable, or did it start to grate?
- Did an ad ever appear at a moment that felt unfair or badly timed?
- Did the "remove ads" offer feel like a helpful option or like a toll booth?

### 6. Depths 29 to 42 — nobody knows if these are any good

This chapter introduces **hush zones**, where your song does not carry. The automated
test is completely blind to this: it does not need to see, so a hush zone that is
miserable for a human scores exactly the same as an easy one.

**Fourteen depths of this game have never been meaningfully evaluated by anyone.**

Play all of them. For each, note:

- Roughly how many attempts it took
- Whether any felt unfair rather than hard (a distinction worth making: "hard" is when
  you know what you did wrong)
- Anywhere you felt lost or stuck with no idea what to try next
- Any depth you would quit the game over

---

## Also new in this build, worth a glance

- **Three stars per depth now**, not two. The third is for collecting every mote in a
  depth. Confirm the results screen fits and reads clearly, especially on a smaller phone.
- **The depth-name banner** at the start of each level should wrap onto a second line
  rather than getting cut off. Watch for clipped text, especially long names like
  "Depth 16 · Two Kinds of Star".
- **Motes should never sit inside a hazard.** If you find a mote you cannot pick up
  without taking damage, that is a bug - note the depth number.

## Standard checks

- Sound works from the very first tap (all audio is generated live - there are no
  sound files)
- Vibration/haptics fire
- Smooth movement, no stutter
- Nothing hidden behind the notch, the status bar, or the home indicator
- The screen stays in portrait
- Send the app to the background mid-level, come back - does audio resume, does the
  game recover?
- Nothing overlaps: hint text, boss cards, tutorial cards and the objectives row should
  never sit on top of each other

## How to report

Per issue: **depth number, what you did, what happened, what you expected.** Screenshots
or a screen recording help enormously, especially for anything visual.

Send to **wibes.llc@gmail.com**, or straight through TestFlight's feedback (screenshot
inside the app, then tap Share).

---

### For the developer

The constants behind each item, so a report maps to a change:
1. `wardenJaw` telegraph in `draw.js`; arena half-width 210 and warden 40 off centre in
   `levels.js` depth 14
2. `TUNING.moteSurge` / `moteSurgeTime`
3. `effectiveCastCommit` (2.4s floor, 3.79s at the glow cap)
4. `BOON_CARRY` = 0.3
5. `AD_RULES.interstitialEveryNWins`, `AD_RULES.offerBeforeAd`
6. Unmeasured by construction - the autoplay bot navigates by corridor geometry

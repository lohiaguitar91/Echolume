# Iterating on Echolume — guardrails for future sessions

The look and feel is **settled**. This is not a restyle plan and never will be;
it is how the game stays exactly itself while it grows. If a change makes a
screenshot read differently, the change is wrong, not the screenshot.

## 1. The no-drift check (any change touching drawing code)

Before the change, capture reference frames at the same four depths every time,
one per chapter — 5 (shallows), 19 (trench), 36 (hush), 46 (warm dark):

```js
__echo.startLevel(5); __echo.renderNow(); __echo.canvasShot()
// → POST to /__dev/save, the store-screenshot pipeline in CLAUDE.md
```

After the change, capture the same four again. Then a **fresh session** — one
that did not make the change — compares each pair WITHOUT being told which is
newer. It answers one question: **"same game?"** Never "which is better?" The
shipped look is the spec, and "better" is how drift starts.

Two caveats baked into the method:

- Frames are not pixel-identical run to run (plankton, hunter wander, phase
  timers). The comparison is identity — palette, shapes, glow character,
  density — not pixel equality.
- If the blind reviewer can tell which frame is newer, the change drifted.
  That verdict stands even if they prefer the new one.

## 2. Decision provenance (plans and design docs)

Tag every decision **USER** or **AI-suggested**. An AI suggestion stays a
proposal until a human promotes it — it does not become load-bearing by being
written down, restated, or built on by a later session. If a decision's origin
is unclear, treat it as a proposal.

## 3. What Echolume will never import

No Blender, no 3D, no imported assets, no audio files. Art stays procedural
canvas (`draw.js` + particles), audio stays synthesized (`audio.js`). That
material is parked for a future, different project — bringing it here would
replace this game's identity rather than grow it.

---

Practices 1–2 adapted from a workflow post:
https://www.reddit.com/r/aigamedev/comments/1vrj2cl/comment/p4fp0n2/

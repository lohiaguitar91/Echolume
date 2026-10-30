# Reddit post — r/aigamedev (the how)

Status: ready once the checklist is done. Day 2. This is the sub whose
workflow thread became `docs/ITERATING.md`, and its readers want the process
with the failures left in, not a launch announcement. Media:
`store/media/echolume-depth19.mp4` native; depth 36 and 46 clips in comments
if anyone asks what the later chapters look like.

## Checklist

1. **Rules.** The dev environment could not fetch the sidebar. Look for a
   self-promo rule and a required flair ("Showcase", "Released" or similar).
   This sub exists for AI-built games, so disclosure is the point, not a
   risk; name the tool.
2. **The link rule.** Some AI subs want store links in a comment rather than
   the body. If so, move the two links to your first comment.
3. **Link.** Already in the body: https://apps.apple.com/us/app/echolume-sound-light/id6799615320

## Title (pick one)

1. Shipped an AI-built mobile game to the App Store. What the verification
   bot caught, what it could not, and the one rule file that kept dozens
   of sessions from drifting.
2. Three months, one canvas, zero audio files: an echolocation game built
   with Claude Code is live on iOS. Post-mortem on what humans still had to do.
3. The bot beat all 50 levels. Humans found every real bug. Shipping an
   AI-built game, honestly.

## Body

Echolume is live on iOS today. One-thumb game: you are a blind creature in a
deep-sea cave and you move by singing. Each tap pushes you and lights the
cave for a moment, and the hunters come to where you sang. Hold instead of
tap and you throw your voice somewhere else. 50 handcrafted depths, four
bosses, an endless mode. Vanilla JS, one canvas, every sound synthesized at
runtime, no audio files, no image assets, no engine.

Built with Claude Code across dozens of sessions over three months, on
Windows, on a Mac for the Xcode parts, and in cloud sessions for the
playtest rounds. Here is what actually mattered, with the failures left in.

**A rules file that only grows by scars.** The project's `CLAUDE.md` is not
a style guide; it is a list of things that cost a day. "Cap sync on Windows
rewrites the Swift package paths with backslashes and the iOS build fails;
this has bitten twice." "A warm vent pins you to the centre line, so hazards
in vent levels must hug the wall; depth 44 failed 0/7 until its last urchin
moved outward, then 7/7." "The autoplay bot is not deterministic; run 9 to
11 trials and read the pass rate." Every session reads it first and the
same mistake stopped happening twice. Decisions are tagged USER or
AI-suggested, which I took from a thread here, and an AI suggestion stays a
proposal until I promote it. That one rule is why the game still has the
design I wanted.

**A bot that proves fairness, not fun.** Before any level ships, a
headless harness drives the sim directly (no rendering, no frame timing)
and reports three things per depth: is every authored object actually
inside the cave, can the exit be reached, and does a bot that dodges thorns
and lures survive. It caught things no human playtest would: 64 motes
spawning inside urchins across 32 depths, a boss arena with a 90 px strip
along the far wall where you were immune to the bite, a boss declared on
depth 14 that contained an ordinary corridor. It is the reason I trust the
level content at all.

**What the bot cannot see.** It only taps, so it never casts, which is the
one mechanic the game is about. Its survival rate says nothing about how
casting changes difficulty for a person. Every fix that made the game
better in the last two months came from someone holding the phone:

- The depth 14 boss's telegraph was a red pie slice. A tester called it
  lame. It is bone fangs along the bite's edge with red motes drawing in
  during the windup now, and the strike is the only red fill in the game.
- Its arena was wide enough to swim past without learning the fight. The
  arena is 210 half-width against a 280 reach now: enough to dodge
  sideways, never enough to be out of range.
- Motes sitting inside hazards, in the narrow late chapters most of all.
  The setup pass now slides any mote within 46 px of an urchin along its own
  corridor. (Yes, the bot missed this for weeks: it does not need every
  mote to win, so it steered around the urchin and never noticed the mote
  inside it.)
- A depth title that clipped on narrow phones, because a centred box at
  left:50% can only shrink-wrap into the right half of the screen.

**The economy argument I lost to the data.** I wanted a hard mote quota to
pass a gate. Before building it we measured the bot's zero-effort mote
floor per depth: it swings from 6% to 67% depending on the layout. Any flat
quota is either dead noise or a wall for exactly the wrong players. So the
bank buys margin, never permission, and every gate is re-verified winnable
at zero motes before any gate change ships.

Monetization is ads after clearing depths, never after a death, and one
pay-once Remove Ads. The rewarded revive was cut after a playtest because
restarting any unlocked depth is already free, so it bought nothing. All
the placement rules live in one file and are enforced there, not at the
call sites, which is the only way they survived dozens of sessions.

https://apps.apple.com/us/app/echolume-sound-light/id6799615320
Code, including the rules file and the harness:
https://github.com/lohiaguitar91/Echolume

What I would like from this thread: if you ship with a verification bot,
what did yours miss that a person caught in five minutes? I keep a list and
I would like to make it longer.

## Replies to have ready

- **"Which model / how much did it cost?"** Claude Code on a subscription.
  Give the real number if you want; do not guess one.
- **"Did it write the game design?"** No. It proposed plenty, some of it
  shipped, all of it after I said yes; the rules file tags which was which.
  The two-verb idea, the three-star structure, and the boss counters were
  mine or came out of playtests.
- **"Is the audio really not samples?"** Not one file. WebAudio oscillators
  and noise shaped by the sim's events; the melody is built from the motes
  you collect. The clip is silent because the capture is headless; record
  one on the phone if it comes up a lot.
- **"Android?"** Next, no date.
- **"Show the harness."** `www/js/debug.js` in the repo, `verifyAll()`.
  It runs in a browser console against the dev server.
- **"How many sessions / commits?"** Say "dozens"; the repo's early history
  is not all public.

## After posting

- Two hours of replies. This thread is the one most likely to produce a
  usable process idea; write it into `CLAUDE.md` if it is good.
- Do not post the SoloDevelopment and aigamedev threads on the same day.

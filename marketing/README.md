# Echolume launch posts — the plan

Echolume went live on the App Store on Oct 30 2026 (iPhone; Android is the
fast follow, no date). This folder is the Reddit launch, written the way
`RugTown/marketing/` was: one file per subreddit, each with titles to pick
from, a body in your voice, the sub's rules as we last knew them, the AI
disclosure decision, and the replies to have ready. Nothing here is
scheduled; you post by hand, one sub per day.

## Fill these in before anything goes out

- The App Store link is in every file:
  https://apps.apple.com/us/app/echolume-sound-light/id6799615320
  (store name "Echolume - Sound & Light").
- The start date. The repo's notes begin Aug 9 2026 ("end of a long Windows
  session"), so the posts say "about three months". Correct it if you started
  earlier.
- Whether this is your first App Store release. The posts never say "first";
  add it if it is true, because that word does well on r/SoloDevelopment.
- The length of a playthrough. Answer "how long is it" from your own run,
  not from the par times; the posts leave the number out.
- Whether to link the repo. `github.com/lohiaguitar91/Echolume` is public and
  its README already says the game was built with an AI coding assistant, and
  every commit carries the trailer. On the dev subs the public code is the
  credential; on player subs nobody will click it. The drafts link it only on
  r/aigamedev, r/ClaudeAI and r/SoloDevelopment.

## Media

`store/media/` has four clips captured from the game itself by
`scripts/capture-clip.js`, same pipeline as the store screenshots (headless
Chromium driving the sim two fixed steps per frame, so the gameplay is
deterministic and nothing is staged; the player is the verification bot with
a slower tap cadence and one scripted cast):

| file | what it shows | use |
|---|---|---|
| `echolume-depth19.mp4` / `.gif` | The Trench: hunters, a baited lure, one thrown voice pulling a hunter off the path | **lead clip** for every post |
| `echolume-depth46.mp4` / `.gif` | The Warm Dark: warm vents and the red-shifted finale palette | the beauty shot; second clip or the comment |
| `echolume-depth36.mp4` | The Hush: hush zones swallowing song, ice crystals | r/aigamedev / r/IndieDev if they ask for more |
| `echolume-depth5.mp4` | The Shallows: the calmest read of the two verbs | r/playmygame, where people want to see the first minute |

The `.mp4` files are 720 px wide, 30 fps, 8 to 9 seconds each (1 to 4 MB).
The two `.gif` files are 360 px wide at 15 fps so they fit in a comment; make
a bigger one from the frames with `scripts/capture-clip.js` if a sub wants it.

Post the `.mp4` as a **native Reddit video** (not a link); the `.gif` is the
fallback for subs that prefer GIFs and for comments. Reddit lets you choose
the thumbnail frame: pick one with the cyan ring mid-bloom, not the dark
opening frame. The six store screenshots in `store/screenshots/` work as a
gallery post where video is not allowed; 01 and 04 are the strongest.

The clips are silent. The sound is half the game and no clip here carries
it; if you can, record 20 seconds on the phone with the volume up and post
that instead of, or after, the headless clip. Mention the sound in the body
either way.

## Order and cadence

One sub per day, each with its own framing. Never the same clip in two subs
on the same day.

1. **r/SoloDevelopment** (`reddit-solodevelopment.md`). Shipping is the
   story and the sub is built for it. The post does not mention Rug Town;
   this launch stands on its own.
2. **r/aigamedev** (`reddit-aigamedev.md`). The sub where the workflow in
   `docs/ITERATING.md` came from. The how is the whole post; the honest
   details about what the bot could not catch are what they want.
3. **r/ClaudeAI** (`reddit-claudeai.md`). Low risk any day; it may have to
   go in the showcase megathread (see the file's rule notes).
4. **r/IndieDev** (`reddit-indiedev.md`). GIF-first, dev-and-player mix.
5. **r/playmygame** (`reddit-playmygame.md`). Any day; small, built for this.
6. **r/iosgaming** (`reddit-iosgaming.md`). **Developer self-promotion was
   suspended there in Oct 2026**, Saturdays included, while the mods rewrote
   the rules. Check the sidebar; the draft is ready for when it comes back.

Stay for the first two hours of each post and reply to everything. Copy the
useful comments into the Echolume tab of the playtest doc; the thread is the
next round of feedback, same as Rug Town's thread was the toybox research.

## Things the Rug Town posts taught, carried over

- Lead with the question, not the pitch, on the stricter subs.
- Do not promise dates. "Android is next" is the entire Android answer.
- Decide the AI disclosure line per sub **after** reading that sub's current
  rule. Where disclosure is required it is not optional; where AI-assisted
  projects are banned outright, skip the sub rather than argue in comments.
  Every file carries the same line so the story is identical everywhere.
- Native video upload, never a YouTube link. On old Reddit a video post has
  no body field: post the video with the title and put the body as your own
  first comment, immediately.
- Pick a flair every time; flairless posts get auto-removed on most of these.

## The disclosure line (identical in every file)

> Solo, built with Claude Code doing most of the typing. I directed it,
> playtested it, and made the calls. No generated art and no generated
> audio: everything on screen is drawn in code and every sound is
> synthesized while you play.

## Facts the posts rely on (so every reply says the same thing)

- 50 handcrafted depths, four chapters (Shallows, Trench, Hush, Warm Dark),
  four bosses, plus the endless Abyss. Every seventh depth is a gate.
- Two verbs: tap to sing (move + light + noise, welded together); hold and
  release to throw your voice (the song blooms where you aimed and the
  hunters turn there, it moves you nowhere and costs a full song).
- Three stars per depth: reach the vent, stay under the song budget, gather
  every mote. Chapters open on the first two; the mote star is never a toll.
- Audio is synthesized at runtime in WebAudio. There is not one audio file in
  the app. Art is procedural canvas; the icon and the store screenshots were
  rendered from the same code.
- Vanilla JS, about 7,600 lines across 20 modules, no engine, no bundler, no
  build step. Capacitor wraps it for iOS. Progress stays on the phone; no
  accounts, no server.
- Free. An interstitial after clearing depths, never after a death. One
  pay-once Remove Ads purchase. No currency, no energy, no level packs. The
  revive ad was cut after a playtest because restarting is already free.
- Game Center leaderboard and 15 achievements for the Abyss. Haptics,
  reduced motion and high contrast options.
- iPhone only today. Android next, no date.
- Every one of the 50 depths is verified by an autoplay bot before it ships
  (placement, reachability, and whether a bot that dodges the obvious
  survives), run as pass rates over 9 to 11 trials because hunter wander is
  random. The bot only taps, so it proves nothing about how casting feels.

## Promo codes

The app is free, so app codes mean nothing, but App Store Connect issues up to
100 promo codes per in-app purchase per version. A handful of Remove Ads codes
in the comments is the one giveaway that fits r/iosgaming's culture and costs
nothing. Decide before posting, not in the thread.

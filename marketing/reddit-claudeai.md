# Reddit post — r/ClaudeAI (showcase)

Status: ready once the checklist is done. Day 3, or any quiet day. Low risk,
large audience, and the sub's rules are specific about what a showcase must
contain, so the body is structured to satisfy them in the first four
sentences. Media: `store/media/echolume-depth19.mp4` native (or the depth 46
clip as a second image in a gallery if video is not allowed in the
megathread).

## Checklist

1. **Rule 7 (Showcase), as of the last snapshot we could find:** a showcase
   must say (a) that you built it, (b) that Claude or Claude Code was
   involved, (c) clearly what it is, and (d) how Claude helped. Posts
   missing any of the four get removed by the bot. The body below leads with
   all four.
2. **Megathread or front page.** Project showcases go in the pinned "Built
   with Claude" megathread unless the account has at least 50 total karma,
   in which case a front-page post with the showcase flair is allowed.
   Check u/MyTech_Vibes's karma; if under 50, post the body as a comment in
   the megathread and skip the title.
3. **Flair.** The showcase flair, exactly; the bot deletes other intents
   under it.
4. **Link.** Already in the body: https://apps.apple.com/us/app/echolume-sound-light/id6799615320

## Title (front page only; pick one)

1. I built and shipped a mobile game with Claude Code. It is on the App
   Store today. Here is what Claude did and what it could not do.
2. Three months with Claude Code, one canvas, zero audio files: my
   echolocation game is live on iOS
3. Shipped: a game where you move by singing, built with Claude Code. The
   bot it wrote beat every level; the bugs that mattered it never saw.

## Body

I built Echolume, a one-thumb iOS game, with Claude Code doing most of the
typing over about three months, and it went live on the App Store today.
You play a small blind creature in a deep-sea cave who moves by singing:
every tap pushes you through the water and lights the cave for a moment,
and the hunters swim toward where you sang. Hold instead of tap and you
throw your voice somewhere else to send them the wrong way. 50 handcrafted
depths, four bosses, an endless mode, free with one pay-once Remove Ads.

How Claude helped, concretely:

- **Wrote the game.** Vanilla JS on one canvas, about 7,600 lines, no
  engine. Also the Capacitor wrapper, the Game Center bridge in Swift, the
  StoreKit purchase plugin and the AdMob integration. Nearly all of the
  code is Claude's.
- **Wrote its own tests.** The most useful thing in the project is a
  headless autoplay bot Claude built on day one: it drives the simulation
  directly and reports, for every level, whether each object is actually
  inside the cave, whether the exit is reachable, and whether a bot that
  dodges the obvious survives. It caught 64 collectibles spawning inside
  hazards across 32 levels and a boss arena with an immune strip along one
  wall.
- **Synthesized the sound.** There is not one audio file in the app. Every
  song, echo, melody and heartbeat is WebAudio generated from what the sim
  is doing. I would not have attempted that by hand.
- **Rendered the store assets.** Icon, splash, the six screenshots and the
  achievement art are all drawn by the game's own code through headless
  Chromium. No image files were made in an editor.
- **Kept itself honest across sessions.** The project's CLAUDE.md is a list
  of rules that each cost a day, written by the session that paid for it:
  "cap sync on Windows corrupts the Swift package paths", "run the bot 9 to
  11 times and read the pass rate, it is not deterministic", "every gate
  must stay winnable at zero collectibles". Dozens of sessions later the
  same mistake has not happened twice.

What it could not do, and what I did:

- Play it. The bot only taps, so it never uses the throw-your-voice
  mechanic, which is the game. Every change that made the game better in
  the last two months came from a human with the phone in hand: a boss
  telegraph that looked like a pie chart, a level title clipped on narrow
  phones, an economy idea I wanted that the bot's own numbers talked me out
  of.
- Decide. Claude proposed constantly. Each proposal stayed a proposal until
  I said yes, and the rules file tags decisions USER or AI-suggested so a
  later session never mistakes a suggestion for a requirement. The two
  verbs, the three stars, and "no currency, no energy, no packs" are mine.
- The Mac. Xcode, signing, TestFlight, App Store Connect's forms, the IAP
  review screenshot it rejected twice: all human, with Claude writing the
  checklist and me doing the clicking.

Workflow, in case it is useful: playtest notes go in a shared doc, a cloud
session reads the section, implements, verifies headlessly (the bot plus a
Playwright script for layout at 320 px), and merges. Anything visual gets
reviewed as before-and-after screenshots, not as a diff.

https://apps.apple.com/us/app/echolume-sound-light/id6799615320
Code, including the CLAUDE.md and the bot:
https://github.com/lohiaguitar91/Echolume

Happy to answer anything about the setup. The one thing I would tell anyone
starting: the rules file is the product. The code can be regenerated; the
list of things that cost a day cannot.

## Replies to have ready

- **"Which model?"** Whatever you actually used over the three months; say
  it plainly. Do not name a model you did not use.
- **"Cost?"** Real number or "a subscription". Never an estimate dressed up
  as a fact.
- **"Can I see the CLAUDE.md?"** It is in the repo root. Point at the
  "learned the hard way" sections.
- **"Did you need to know how to code?"** Honest answer about your
  background in one sentence. The useful part: knowing what to ask for and
  being able to tell a real fix from a plausible one mattered more than
  typing.
- **"Android?"** Next, no date.
- **"How do you stop it from breaking things?"** The bot before every merge,
  pass rates not single runs, screenshots before and after any drawing
  change compared by a fresh session that is not told which is newer.

## After posting

- The megathread gets fewer eyes but no removals. If it goes there, link
  the comment from your profile and leave it.
- Reply for two hours. Process questions here tend to be specific; the good
  ones are worth a line in `docs/ITERATING.md`.

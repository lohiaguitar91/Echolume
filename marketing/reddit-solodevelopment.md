# Reddit post — r/SoloDevelopment (launch)

Status: ready to paste once the checklist is done. Day 1 of the launch.
Audience: other solo devs, some of whom saw the Rug Town prototype here in
October. The story is shipping, and the how earns the body. Media:
`store/media/echolume-depth19.mp4` as a native video upload; the depth 46
clip in your first comment.

## Checklist, 60 seconds on the sub before posting

1. **Flair.** The sub's flair for a finished game is usually "Game" or
   "Release"; if there is a "Marketing" flair for trailers, that is the one
   for a clip-led post. Never post flairless.
2. **Solo rule.** One person does the core development; tools and outside
   help are fine. Say it in one line; it is the credential there.
3. **AI rule.** Read it the day you post. The disclosure paragraph below is
   in the body by default. If the sub requires disclosure, it stays. If the
   sub bans AI-assisted projects outright, this is the wrong sub; do not
   argue it in comments.
4. **Account continuity.** The opening line assumes the Rug Town post was
   made from this account (u/MyTech_Vibes). Delete it if not.
5. **Video + body.** New Reddit lets a video post carry text; old Reddit
   does not. If there is no body field, post the video with the title and
   put the body as your own first comment, immediately.
6. **Link.** Replace `<APP STORE LINK>`.

## Title (pick one)

1. Shipped. Three months, no engine, no audio files: a one-thumb game where
   you move by singing and the dark listens back. Live on iOS today.
2. Solo dev: my echolocation game is on the App Store. Every sound in it is
   synthesized while you play, and every tap that moves you also tells the
   hunters where you are.
3. The thing I learned shipping a 50-level mobile game alone: a bot that
   beats every level tells you nothing about whether the level is fun.

## Body

Some of you saw my Rug Town prototype here a few weeks ago. This is the
other project, the one that was already in review, and as of today it is
live.

**Echolume** is a one-thumb game about a small blind creature in a deep-sea
cave. You move the only way it knows how: by singing. Every tap is a song.
It pushes you through the water and, for a moment, lights the cave around
you. But the deep listens back, and the hunters swim toward the last place
you sang. So the second verb is holding instead of tapping: you throw your
voice, the song blooms where you aimed, and everything with ears turns
there instead of toward you. It moves you nowhere and it costs a full song,
which is what makes it a decision.

50 handcrafted depths across four chapters, four bosses that each want a
different counter, and an endless mode after that. Free, an ad after you
clear a few depths and never after a death, and one pay-once purchase to
remove them. No currency, no energy, no packs.

The how, since this is the sub for it: vanilla JS on one canvas, about
7,600 lines, no engine, no bundler, no build step. There is not a single
audio file in the app. The cave echoes your voice, the motes you collect
build a melody, and your heartbeat speeds up when something is near, all
synthesized at runtime from what the sim is doing. The art is the same
story: everything is drawn in code, including the icon and the store
screenshots, which are rendered from the game itself through headless
Chromium.

Solo, built with Claude Code doing most of the typing. I directed it,
playtested it, and made the calls. No generated art and no generated audio:
everything on screen is drawn in code and every sound is synthesized while
you play.

The thing I would do again: every one of the 50 depths is checked by an
autoplay bot before it ships. Is every object actually inside the cave, can
the exit be reached, does a bot that dodges the obvious survive. It caught
dozens of placement bugs I would never have found by hand, including 64
motes sitting inside urchins across 32 levels. The thing I learned the hard
way: the bot clears a level and it still tells you nothing about whether a
human will enjoy it. The bot only taps, so it never casts, which means it
never experiences the one mechanic the game is about. Every real fix in the
last two months came from a person with the phone in their hand: a boss
telegraph that read as a pie chart, a title that clipped on narrow phones,
a star I had cut and had to put back.

iPhone only today; Android is next.

<APP STORE LINK>

Code is public if you want to see how any of it works:
https://github.com/lohiaguitar91/Echolume

Question for the solo devs: how do you decide a level is done when you are
the only tester? I ended up trusting a bot for fairness and strangers for
fun, and I am not sure that split is right.

## Replies to have ready

- **"What engine?"** None. Vanilla JS, one 2D canvas, a few hundred lines
  of renderer. Capacitor wraps the web build for iOS. No build step: the
  dev server is a static file server.
- **"Is this AI?"** The paragraph in the body is the answer. Say it plainly
  again; never hedge. If they want detail: the design calls, the playtests
  and the tuning were human; the typing was mostly not.
- **"Android when?"** Next. No date. Do not be talked into one.
- **"Why free with ads and not paid?"** Because a paid atmospheric mobile
  game from nobody sells about nothing, and this way everyone gets all 50
  depths. The ad rules are strict on purpose: after wins only, never after a
  death, and a single purchase ends them for good.
- **"This is Dark Echo."** Dark Echo (2015) is the obvious comparison and a
  great game. Play ten minutes of it before posting so the reply is honest.
  The difference: in Dark Echo you are a pair of footsteps and sound is a
  tool; in Echolume you are the light source and the song is also your only
  way to move, so seeing, moving and being heard are one gesture and you
  cannot do one without the others. Casting splits them apart, once.
- **"How long is it?"** Your own number from a real playthrough, plus the
  Abyss.
- **"Web version?"** No. The repo runs locally with `npm run dev` if someone
  really wants to try it on a laptop, but say it is tuned for a thumb.
- **"How did the bot miss X?"** Honest answer: it taps every 0.28 s toward
  the path and dodges thorns and lures. It is a fairness floor, not a
  player. Anything about feel, telegraphs or the cast is human territory.

## After posting

- Stay two hours, reply to everything, including the ones that are only a
  comparison to another game.
- Do not crosspost the same clip anywhere else today.
- Copy the comments worth keeping into the Echolume tab of the playtest doc.

# Reddit post — r/SoloDevelopment (launch)

Status: ready to paste once the checklist is done. Day 1 of the launch.
Audience: other solo devs. The story is shipping, and the how earns the body. Media:
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
4. **Video + body.** New Reddit lets a video post carry text; old Reddit
   does not. If there is no body field, post the video with the title and
   put the body as your own first comment, immediately.
5. **Link.** Already in the body: https://apps.apple.com/us/app/echolume-sound-light/id6799615320

## Title (pick one)

1. Shipped. Three months, no engine, no audio files: a one-thumb game where
   you move by singing and the dark listens back. Live on iOS today.
2. Solo dev: my echolocation game is on the App Store. Every sound in it is
   synthesized while you play, and every tap that moves you also tells the
   hunters where you are.
3. The thing I learned shipping a 50-level mobile game alone: a bot that
   beats every level tells you nothing about whether the level is fun.

## Body

Written by hand on Oct 30; this is the one to paste. Blank lines between the
paragraphs are deliberate: a single newline does not break a paragraph on
Reddit.

Echolume went live on the App Store today. It is a one-thumb game that pairs
something I find pleasure in, drifting slowly in water, with one of my fears,
cave diving (I scuba dive, and avoid caverns like the plague)

You play a small blind creature in a deep-sea cave, and the only way to move
is to sing. Tap, and the sound pushes you through the water and lights up the
walls around you for a second. The catch is that the hunters hear it too, and
they swim to wherever you sang last.

I wanted to see if I could build it mostly using vanilla JS. With Claude's
help, apparently that was possible. All art and motion is JS, and the thing
I'm most proud of: there are no audio files! All sound is from WebAudio
primitives: oscillators, filters and gain envelopes.

Placement needed its own test harness, because I had like 200+ playthroughs
where I was catching random objects outside of the "cavern walls". So now
there's automation that goes through every level to validate placement
before a new build.

I hope you like it! Free on the iOS App Store (with ads because I like to eat)

https://apps.apple.com/us/app/echolume-sound-light/id6799615320

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

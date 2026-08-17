// App shell: owns screens, loop, and wiring between game logic and
// renderer/audio/haptics/save/UI.

import { PALETTE, PALETTE_CONTRAST, TUNING, GAME_VERSION, chainStyle } from './config.js';
import { Renderer } from './renderer.js';
import { Particles } from './particles.js';
import { Input } from './input.js';
import { AudioEngine } from './audio.js';
import { Haptics } from './haptics.js';
import { Save } from './save.js';
import { UI } from './ui.js';
import { Game, starBreakdown, starTargets } from './game.js';
import { GameServices, MILESTONES } from './gameservices.js';
import { Ads } from './ads.js';
import {
  getLevel, LEVELS, parTime, chapterOf,
  gateKind, gateSpan, gateCapacity, gateBoon, gateBoonLine,
} from './levels.js';
import { drawGame, drawMenuAmbient } from './draw.js';
import { installDebug } from './debug.js';
import { clamp } from './util.js';

const $ = (id) => document.getElementById(id);

class Shell {
  constructor() {
    this.canvas = $('game');
    this.renderer = new Renderer(this.canvas);
    this.particles = new Particles();
    this.audio = new AudioEngine();
    this.haptics = new Haptics();
    this.save = new Save();
    this.gs = new GameServices(this.save);
    this.ads = new Ads(this.save);   // inert until AD_IDS are filled in
    this.ui = new UI();
    this.input = new Input(this.canvas);
    this.palette = PALETTE;

    this.state = 'title';          // title | levels | settings | about | playing | paused | results | gameover | credits
    this.currentLevelId = 1;
    this.time = 0;
    this.fps = 60;
    this.debugTimeScale = 1;
    this._last = performance.now();
    this._acc = 0;
    this._settingsReturn = 'title';
    this._resetArmed = false;
    this._checkpoint = null;       // banked lair mouth, boss levels only

    this.game = new Game(this._gameCallbacks());

    this._applySettings();
    this._wireUI();
    this._wireInput();
    this._wireLifecycle();
    this.ui.setVersion(GAME_VERSION);
    // Cold open: the very first launch fades straight into the water. The
    // story is a caption, the first tap is the tutorial, and no screen stands
    // between a new player and the game.
    if (!this.save.data.aboutSeen) {
      this.save.data.aboutSeen = true;
      this.save.data.tutorialSeen = true;
      this.save.persist();
      this.startLevel(1, { silent: true });
      this.ui.toast('A small blind creature of the deep', 3600);
    } else {
      this._show('title');
    }
    // No-op while AD_IDS are null, so this is safe to ship dormant.
    this.ads.init();
    // Debug/test API only in plain-web dev, never in shipped native builds.
    if (!window.Capacitor) installDebug(this);

    requestAnimationFrame((t) => this._frame(t));
  }

  // ---- game callbacks ----
  _gameCallbacks() {
    return {
      onPing: (dirY) => {
        this.audio.ping(dirY);
        this.haptics.tick();
        this.ui.setPings(this.game.ents.player.pings);
      },
      onMote: (combo, x, y) => {
        this.audio.mote(combo);
        this.haptics.collect();
        const p = this.game.ents.player;
        this.ui.setMotes(p.motes, this.game.mode === 'abyss' ? 0 : this.game.ents.motes.length);
        const chain = chainStyle(this.game.chainDisplay);
        this.particles.burst(x, y, chain.accent, 10 + Math.min(combo, 8), 90, 0.7, 3, chain.accentCore);
      },
      onChainBloom: (combo, x, y) => {
        this.audio.chainBloom();
        this.haptics.warn();
        const chain = chainStyle(this.game.chainDisplay);
        this.particles.burst(x, y, chain.accent, 26, 170, 1.1, 3.4, chain.accentCore);
        this.renderer.addShake(0.12);
        this.ui.toast(`×${combo} bloom`, 1500);
      },
      onDamage: (hearts, sx, sy) => {
        this.audio.damage();
        this.haptics.damage();
        this.ui.setHearts(hearts, TUNING.maxHearts);
        this.ui.loseHeartFx();
        this.ui.setDangerLow(hearts === 1);
        this.renderer.addShake(0.55);
        this.particles.burst(sx, sy, this.palette.hunterAlert, 14, 150, 0.6, 3.2);
      },
      onDeath: () => {
        this.ui.setDangerLow(false);
        this.audio.duck(3.2);
        this.audio.death();
        this.renderer.addShake(0.9);
        const p = this.game.ents.player;
        this.particles.burst(p.x, p.y, this.palette.player, 26, 190, 1.1, 3.4, '#ffffff');
        this.input.setActive(false);
      },
      onDeathDone: (stats) => {
        if (this.game.mode === 'abyss') {
          // Read the old best before the save overwrites it.
          const prevBest = this.save.data.abyssBestDepth;
          const isRecord = stats.depth > prevBest;
          this.save.abyssResult(stats.depth);
          this.gs.submitDepth(stats.depth);
          this.ui.fillAbyssRecap(stats, {
            prevBest,
            isRecord,
            milestonesThisRun: this.game.abyss.milestonesFired.size,
            nextMilestone: MILESTONES.find((m) => m > stats.depth) || null,
            canShowLeaderboard: this.gs.canShowLeaderboard(),
          });
          this._show('abyssrecap');
          if (isRecord) {
            setTimeout(() => { this.audio.star(3); this.haptics.success(); }, 420);
          }
          return;
        }
        // A failed run still proves what you gathered — keep the haul.
        if (this.game.def) this.save.levelAttempt(this.game.def.id, stats);
        this.ui.fillGameover(this.game.mode, stats, {
          fromCheckpoint: this._checkpointFor(this.currentLevelId) !== null,
        });
        this._show('gameover');
        // Never an interstitial here. The only ad a death may ever produce is
        // a revive the player chooses, offered once, at a boss.
        const dead = this.game.def;
        if (dead && gateKind(dead.id) === 'boss') {
          this.ads.offerRevive({ isBoss: true }).then((took) => {
            if (took) this.startLevel(dead.id, { fromCheckpoint: true, skipGate: true });
          });
        }
      },
      onWin: (stats) => {
        this.input.setActive(false);
        this.ui.setDangerLow(false);
        this.audio.duck(3.0);
        this.audio.win();
        this.haptics.success();
        const v = this.game.ents.vent;
        this.particles.burst(v.x, v.y, this.palette.vent, 30, 160, 1.3, 3.2, this.palette.ventCore);
        const def = this.game.def;
        const breakdown = starBreakdown(def, stats);
        const stars = breakdown.count;
        this.save.levelResult(def.id, stars, stats);
        if (def.id >= 7) this.save.unlockAbyss();
        if (def.finale) {
          this.save.unlockAbyss();
          setTimeout(() => this._show('credits'), 1400);
        } else {
          setTimeout(() => {
            this.ui.fillResults(def.name, stars, stats, {
              hasNext: !!getLevel(def.id + 1),
              def,
              record: this.save.data.levels[def.id],
              breakdown,
              chapterEnd: def.chapterEnd ? chapterOf(def.id).name : null,
            });
            this.ui.fillLightBank(this.save, def.id);
            for (let i = 0; i < stars; i++) {
              setTimeout(() => this.audio.star(i + 1), 780 + i * 380);
            }
            this._show('results');
            // The only interstitial in the game, and only ever here: a gate you
            // just cleared. Dormant until ad ids exist; the rule lives in
            // ads.js so it holds no matter who calls it.
            this.ads.maybeInterstitial({ won: true, isGate: !!gateKind(def.id) });
          }, 900);
        }
      },
      onMilestone: (m) => {
        if (!this.gs.unlock(m)) return; // already earned in a past run
        this.audio.star(3);
        this.haptics.success();
        const p = this.game.ents.player;
        this.particles.burst(p.x, p.y, this.palette.vent, 24, 150, 1.2, 3.2, this.palette.ventCore);
        this.ui.toast(`${m.toLocaleString()} m`, 2200);
        this.ui.hint(`Milestone: ${this.gs.unlockedCount()}/${this.gs.totalCount()} depths sung.`, 3000);
      },
      onLureSnap: (x, y) => {
        this.audio.lureSnap();
        this.haptics.warn();
        this.renderer.addShake(0.3);
        this.particles.burst(x, y, this.palette.lure, 16, 170, 0.7, 3.2, this.palette.lureCore);
      },
      onCrystalBloom: (x, y) => {
        this.audio.crystalBloom();
        this.particles.burst(x, y, this.palette.crystal, 18, 140, 1.0, 3, this.palette.crystalCore);
      },
      onHeartMote: (hearts, x, y) => {
        this.audio.heartMote();
        this.haptics.success();
        this.ui.setHearts(hearts, TUNING.maxHearts);
        this.ui.setDangerLow(hearts === 1);
        this.particles.burst(x, y, this.palette.heart, 22, 140, 1.1, 3.2, this.palette.heartCore);
        this.ui.hint('The beating light mends you.', 2400);
      },
      // Breaking ice is not damage, so it gets no red flash — but it is the
      // loudest mistake available, so it gets the shake and the warning buzz.
      onIceBreak: (x, y) => {
        this.audio.iceBreak();
        this.haptics.warn();
        this.renderer.addShake(0.28);
        this.particles.burst(x, y, this.palette.ice, 20, 190, 0.8, 3, this.palette.iceCore);
      },
      onSilentSong: () => this.haptics.tick?.(),
      onLeviathanWake: () => {
        this.audio.leviathanWake();
        this.haptics.warn();
        this.renderer.addShake(0.35);
      },
      onCheckpoint: () => {
        this._checkpoint = { levelId: this.game.def.id, snap: this.game.checkpoint };
        this.ui.toast('The lair mouth remembers you', 2400);
      },
      onAllMotes: (x, y) => {
        this.audio.allMotes();
        this.haptics.success();
        this.particles.burst(x, y, this.palette.mote, 22, 130, 1.1, 3, this.palette.moteCore);
        this.ui.hint('Every mote gathered.', 2800);
      },
      onHint: (text, plain) => this.ui.hint(text, undefined, plain),
      onThud: (i) => {
        this.audio.thud(i);
        this.renderer.addShake(0.12 + i * 0.15);
      },
      onAlert: () => {
        this.audio.alert();
        this.haptics.warn();
      },
    };
  }

  // ---- screens ----
  _show(name) {
    this.state = name;
    this.ui.show(name === 'playing' ? 'hud' : name);
    this.input.setActive(name === 'playing');
    if (name === 'levels') {
      this.ui.buildLevelGrid(this.save, (id) => this.startLevel(id));
    }
    if (name === 'title') {
      this.ui.refreshAbyssButton(this.save);
      this._refreshTitle();
    }
    const inGame = name === 'playing' || name === 'paused';
    if (!inGame) {
      this.ui.setDangerLow(false);
    } else if (this.game.ents && !this.game.ents.player.dead) {
      // Re-derive the last-heart vignette when returning from settings.
      this.ui.setDangerLow(this.game.ents.player.hearts === 1);
    }
    document.body.classList.toggle('in-game', inGame);
  }

  // Title front door: Continue chip + one concrete next goal.
  _refreshTitle() {
    const hasProgress = this.save.hasProgress();
    const next = this.save.nextDepth(LEVELS.length);
    this.ui.setContinueChip(hasProgress ? `Continue · Depth ${next}` : 'Dive', hasProgress);
    this.ui.setMicroGoal(this._microGoal());
  }

  // Picks the nearest un-earned thing worth chasing.
  _microGoal() {
    for (const lvl of LEVELS) {
      if (!this.save.isUnlocked(lvl.id)) continue;
      const rec = this.save.data.levels[lvl.id];
      if (!rec || rec.stars >= 3) continue;
      const total = UI.moteTotal(lvl);
      const need = Math.ceil((lvl.stars?.motePct || 1) * total);
      if (rec.bestMotes < need) {
        const gap = need - rec.bestMotes;
        return `Depth ${lvl.id} · <span class="accent">${gap} more mote${gap === 1 ? '' : 's'}</span> for its second star`;
      }
      const maxPings = lvl.stars?.maxPings;
      if (maxPings && rec.bestPings > maxPings) {
        return `Depth ${lvl.id} · finish in <span class="accent">${maxPings} songs</span> for its third star`;
      }
      const par = parTime(lvl.id);
      if (par && rec.bestTime > par) {
        return `Depth ${lvl.id} · beat <span class="accent">${par}s</span> for its trench medal`;
      }
    }
    if (this.save.data.abyssUnlocked) {
      const best = this.save.data.abyssBestDepth;
      const next = MILESTONES.find((m) => m > best);
      if (next) {
        return `The Abyss · <span class="accent">${(next - best).toLocaleString()} m</span> to your next milestone`;
      }
    }
    const stars = this.save.totalStars();
    if (stars > 0) return `<span class="accent">${stars}</span> of ${LEVELS.length * 3} stars gathered`;
    return null;
  }

  // ---- level flow ----
  // The banked lair mouth for a level, or null if there isn't one.
  _checkpointFor(id) {
    return this._checkpoint && this._checkpoint.levelId === id ? this._checkpoint.snap : null;
  }

  // A gate stops you at the door once, to say what your light bought. Resuming
  // from a checkpoint skips it — you already made that choice on the way in.
  startLevel(id, opts = {}) {
    const def = getLevel(id);
    if (!def) return;
    if (gateKind(id) && !opts.fromCheckpoint && !opts.skipGate && !opts.silent) {
      this._pendingGate = id;
      const boon = this._boonFor(id);
      this.ui.fillGate(def, boon);
      this.ui.setGateBuys(gateBoonLine(boon));
      this._show('gate');
      return;
    }
    const resume = opts.fromCheckpoint ? this._checkpointFor(id) : null;
    if (!resume) this._checkpoint = null;
    this.currentLevelId = id;
    this.particles.clear();
    this.ui.clearHints();
    // Each depth sings in its own key (D, E, F, G rotation), and each chapter
    // in its own mode — the trench is audibly flatter than the shallows.
    this.audio.setRoot([293.66, 329.63, 349.23, 392.0][(id - 1) % 4]);
    this.audio.setMode(chapterOf(id).mode);
    this.game.startStory(def, resume, this._boonFor(id));
    const p = this.game.ents.player;
    this.renderer.cam.x = this.renderer.cam.targetX = p.x;
    this.renderer.cam.y = this.renderer.cam.targetY = p.y;
    const moteTotal = this.game.ents.motes.length;
    const targets = starTargets(def, moteTotal);
    this.ui.setLevelName(`${id} · ${def.name}`);
    this.ui.setHearts(p.hearts, TUNING.maxHearts);
    // No mote threshold any more: every mote banks, so the counter is a tally
    // of what this depth holds rather than a bar to clear.
    this.ui.setMoteGoal(0);
    this.ui.setMotes(p.motes, moteTotal);
    this.ui.setPings(p.pings);
    this.ui.hideDepth();
    this._show('playing');
    if (!opts.silent) {
      this.ui.toast(resume ? 'The lair mouth' : `Depth ${id} · ${def.name}`);
      this.ui.showGoals(targets.motes, targets.pings);
    }
  }

  // What the seven depths behind a gate are worth right now. Null everywhere
  // else, so an ordinary depth plays exactly as it always did.
  _boonFor(id) {
    if (!gateKind(id)) return null;
    const { from, to } = gateSpan(id);
    return gateBoon(id, this.save.moteBank(from, to), gateCapacity(id));
  }

  startAbyss() {
    this.gs.signIn(); // fire-and-forget; platform prompts once if available
    // First descent gets the explainer; after that, straight down.
    if (!this.save.data.abyssIntroSeen) {
      const el = $('abyss-milestones');
      if (el) el.textContent = `${this.gs.unlockedCount()}/${this.gs.totalCount()}`;
      this._show('abyssintro');
      return;
    }
    this._startAbyssNow();
  }

  _startAbyssNow() {
    this.gs.signIn();  // no-op if already in, or if there's no native bridge
    this.particles.clear();
    this.ui.clearHints();
    this.audio.setRoot(293.66);      // the Abyss sings in D,
    this.audio.setMode('shallows');  // in the shallows' own mode
    this.game.startAbyss(1 + Math.floor(Math.random() * 100000));
    const p = this.game.ents.player;
    this.renderer.cam.x = this.renderer.cam.targetX = p.x;
    this.renderer.cam.y = this.renderer.cam.targetY = p.y;
    this.ui.setLevelName('The Abyss');
    this.ui.setHearts(p.hearts, TUNING.maxHearts);
    this.ui.hideGoals();
    this.ui.setMoteGoal(0);   // no star to earn down here; just a running tally
    this.ui.setMotes(0, 0);
    this.ui.setPings(0);
    this.ui.setDepth(0);
    this._show('playing');
    this.ui.toast('The Abyss');
    this.ui.hint('No vent below. Only the deep, and how far you dare to sing into it.');
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this._show('paused');
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this._show('playing');
  }

  // ---- wiring ----
  _wireUI() {
    const click = (id, fn) => $(id).addEventListener('click', () => { this.audio.ui(); fn(); });

    click('btn-play', () => {
      // Returning players go straight back in; the grid is one link away.
      if (this.save.hasProgress()) {
        this.startLevel(this.save.nextDepth(LEVELS.length));
      } else {
        this._show(this.save.data.tutorialSeen ? 'levels' : 'howto');
      }
    });
    click('btn-depths', () => this._show('levels'));
    click('btn-howto', () => this._show('howto'));
    click('btn-howto-dive', () => {
      if (!this.save.data.tutorialSeen) {
        this.save.data.tutorialSeen = true;
        this.save.persist();
        this.startLevel(1);
      } else {
        this._show('levels');
      }
    });
    click('btn-abyss', () => this.startAbyss());
    click('btn-abyss-begin', () => {
      this.save.data.abyssIntroSeen = true;
      this.save.persist();
      this._startAbyssNow();
    });
    click('btn-abyss-back', () => this._show('title'));
    click('btn-gate-descend', () => {
      const id = this._pendingGate;
      this._pendingGate = null;
      if (id) this.startLevel(id, { skipGate: true });
    });
    // The only other door out of a gate: back to the levels you can re-swim.
    click('btn-gate-back', () => { this._pendingGate = null; this._show('levels'); });
    click('btn-settings', () => { this._settingsReturn = this.state; this._show('settings'); });
    click('btn-about', () => this._show('about'));
    click('btn-about-continue', () => this._show('title'));

    for (const el of document.querySelectorAll('[data-back]')) {
      el.addEventListener('click', () => {
        this.audio.ui();
        this._show(this.state === 'settings' && this._settingsReturn === 'paused' ? 'paused' : 'title');
      });
    }

    click('btn-pause', () => this.pauseGame());
    click('btn-resume', () => this.resumeGame());
    click('btn-pause-settings', () => {
      this._settingsReturn = 'paused';
      this._show('settings');
    });
    click('btn-restart', () => {
      if (this.game.mode === 'abyss') this.startAbyss();
      else this.startLevel(this.currentLevelId);
    });
    click('btn-quit', () => this._show('title'));

    click('btn-next', () => this.startLevel(this.currentLevelId + 1));
    click('btn-replay', () => this.startLevel(this.currentLevelId));
    click('btn-results-menu', () => this._show('levels'));
    click('btn-retry', () => {
      if (this.game.mode === 'abyss') this.startAbyss();
      else this.startLevel(this.currentLevelId, { fromCheckpoint: true });
    });
    click('btn-gameover-menu', () => this._show('title'));
    click('btn-recap-again', () => this._startAbyssNow());
    click('btn-recap-board', () => this.gs.showLeaderboard());
    click('btn-recap-menu', () => this._show('title'));
    click('btn-credits-abyss', () => this.startAbyss());
    click('btn-credits-menu', () => this._show('title'));

    // Settings toggles (read save.data at event time — reset swaps the object)
    const bind = (id, key, after) => {
      const el = $(id);
      el.checked = this.save.data.settings[key];
      el.addEventListener('change', () => {
        this.save.data.settings[key] = el.checked;
        this.save.persist();
        this._applySettings();
        if (after) after();
        this.audio.ui();
      });
    };
    bind('set-sound', 'sound');
    bind('set-music', 'music');
    bind('set-haptics', 'haptics', () => { if (s.haptics) this.haptics.tick(); });
    bind('set-reduced', 'reducedMotion');
    bind('set-contrast', 'highContrast');
    bind('set-visualthreat', 'visualThreat');

    // Two-tap reset (no ugly confirm())
    const resetBtn = $('btn-reset-save');
    resetBtn.addEventListener('click', () => {
      if (!this._resetArmed) {
        this._resetArmed = true;
        resetBtn.textContent = 'Tap again to erase everything';
        resetBtn.classList.add('armed');
        setTimeout(() => {
          this._resetArmed = false;
          resetBtn.textContent = 'Reset progress';
          resetBtn.classList.remove('armed');
        }, 3000);
      } else {
        this.save.reset();
        this._resetArmed = false;
        resetBtn.textContent = 'Progress erased';
        resetBtn.classList.remove('armed');
        this._applySettings();
        this._syncSettingsUI();
        setTimeout(() => { resetBtn.textContent = 'Reset progress'; }, 1600);
      }
    });
  }

  _syncSettingsUI() {
    const s = this.save.data.settings;
    $('set-sound').checked = s.sound;
    $('set-music').checked = s.music;
    $('set-haptics').checked = s.haptics;
    $('set-reduced').checked = s.reducedMotion;
    $('set-contrast').checked = s.highContrast;
    $('set-visualthreat').checked = s.visualThreat;
  }

  _applySettings() {
    const s = this.save.data.settings;
    this.audio.setEnabled(s.sound, s.music);
    this.haptics.enabled = s.haptics;
    this.renderer.reducedMotion = s.reducedMotion;
    document.body.classList.toggle('reduced-motion', s.reducedMotion);
    this.palette = s.highContrast ? PALETTE_CONTRAST : PALETTE;
    this.renderer.setPalette(this.palette);
  }

  _wireInput() {
    this.input.onFirstGesture = () => {
      this.audio.unlock();
    };
    this.input.onTap = (cx, cy) => {
      if (this.state !== 'playing') return;
      const w = this.renderer.screenToWorld(cx, cy);
      this.game.tapAt(w.x, w.y);
    };
    // New players often press-and-hold expecting to steer; teach the verb once.
    this._holdHinted = false;
    this.input.onHold = () => {
      if (this._holdHinted || this.state !== 'playing') return;
      if (this.game.mode !== 'story' || this.game.def.id !== 1) return;
      this._holdHinted = true;
      this.ui.hint('Short taps, little one. A song, not a shout.');
    };
    // Keyboard fallback (desktop testing / accessibility)
    window.addEventListener('keydown', (e) => {
      if (this.state === 'playing' && e.key === 'Escape') this.pauseGame();
      else if (this.state === 'paused' && e.key === 'Escape') this.resumeGame();
    });
  }

  _wireLifecycle() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.state === 'playing') this.pauseGame();
        this.audio.suspend();
      } else {
        this.renderer.ensureSized();
        this.audio.resume();
        this._last = performance.now();
      }
    });
    window.addEventListener('resize', () => this._checkRotate());
    this._checkRotate();
  }

  _checkRotate() {
    const bad = window.innerWidth > window.innerHeight && window.innerHeight < 420;
    this.ui.showRotate(bad);
  }

  // ---- debug hooks ----
  // The harness plays levels, not menus: a gate door would stall autoplay and
  // report a pass for a depth that never actually ran.
  debugStartLevel(id) { this.startLevel(id, { skipGate: true }); }
  debugStartAbyss() { this.startAbyss(); }
  debugShowScreen(name) { this._show(name); }

  // ---- main loop ----
  _frame(now) {
    requestAnimationFrame((t) => this._frame(t));
    let dt = (now - this._last) / 1000;
    this._last = now;
    if (dt <= 0) return;
    this._tick(dt);
  }

  // Hands off the screen in the Abyss and the walls fade out, because reveal
  // energy is decaying — which is the whole game, but a first-time player read
  // it as a rendering bug. Said once, on the first dive only, it becomes the
  // lesson instead of the doubt.
  _nudgeIfIdle(dt) {
    if (this.game.mode !== 'abyss' || this.save.data.abyssNudgeSeen) return;
    const pings = this.game.ents.player.pings;
    if (pings !== this._nudgeLastPings) { this._nudgeLastPings = pings; this._idleT = 0; return; }
    this._idleT = (this._idleT || 0) + dt;
    if (this._idleT < 4) return;
    this._idleT = 0;
    this.save.data.abyssNudgeSeen = true;
    this.save.persist();
    this.ui.hint('The dark comes back when you stop singing.',
      undefined, 'Light fades on its own. Sing to see again.');
  }

  // One update+render step. Callable directly (debug/screenshots) without
  // touching the rAF schedule.
  _tick(dt) {
    dt = Math.min(dt, TUNING.maxFrameDt);
    this.fps = this.fps * 0.95 + (1 / dt) * 0.05;
    this.time += dt;
    const R = this.renderer;

    // Keep the cave on screen behind every in-run overlay (pause, results,
    // game over, credits) — the world should never vanish mid-story.
    const overlayStates = ['playing', 'paused', 'results', 'gameover', 'credits'];
    const inGame = overlayStates.includes(this.state) && !!this.game.ents;

    if (this.state === 'playing') {
      // Fixed-step simulation with accumulator (stable under throttled rAF).
      this._acc = Math.min(this._acc + dt * this.debugTimeScale, TUNING.fixedDt * 6);
      while (this._acc >= TUNING.fixedDt) {
        this.game.update(TUNING.fixedDt);
        this._acc -= TUNING.fixedDt;
      }
      this._nudgeIfIdle(dt);
      const p = this.game.ents.player;
      R.cam.targetX = p.x + p.vx * TUNING.camLookahead;
      R.cam.targetY = p.y + p.vy * TUNING.camLookahead;
      const minDim = Math.min(R.w, R.h);
      R.cam.zoom = clamp(minDim / TUNING.zoomRefDim, TUNING.zoomMin, TUNING.zoomMax);
      R.updateCamera(dt, TUNING.camLerp);

      // Threat level for heartbeat audio
      let threat = 0;
      for (const h of this.game.ents.hunters) {
        const d = Math.hypot(h.x - p.x, h.y - p.y);
        if (d < 340) threat = Math.max(threat, 1 - d / 340);
      }
      // A leviathan is felt from much further out, and never drops below a
      // low dread while you share its room.
      for (const lv of this.game.ents.leviathans) {
        const d = Math.hypot(lv.x - p.x, lv.y - p.y);
        const R2 = TUNING.leviathanThreatRadius;
        if (d < R2) threat = Math.max(threat, 0.25 + 0.75 * (1 - d / R2));
      }
      const liveThreat = threat * (p.dead ? 0 : 1);
      this.audio.setThreat(liveThreat);
      // Danger is spoken in sound; this draws it too, for players who can't hear it.
      this.ui.setThreatVeil(this.save.data.settings.visualThreat
        ? liveThreat * (0.55 + 0.45 * Math.sin(this.time * 5.2))
        : 0);

      // Hear the world before you see it: vent shimmer + current whoosh
      const vent = this.game.ents.vent;
      let ventNear = 0;
      if (vent && this.game.state === 'play') {
        const d = Math.hypot(vent.x - p.x, vent.y - p.y);
        if (d < 360) ventNear = 1 - d / 360;
      }
      this.audio.setVentNear(ventNear);
      let currentIn = 0;
      for (const cz of this.game.ents.currents) {
        const d = Math.hypot(cz.x - p.x, cz.y - p.y);
        if (d < cz.r) currentIn = Math.max(currentIn, 1 - d / cz.r);
      }
      this.audio.setCurrentIn(currentIn);

      // Abyss HUD depth
      if (this.game.mode === 'abyss') {
        this.ui.setDepth(Math.max(0, Math.floor((p.y - this.game.abyss.startY) / TUNING.abyssDepthPerMeter)));
      }
    } else {
      this.audio.setThreat(0);
      this.audio.setVentNear(0);
      this.audio.setCurrentIn(0);
      this.ui.setThreatVeil(0);
    }

    R.begin();
    if (inGame && this.game.ents) {
      drawGame(R, this.game, this.particles, this.time,
        this.state === 'paused' ? 0 : dt, this.palette);
    } else {
      drawMenuAmbient(R, this.particles, this.time, dt, this.palette);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new Shell();
  // Service worker only outside Capacitor and only on real HTTPS deploys.
  if ('serviceWorker' in navigator && location.protocol === 'https:' && !window.Capacitor) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

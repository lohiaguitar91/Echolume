// All-synthesized WebAudio: no audio files, no licensing, tiny footprint.
// Handles the iOS unlock dance: created suspended, resumed on first gesture.

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.verb = null;
    this.verbSend = null;
    this.enabled = { sound: true, music: true };
    this.threat = 0;
    this._threatTimer = null;
    this._musicNodes = null;
    this._chordTimer = null;
    this._sparkleTimer = null;
    this._unlocked = false;
    // Melodic state: taps walk a pentatonic scale rooted per level.
    this.root = 293.66; // D4
    this._pingDegree = 3;
    this.scale = AudioEngine.SCALE;
  }

  // Minor-pentatonic ratios over the root (D F G A C, two octaves).
  static SCALE = [1, 1.2, 1.35, 1.5, 1.8, 2, 2.4, 2.7];
  // The trench sings flatter: a minor second in place of the second degree
  // sours every song sung down here. Players hear the chapter before reading it.
  static SCALE_TRENCH = [1, 1.0667, 1.3333, 1.5, 1.6, 2, 2.1333, 2.6667];

  static MODES = { shallows: AudioEngine.SCALE, trench: AudioEngine.SCALE_TRENCH };

  setRoot(freq) { this.root = freq; this._pingDegree = 3; }

  setMode(name) { this.scale = AudioEngine.MODES[name] || AudioEngine.SCALE; }

  _scaleFreq(degree, octaveMult = 1) {
    const R = this.scale;
    const d = Math.max(0, Math.min(R.length - 1, degree));
    return this.root * octaveMult * R[d];
  }

  unlock() {
    if (this._unlocked) { this._resume(); return; }
    this._unlocked = true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const c = this.ctx;

    this.master = c.createDynamicsCompressor();
    this.master.threshold.value = -18;
    this.master.knee.value = 20;
    this.master.ratio.value = 6;
    this.master.connect(c.destination);

    this.sfxGain = c.createGain();
    this.sfxGain.gain.value = 0.9;
    this.sfxGain.connect(this.master);

    this.musicGain = c.createGain();
    this.musicGain.gain.value = 0.5;
    this.musicGain.connect(this.master);

    // Cave reverb: generated noise-decay impulse.
    this.verb = c.createConvolver();
    this.verb.buffer = this._impulse(2.2, 2.6);
    const verbOut = c.createGain();
    verbOut.gain.value = 0.55;
    this.verb.connect(verbOut);
    verbOut.connect(this.master);
    this.verbSend = c.createGain();
    this.verbSend.gain.value = 1;
    this.verbSend.connect(this.verb);

    this._resume();
    this._startHeartbeat();
    this._startProximityLoops();
    if (this.enabled.music) this.startMusic();
  }

  // Continuous wayfinding loops: the vent shimmers, currents whoosh.
  // Gains are driven per-frame via setVentNear/setCurrentIn.
  _startProximityLoops() {
    const c = this.ctx;
    // vent shimmer: two soft high sines with slow tremolo, heavy reverb
    this._ventGain = c.createGain();
    this._ventGain.gain.value = 0;
    const vSend = c.createGain(); vSend.gain.value = 1.6;
    this._ventGain.connect(vSend); vSend.connect(this.verbSend);
    this._ventGain.connect(this.sfxGain);
    const v1 = c.createOscillator(); v1.frequency.value = 1318.5; // E6
    const v2 = c.createOscillator(); v2.frequency.value = 1568.0; // G6
    const vMix = c.createGain(); vMix.gain.value = 0.5;
    v1.connect(vMix); v2.connect(vMix); vMix.connect(this._ventGain);
    const trem = c.createOscillator(); trem.frequency.value = 0.9;
    const tremG = c.createGain(); tremG.gain.value = 0.35;
    trem.connect(tremG); tremG.connect(vMix.gain);
    v1.start(); v2.start(); trem.start();

    // current whoosh: looped noise through a mid bandpass
    const len = c.sampleRate * 2;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf; src.loop = true;
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 420; bp.Q.value = 0.7;
    this._currentGain = c.createGain();
    this._currentGain.gain.value = 0;
    src.connect(bp); bp.connect(this._currentGain);
    this._currentGain.connect(this.sfxGain);
    src.start();
  }

  setVentNear(v) {
    if (!this._ventGain) return;
    const target = this.enabled.sound ? v * 0.055 : 0;
    this._ventGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.25);
  }

  setCurrentIn(v) {
    if (!this._currentGain) return;
    const target = this.enabled.sound ? v * 0.16 : 0;
    this._currentGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.18);
  }

  // Deep chain bloom: a wide, breathy shimmer — the sound of light spreading.
  chainBloom() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const send = c.createGain(); send.gain.value = 1.5;
    g.connect(send); send.connect(this.verbSend);
    g.connect(this.sfxGain);
    this._env(g, t, 0.02, 0.26, 1.1);
    // a stacked fifth over the current root, two octaves up
    this._osc('sine', this._scaleFreq(0, 4), t, t + 1.2, g);
    this._osc('sine', this._scaleFreq(3, 4), t + 0.04, t + 1.2, g, { detune: 4 });
    const g2 = c.createGain(); g2.gain.value = 0.25; g2.connect(g);
    this._osc('triangle', this._scaleFreq(5, 4), t + 0.08, t + 0.9, g2);
  }

  // Every mote in the level gathered: a little rising bloom.
  allMotes() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const notes = [783.99, 880.0, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      const g = c.createGain();
      g.connect(this.sfxGain);
      const send = c.createGain(); send.gain.value = 0.8;
      g.connect(send); send.connect(this.verbSend);
      this._env(g, t + i * 0.07, 0.006, 0.22, 0.55);
      this._osc('sine', f, t + i * 0.07, t + i * 0.07 + 0.6, g);
    });
  }

  // A lure springing: wet, short, and far louder than anything the lume does.
  lureSnap() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = 900; bp.Q.value = 1.4;
    g.connect(bp); bp.connect(this.sfxGain);
    const send = c.createGain(); send.gain.value = 1.2;
    bp.connect(send); send.connect(this.verbSend);
    this._env(g, t, 0.002, 0.6, 0.16);
    this._osc('square', 520, t, t + 0.12, g, { glideTo: 90 });
    const nb = this._noiseBurst(0.14, 0.5);
    nb.connect(bp);
  }

  // A crystal answering a song: glass, not voice. Nothing in the dark turns
  // toward it, so it stays airy and sits behind the mix.
  crystalBloom() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const send = c.createGain(); send.gain.value = 1.8;
    g.connect(send); send.connect(this.verbSend);
    g.connect(this.sfxGain);
    this._env(g, t, 0.006, 0.16, 1.4);
    this._osc('sine', this._scaleFreq(4, 4), t, t + 1.5, g);
    this._osc('sine', this._scaleFreq(6, 4), t + 0.05, t + 1.4, g, { detune: -6 });
    const g2 = c.createGain(); g2.gain.value = 0.18; g2.connect(g);
    this._osc('triangle', this._scaleFreq(2, 8), t + 0.02, t + 0.7, g2);
  }

  // A heart mote taken: the lume's own pulse, answered.
  heartMote() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    [0, 0.19].forEach((off, i) => {
      const g = c.createGain();
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 620;
      g.connect(lp); lp.connect(this.sfxGain);
      this._env(g, t + off, 0.006, 0.34 - i * 0.1, 0.3);
      this._osc('sine', 132, t + off, t + off + 0.34, g, { glideTo: 176 });
    });
    const g2 = c.createGain(); g2.gain.value = 0.22;
    const send = c.createGain(); send.gain.value = 1.1;
    g2.connect(send); send.connect(this.verbSend);
    g2.connect(this.sfxGain);
    this._env(g2, t + 0.16, 0.01, 0.3, 0.9);
    this._osc('sine', this._scaleFreq(3, 2), t + 0.16, t + 1.0, g2);
  }

  // Something enormous turning over in the dark.
  leviathanWake() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 210;
    g.connect(lp); lp.connect(this.sfxGain);
    const send = c.createGain(); send.gain.value = 1.4;
    lp.connect(send); send.connect(this.verbSend);
    this._env(g, t, 0.14, 0.5, 1.9);
    this._osc('sawtooth', 34, t, t + 2.1, g, { glideTo: 52 });
    this._osc('sine', 68, t + 0.1, t + 2.0, g, { glideTo: 96, detune: -9 });
  }

  _resume() {
    if (this.ctx && this.ctx.state !== 'running') this.ctx.resume().catch(() => {});
  }

  suspend() { if (this.ctx && this.ctx.state === 'running') this.ctx.suspend().catch(() => {}); }
  resume() { this._resume(); }

  _impulse(seconds, decayPow) {
    const c = this.ctx;
    const rate = c.sampleRate;
    const len = Math.floor(rate * seconds);
    const buf = c.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) {
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decayPow);
      }
    }
    return buf;
  }

  _env(gainNode, t0, attack, peak, decay, sustainLevel = 0) {
    const g = gainNode.gain;
    g.cancelScheduledValues(t0);
    g.setValueAtTime(0.0001, t0);
    g.exponentialRampToValueAtTime(Math.max(peak, 0.0011), t0 + attack);
    g.exponentialRampToValueAtTime(Math.max(sustainLevel, 0.001), t0 + attack + decay);
  }

  _osc(type, freq, t0, t1, dest, opts = {}) {
    const c = this.ctx;
    const o = c.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (opts.glideTo) o.frequency.exponentialRampToValueAtTime(opts.glideTo, t1);
    if (opts.detune) o.detune.value = opts.detune;
    o.connect(dest);
    o.start(t0);
    o.stop(t1 + 0.05);
    return o;
  }

  _sfxReady() { return this.ctx && this.enabled.sound; }

  // ---- SFX ----
  // Each tap sings the next note of a wandering pentatonic line. Singing
  // upward tends to rise, diving tends to fall, so movement writes melody.
  ping(dirY = 0) {
    if (!this._sfxReady()) return;
    let step = (Math.random() < 0.5 ? -1 : 1) * (Math.random() < 0.3 ? 2 : 1);
    if (dirY < -0.3) step = Math.abs(step);
    else if (dirY > 0.3) step = -Math.abs(step);
    this._pingDegree = Math.max(0, Math.min(this.scale.length - 1, this._pingDegree + step));
    const f = this._scaleFreq(this._pingDegree, 2);
    const jitter = 1 + (Math.random() - 0.5) * 0.015;

    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const bp = c.createBiquadFilter();
    bp.type = 'bandpass'; bp.frequency.value = f * 1.5; bp.Q.value = 1.0;
    g.connect(bp); bp.connect(this.sfxGain);
    const send = c.createGain(); send.gain.value = 0.8;
    bp.connect(send); send.connect(this.verbSend);
    this._env(g, t, 0.008, 0.5, 0.34);
    // sonar chirp that lands ON the melody note, plus a soft pure tone of it
    this._osc('triangle', f * 2.3 * jitter, t, t + 0.36, g, { glideTo: f * jitter });
    const g2 = c.createGain(); g2.gain.value = 0.35; g2.connect(g);
    this._osc('sine', f * jitter, t + 0.03, t + 0.3, g2, { detune: 5 });
  }

  // Pentatonic ladder that climbs with combo — collecting builds a melody,
  // in the same per-level key the pings sing in.
  mote(combo) {
    if (!this._sfxReady()) return;
    const f = this._scaleFreq(Math.min(combo - 1, this.scale.length - 1), 2)
      * (1 + (Math.random() - 0.5) * 0.004);
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    g.connect(this.sfxGain);
    const send = c.createGain(); send.gain.value = 0.5;
    g.connect(send); send.connect(this.verbSend);
    this._env(g, t, 0.004, 0.34, 0.5);
    this._osc('sine', f, t, t + 0.55, g);
    const g2 = c.createGain(); g2.gain.value = 0.12; g2.connect(g);
    this._osc('sine', f * 2, t, t + 0.3, g2);
    if (combo >= 4) { // long chains earn a harmony voice
      const g3 = c.createGain(); g3.gain.value = 0.1; g3.connect(g);
      this._osc('sine', f * 1.5, t + 0.05, t + 0.4, g3);
    }
  }

  thud(intensity) {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 240;
    g.connect(lp); lp.connect(this.sfxGain);
    this._env(g, t, 0.004, 0.5 * intensity + 0.1, 0.22);
    this._osc('sine', 95, t, t + 0.25, g, { glideTo: 42 });
    const nb = this._noiseBurst(0.18, 0.25 * intensity);
    nb.connect(lp);
  }

  _noiseBurst(dur, level) {
    const c = this.ctx;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain(); g.gain.value = level;
    src.connect(g);
    src.start();
    return g;
  }

  damage() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 900;
    g.connect(lp); lp.connect(this.sfxGain);
    this._env(g, t, 0.005, 0.55, 0.4);
    this._osc('sawtooth', 220, t, t + 0.42, g, { glideTo: 68 });
    const nb = this._noiseBurst(0.3, 0.3);
    nb.connect(lp);
  }

  death() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const notes = [392, 311.1, 261.6, 196];
    notes.forEach((f, i) => {
      const g = c.createGain();
      g.connect(this.sfxGain);
      const send = c.createGain(); send.gain.value = 1.1;
      g.connect(send); send.connect(this.verbSend);
      this._env(g, t + i * 0.22, 0.01, 0.3, 0.8);
      this._osc('triangle', f, t + i * 0.22, t + i * 0.22 + 0.9, g);
    });
  }

  win() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      const g = c.createGain();
      g.connect(this.sfxGain);
      const send = c.createGain(); send.gain.value = 0.9;
      g.connect(send); send.connect(this.verbSend);
      this._env(g, t + i * 0.09, 0.008, 0.28, 0.7);
      this._osc('sine', f, t + i * 0.09, t + i * 0.09 + 0.8, g);
      const g2 = c.createGain(); g2.gain.value = 0.1; g2.connect(g);
      this._osc('triangle', f * 2, t + i * 0.09, t + i * 0.09 + 0.4, g2);
    });
  }

  star(n) {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const f = [659.25, 830.6, 1046.5][Math.min(n - 1, 2)];
    const g = c.createGain();
    g.connect(this.sfxGain);
    const send = c.createGain(); send.gain.value = 0.7;
    g.connect(send); send.connect(this.verbSend);
    this._env(g, t, 0.005, 0.3, 0.6);
    this._osc('sine', f, t, t + 0.6, g);
    this._osc('sine', f * 1.5, t + 0.03, t + 0.5, g, { detune: 4 });
  }

  alert() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700;
    g.connect(lp); lp.connect(this.sfxGain);
    this._env(g, t, 0.01, 0.22, 0.3);
    this._osc('triangle', 246.9, t, t + 0.3, g);
    this._osc('triangle', 349.2, t, t + 0.3, g, { detune: -8 });
  }

  ui() {
    if (!this._sfxReady()) return;
    const c = this.ctx, t = c.currentTime;
    const g = c.createGain();
    g.connect(this.sfxGain);
    this._env(g, t, 0.004, 0.14, 0.12);
    this._osc('sine', 740, t, t + 0.14, g, { glideTo: 620 });
  }

  // ---- threat heartbeat ----
  setThreat(v) { this.threat = v; }

  _startHeartbeat() {
    const c = this.ctx;
    const beat = () => {
      if (!this.ctx) return;
      const delay = 1000 * (0.9 - this.threat * 0.45);
      this._threatTimer = setTimeout(beat, delay);
      if (!this.enabled.sound || this.threat < 0.05 || c.state !== 'running') return;
      const t = c.currentTime;
      const mk = (off, level) => {
        const g = c.createGain();
        const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 130;
        g.connect(lp); lp.connect(this.sfxGain);
        this._env(g, t + off, 0.006, level * this.threat, 0.16);
        this._osc('sine', 58, t + off, t + off + 0.18, g);
      };
      mk(0, 0.5);
      mk(0.22, 0.32);
    };
    beat();
  }

  // ---- generative ambient music ----
  startMusic() {
    if (!this.ctx || this._musicNodes) return;
    const c = this.ctx;
    const nodes = {};
    // Underwater bed: filtered noise, barely there.
    const noiseLen = c.sampleRate * 4;
    const nbuf = c.createBuffer(1, noiseLen, c.sampleRate);
    const nd = nbuf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < noiseLen; i++) { // brown-ish noise
      last = (last + (Math.random() * 2 - 1) * 0.02) * 0.998;
      nd[i] = last * 18;
    }
    nodes.noise = c.createBufferSource();
    nodes.noise.buffer = nbuf; nodes.noise.loop = true;
    const nlp = c.createBiquadFilter(); nlp.type = 'lowpass'; nlp.frequency.value = 150;
    const ng = c.createGain(); ng.gain.value = 0.05;
    nodes.noise.connect(nlp); nlp.connect(ng); ng.connect(this.musicGain);
    const nlfo = c.createOscillator(); nlfo.frequency.value = 0.07;
    const nlfoG = c.createGain(); nlfoG.gain.value = 0.02;
    nlfo.connect(nlfoG); nlfoG.connect(ng.gain);
    nlfo.start(); nodes.noise.start();
    nodes.nlfo = nlfo;

    // Pad: two detuned triangles through slow lowpass.
    nodes.padGain = c.createGain(); nodes.padGain.gain.value = 0;
    const plp = c.createBiquadFilter(); plp.type = 'lowpass'; plp.frequency.value = 480; plp.Q.value = 0.6;
    nodes.padGain.connect(plp); plp.connect(this.musicGain);
    const send = c.createGain(); send.gain.value = 0.7;
    plp.connect(send); send.connect(this.verbSend);
    nodes.oscA = c.createOscillator(); nodes.oscA.type = 'triangle';
    nodes.oscB = c.createOscillator(); nodes.oscB.type = 'triangle'; nodes.oscB.detune.value = 7;
    nodes.oscC = c.createOscillator(); nodes.oscC.type = 'sine';
    nodes.oscA.connect(nodes.padGain); nodes.oscB.connect(nodes.padGain);
    const cg = c.createGain(); cg.gain.value = 0.5; nodes.oscC.connect(cg); cg.connect(nodes.padGain);
    nodes.oscA.start(); nodes.oscB.start(); nodes.oscC.start();

    const chords = [
      [146.83, 174.61, 220.0],   // D F A
      [116.54, 146.83, 174.61],  // Bb D F
      [174.61, 220.0, 261.63],   // F A C
      [130.81, 164.81, 196.0],   // C E G
    ];
    let ci = 0;
    const setChord = () => {
      if (!this._musicNodes) return;
      const ch = chords[ci % chords.length];
      ci++;
      const t = c.currentTime;
      nodes.oscA.frequency.exponentialRampToValueAtTime(ch[0], t + 4);
      nodes.oscB.frequency.exponentialRampToValueAtTime(ch[1], t + 4);
      nodes.oscC.frequency.exponentialRampToValueAtTime(ch[2] / 2, t + 4);
      nodes.padGain.gain.cancelScheduledValues(t);
      nodes.padGain.gain.setValueAtTime(nodes.padGain.gain.value, t);
      nodes.padGain.gain.linearRampToValueAtTime(0.085, t + 5);
      nodes.padGain.gain.linearRampToValueAtTime(0.055, t + 11);
      this._chordTimer = setTimeout(setChord, 13000);
    };
    nodes.oscA.frequency.value = chords[0][0];
    nodes.oscB.frequency.value = chords[0][1];
    nodes.oscC.frequency.value = chords[0][2] / 2;
    this._musicNodes = nodes;
    setChord();

    // Occasional distant sparkle.
    const sparkle = () => {
      if (!this._musicNodes) return;
      this._sparkleTimer = setTimeout(sparkle, 6000 + Math.random() * 9000);
      if (!this.enabled.music || c.state !== 'running') return;
      const scale = [587.33, 659.25, 783.99, 880.0, 1174.7];
      const f = scale[Math.floor(Math.random() * scale.length)];
      const t = c.currentTime;
      const g = c.createGain();
      const send2 = c.createGain(); send2.gain.value = 1.4;
      g.connect(send2); send2.connect(this.verbSend);
      g.connect(this.musicGain);
      this._env(g, t, 0.01, 0.05, 1.2);
      this._osc('sine', f, t, t + 1.3, g);
    };
    sparkle();
  }

  stopMusic() {
    if (!this._musicNodes) return;
    const n = this._musicNodes;
    this._musicNodes = null;
    clearTimeout(this._chordTimer);
    clearTimeout(this._sparkleTimer);
    try {
      n.oscA.stop(); n.oscB.stop(); n.oscC.stop(); n.noise.stop(); n.nlfo.stop();
    } catch (e) { /* already stopped */ }
  }

  // Briefly lower music so a big moment (win/death) owns the mix.
  duck(seconds = 2.4, level = 0.14) {
    if (!this.ctx || !this.musicGain) return;
    const g = this.musicGain.gain, t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(level, t + 0.15);
    g.linearRampToValueAtTime(0.5, t + seconds);
  }

  setEnabled(sound, music) {
    this.enabled.sound = sound;
    this.enabled.music = music;
    if (this.ctx) {
      if (music && !this._musicNodes) this.startMusic();
      if (!music && this._musicNodes) this.stopMusic();
    }
  }
}

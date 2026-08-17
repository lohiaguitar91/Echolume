// Pointer input: taps anywhere on the canvas emit ping intents.
// Also the hook point for iOS audio unlock (first gesture resumes the AudioContext).
//
// Two gestures, one thumb:
//   tap            — sing from yourself (move + light + noise), as always
//   hold + release — CAST: throw your voice. While held past the threshold the
//                    game gets onCastAim every frame (for the aim glyph); on
//                    release, onCast fires at the held point. A short hold is
//                    still just a tap, so nothing existing changes feel.

const CAST_HOLD_MS = 320;

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.onTap = null;        // (clientX, clientY) => void
    this.onCast = null;       // (clientX, clientY) => void — hold released
    this.onCastAim = null;    // (clientX, clientY | null) => void — null = aim ended
    this.onHold = null;       // legacy long-hold cue (tutorial)
    this.onFirstGesture = null;
    this._gestureFired = false;
    this._active = false;
    this._downAt = 0;
    this._downX = 0; this._downY = 0;
    this._aiming = false;
    this._aimRaf = 0;

    const fireGesture = () => {
      if (!this._gestureFired) {
        this._gestureFired = true;
        if (this.onFirstGesture) this.onFirstGesture();
      }
    };

    canvas.addEventListener('pointerdown', (e) => {
      fireGesture();
      if (!this._active) return;
      e.preventDefault();
      this._downAt = performance.now();
      this._downX = e.clientX; this._downY = e.clientY;
      this._aiming = false;
      // After the threshold, start reporting aim. rAF-driven so a motionless
      // hold still begins aiming (pointermove alone would never fire).
      const tick = () => {
        if (!this._downAt) return;
        if (performance.now() - this._downAt >= CAST_HOLD_MS) {
          this._aiming = true;
          if (this.onCastAim) this.onCastAim(this._downX, this._downY);
        }
        this._aimRaf = requestAnimationFrame(tick);
      };
      this._aimRaf = requestAnimationFrame(tick);
    }, { passive: false });

    canvas.addEventListener('pointermove', (e) => {
      if (!this._active || !this._downAt) return;
      this._downX = e.clientX; this._downY = e.clientY;
    });

    const finish = (e, cancelled) => {
      if (!this._active || !this._downAt) return;
      const held = performance.now() - this._downAt;
      const wasAiming = this._aiming;
      this._downAt = 0;
      this._aiming = false;
      cancelAnimationFrame(this._aimRaf);
      if (this.onCastAim) this.onCastAim(null, null);   // aim glyph off
      if (cancelled) return;
      if (wasAiming && held >= CAST_HOLD_MS) {
        if (this.onCast) this.onCast(this._downX, this._downY);
      } else {
        // A short press is a tap. Firing on RELEASE (not down) keeps tap and
        // cast from both triggering on one gesture; sub-threshold presses feel
        // identical to before.
        if (this.onTap) this.onTap(this._downX, this._downY);
      }
      if (held > 600 && this.onHold) this.onHold(held);
    };
    canvas.addEventListener('pointerup', (e) => finish(e, false));
    canvas.addEventListener('pointercancel', (e) => finish(e, true));

    // Any UI interaction also unlocks audio.
    window.addEventListener('pointerdown', fireGesture, { capture: true });

    // Kill browser gestures that fight the game.
    canvas.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    window.addEventListener('keydown', (e) => {
      if (e.key === ' ' && this._active) e.preventDefault();
    });
  }

  setActive(v) { this._active = v; }
}

// Pointer input: taps anywhere on the canvas emit ping intents.
// Also the hook point for iOS audio unlock (first gesture resumes the AudioContext).

export class Input {
  constructor(canvas) {
    this.canvas = canvas;
    this.onTap = null;        // (clientX, clientY) => void
    this.onHold = null;       // fired when a press is held >600ms (tutorial cue)
    this.onFirstGesture = null;
    this._gestureFired = false;
    this._active = false;
    this._downAt = 0;

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
      if (this.onTap) this.onTap(e.clientX, e.clientY);
    }, { passive: false });

    canvas.addEventListener('pointerup', () => {
      if (!this._active || !this._downAt) return;
      const held = performance.now() - this._downAt;
      this._downAt = 0;
      if (held > 600 && this.onHold) this.onHold(held);
    });

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

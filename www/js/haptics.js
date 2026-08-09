// Haptics: Capacitor Haptics plugin when present (native iOS/Android),
// navigator.vibrate fallback (Android web), silent no-op elsewhere.

export class Haptics {
  constructor() {
    this.enabled = true;
    this.cap = window.Capacitor?.Plugins?.Haptics || null;
  }

  _canVibrate() {
    // Browsers block vibrate before the first real user gesture; skip quietly.
    return navigator.vibrate &&
      (!navigator.userActivation || navigator.userActivation.hasBeenActive);
  }

  _impact(style) {
    if (!this.enabled) return;
    if (this.cap) {
      this.cap.impact({ style }).catch(() => {});
    } else if (this._canVibrate()) {
      navigator.vibrate(style === 'HEAVY' ? 40 : style === 'MEDIUM' ? 22 : 10);
    }
  }

  tick() { this._impact('LIGHT'); }        // ping
  collect() { this._impact('LIGHT'); }     // mote
  warn() { this._impact('MEDIUM'); }       // hunter alerted
  damage() { this._impact('HEAVY'); }
  success() {                               // level complete
    if (!this.enabled) return;
    if (this.cap) {
      this.cap.notification({ type: 'SUCCESS' }).catch(() => {});
    } else if (this._canVibrate()) {
      navigator.vibrate([18, 60, 18, 60, 30]);
    }
  }
}

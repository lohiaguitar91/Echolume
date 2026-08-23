/* Holocron UI — the opening crawl. Plays once on first visit (skippable at any moment:
   click, Esc, or the Skip control), replayable from the footer. Under reduced motion it
   becomes a static title card instead. */
(function () {
  'use strict';
  const H = window.HOLO;

  const SEEN_KEY = 'holo-crawl-seen';
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const TITLE = 'THE OLD REPUBLIC';
  const PARAS = [
    'It is an age of endless war. For six thousand years — from the exile fleets of the Hundred-Year Darkness to the burning of Ossus — the SITH and the JEDI have contested the fate of the galaxy.',
    'Empires rise on Korriban and Dromund Kaas; academies open and close like wounds. Revan falls and returns. At Ruusan, DARTH BANE buries the old Sith beneath a thought bomb and forges the Rule of Two — two, always two, hidden for a thousand years.',
    'Within this holocron lies the whole record: every master and apprentice, every battle, every world, every doctrine. Search it. Question it. Follow the rabbit holes. The dark side is patient — and so is this archive….'
  ];

  let overlay = null;

  function seen() { try { return localStorage.getItem(SEEN_KEY) === '1'; } catch (e) { return true; } }
  function markSeen() { try { localStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* fine */ } }

  function dismiss() {
    if (!overlay) return;
    const o = overlay; overlay = null;
    markSeen();
    o.classList.add('out');
    setTimeout(() => o.remove(), 450);
    document.removeEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') dismiss(); }

  function build(staticMode) {
    const o = document.createElement('div');
    o.className = 'crawl' + (staticMode ? ' static' : '');
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-label', 'Opening crawl');
    const paras = PARAS.map(p => '<p>' + p + '</p>').join('');
    o.innerHTML = staticMode
      ? '<div class="crawl-static"><div class="crawl-blue">A long time ago in a galaxy far,<br>far away….</div>' +
        '<h2>' + TITLE + '</h2>' + paras +
        '<button class="btn primary crawl-skip" type="button">Enter the Holocron</button></div>'
      : '<div class="crawl-blue">A long time ago in a galaxy far,<br>far away….</div>' +
        '<div class="crawl-logo" aria-hidden="true">HOLOCRON</div>' +
        '<div class="crawl-plane"><div class="crawl-text"><h2>' + TITLE + '</h2>' + paras + '</div></div>' +
        '<button class="btn crawl-skip" type="button">Skip ▸</button>';
    return o;
  }

  function play(force) {
    if (overlay) return;
    if (!force && seen()) return;
    const staticMode = reduced();
    overlay = build(staticMode);
    document.body.append(overlay);
    document.addEventListener('keydown', onKey);
    overlay.querySelector('.crawl-skip').addEventListener('click', dismiss);
    if (!staticMode) {
      overlay.addEventListener('click', e => { if (!e.target.closest('.crawl-skip')) dismiss(); });
      const text = overlay.querySelector('.crawl-text');
      text.addEventListener('animationend', dismiss);
    }
  }

  function init() {
    const replay = document.getElementById('replay-crawl');
    if (replay) replay.addEventListener('click', () => play(true));
    play(false);
  }

  H.ui = H.ui || {};
  H.ui.crawl = { init, play };
})();

/* Holocron UI — PNG export for the timeline (SVG) and graph (canvas), via a preview modal. */
(function () {
  'use strict';
  const H = window.HOLO;

  let modal, body, dl, title;
  let current = null;   // {dataURL, name} for the mediated-save path

  /* In the claude.ai artifact runtime, plain download links are inert; the `downloads`
     capability mediates the save instead. Anywhere else (file://, a static server) the
     native <a download> works and this resolves null. */
  const downloadsNS = (async () => {
    try {
      if (typeof window.claude !== 'undefined' && typeof window.claude.use === 'function') {
        return await window.claude.use('downloads');
      }
    } catch (e) { /* no runtime */ }
    return null;
  })();

  function dataURLtoBlob(u) {
    const b64 = u.split(',')[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new Blob([arr], { type: 'image/png' });
  }

  function init() {
    modal = document.getElementById('modal');
    body = document.getElementById('modal-body');
    dl = document.getElementById('modal-dl');
    title = document.getElementById('modal-title');
    document.getElementById('modal-close').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });

    /* If the runtime is present, replace the native link with the mediated save. */
    downloadsNS.then(ns => {
      if (typeof window.claude === 'undefined') return;   // plain page: keep the <a download>
      dl.removeAttribute('href');
      dl.removeAttribute('download');
      dl.setAttribute('role', 'button');
      dl.style.cursor = 'pointer';
      dl.addEventListener('click', async e => {
        e.preventDefault();
        if (!current) return;
        if (!ns) { noteFallback(); return; }
        try {
          await ns.save({ filename: current.name + '.png', data: dataURLtoBlob(current.dataURL) });
        } catch (err) {
          if (!err || err.code !== 'declined') noteFallback();
        }
      });
    });
  }
  function noteFallback() {
    const n = body.querySelector('.hint-note');
    if (n) n.textContent = 'Saving is unavailable in this view — right-click (or long-press) the image and choose “Save image”.';
  }
  function close() { modal.classList.remove('open'); body.innerHTML = ''; }

  function show(dataURL, name) {
    current = { dataURL, name };
    title.textContent = name + '.png';
    dl.href = dataURL;
    dl.download = name + '.png';
    body.innerHTML = '';
    const img = new Image();
    img.src = dataURL;
    img.alt = name;
    body.append(img);
    const note = document.createElement('p');
    note.className = 'hint-note';
    note.textContent = 'If the download button does nothing in this viewer, right-click (or long-press) the image and choose “Save image”.';
    body.append(note);
    modal.classList.add('open');
  }

  function fromCanvas(canvas, name) {
    try { show(canvas.toDataURL('image/png'), name); }
    catch (e) { show('', name); }
  }

  function fromSVG(svgEl, name, bg) {
    try {
      const clone = svgEl.cloneNode(true);
      const w = parseFloat(svgEl.getAttribute('width')) || svgEl.clientWidth || 1200;
      const h = parseFloat(svgEl.getAttribute('height')) || svgEl.clientHeight || 600;
      clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clone.setAttribute('width', w); clone.setAttribute('height', h);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', 0); rect.setAttribute('y', 0);
      rect.setAttribute('width', w); rect.setAttribute('height', h);
      rect.setAttribute('fill', bg || '#141013');
      clone.insertBefore(rect, clone.firstChild);
      const xml = new XMLSerializer().serializeToString(clone);
      const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
      const img = new Image();
      img.onload = () => {
        const scale = 2;
        const c = document.createElement('canvas');
        c.width = w * scale; c.height = h * scale;
        const ctx = c.getContext('2d');
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0);
        show(c.toDataURL('image/png'), name);
      };
      img.onerror = () => show(url, name);
      img.src = url;
    } catch (e) { /* keep the app alive whatever the serializer does */ }
  }

  H.ui = H.ui || {};
  H.ui.exportPNG = { init, fromCanvas, fromSVG };
})();

/* ---------------------------------------------------------
   Jardín de Recuerdos — application logic
   Screens: splash → dashboard → camera → style → dashboard
   --------------------------------------------------------- */
(function () {
  const { db, filters } = window.JDR;
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  const PHOTO_ASPECT = 4 / 5;      // polaroid ratio
  const MAX_EDGE = 1400;           // stored photo max long edge (px)

  const state = {
    config: db.config.get(),
    user: db.user.get(),
    photos: [],
    // camera
    stream: null,
    facing: 'environment',
    zoom: 1,
    flash: false,
    torchSupported: false,
    // capture pipeline
    capture: null,         // offscreen canvas with raw capture (already cropped)
    styleId: filters.DEFAULT_STYLE,
    detailId: null,
  };

  /* ---------------- helpers ---------------- */
  function showScreen(id) {
    $$('.screen').forEach((s) => s.classList.toggle('is-active', s.id === id));
    window.scrollTo(0, 0);
  }
  function openOverlay(id) { $('#' + id).hidden = false; }
  function closeOverlay(id) { $('#' + id).hidden = true; }
  let toastTimer;
  function toast(msg, ms) {
    const el = $('#toast'); el.textContent = msg; el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { el.hidden = true; }, ms || 2200);
  }
  function bind(key, value) { $$(`[data-bind="${key}"]`).forEach((el) => { el.textContent = value; }); }
  function fmtNumber(n) { return n.toLocaleString('en-US'); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
  function shorten(str, n) { return str.length > n ? str.slice(0, n).trimEnd() + '…' : str; }
  function escapeHTML(s) { return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function fmtDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '').toUpperCase() + ' · ' +
      d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  function timeLeft() {
    const ms = new Date(state.config.endsAt).getTime() - Date.now();
    if (ms <= 0) return 'Finalizado';
    const m = Math.floor(ms / 60000);
    const d = Math.floor(m / 1440);
    const h = Math.floor((m % 1440) / 60);
    const mm = m % 60;
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${mm}m`;
    return `${mm}m`;
  }

  /* ---------------- rendering ---------------- */
  function renderConfig() {
    const c = state.config;
    $$('[data-config]').forEach((el) => { if (c[el.dataset.config] != null) el.textContent = c[el.dataset.config]; });
    bind('eventTitle', c.eventTitle);
    bind('eventTitleShort', shorten(c.eventTitle, 22));
    document.title = `${c.eventTitle} · Jardín de Recuerdos`;
    renderHeroLetters(c.heroWord);
    renderClock();
  }
  function renderHeroLetters(word) {
    const el = $('#hero-letters');
    el.innerHTML = Array.from((word || '').trim().toUpperCase()).map((ch) => `<span>${escapeHTML(ch)}</span>`).join('');
  }
  function renderClock() {
    const t = timeLeft();
    bind('timeLeft', t);
    bind('timeLeftStamp', t === 'Finalizado' ? t : `quedan ${t}`);
  }
  function renderUser() { bind('userName', state.user ? state.user.name : 'Invitado'); }

  const objectURLs = new Map();
  function urlFor(photo) {
    if (!objectURLs.has(photo.id)) objectURLs.set(photo.id, URL.createObjectURL(photo.blob));
    return objectURLs.get(photo.id);
  }

  function renderStats() {
    const people = new Map();
    state.photos.forEach((p) => people.set(p.author, (people.get(p.author) || 0) + 1));
    bind('momentsCount', fmtNumber(state.photos.length));
    bind('peopleCount', fmtNumber(people.size));
    return people;
  }

  function stampFor(photo, index) {
    // Subtle B&W text overlay on some photos (every 3rd), like a date/frame stamp
    if (index % 3 !== 1) return '';
    const d = new Date(photo.createdAt);
    const n = String(index + 1).padStart(2, '0');
    return `<span class="polaroid__stamp">Nº${n} · ${d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).replace('.', '')}</span>`;
  }

  function renderAlbum() {
    const grid = $('#album-grid');
    $('#album-empty').hidden = state.photos.length > 0;
    grid.innerHTML = state.photos.map((p, i) => `
      <figure class="polaroid polaroid--stack polaroid--card" data-id="${p.id}" style="margin:0">
        <div class="polaroid__photo">
          <img src="${urlFor(p)}" alt="Foto de ${escapeHTML(p.author)}" loading="lazy">
          <div class="polaroid__grain"></div>
          ${stampFor(p, i)}
        </div>
        <figcaption class="polaroid__caption">
          <span>${escapeHTML(p.author)}</span>
          <span>${escapeHTML(styleName(p.style))}</span>
        </figcaption>
      </figure>`).join('');
  }

  function renderGallery() {
    $('#gallery-grid').innerHTML = state.photos.map((p, i) => `
      <div class="gallery__item" data-id="${p.id}">
        <img src="${urlFor(p)}" alt="Foto de ${escapeHTML(p.author)}" loading="lazy">
        ${stampFor(p, i)}
      </div>`).join('');
  }

  function renderPeople(people) {
    const list = Array.from(people.entries()).sort((a, b) => b[1] - a[1]);
    $('#people-list').innerHTML = list.map(([name, n]) => `
      <li>
        <span class="people__avatar">${escapeHTML(name.charAt(0).toUpperCase())}</span>
        <span class="people__name">${escapeHTML(name)}</span>
        <span class="people__count">${n}</span>
      </li>`).join('') || '<li class="sans">Nadie por ahora.</li>';
  }

  function styleName(id) { const s = filters.STYLES.find((x) => x.id === id); return s ? s.name : id; }

  async function refresh() {
    state.photos = await db.photos.all();
    const people = renderStats();
    renderAlbum();
    renderGallery();
    renderPeople(people);
  }

  /* ---------------- splash ---------------- */
  $('#form-name').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#input-name').value.trim().replace(/\s+/g, ' ');
    if (!name) return;
    state.user = db.user.set(name);
    renderUser();
    showScreen('screen-dashboard');
  });

  /* ---------------- settings sheet ---------------- */
  function openSettings() {
    const f = $('#form-settings');
    f.eventTitle.value = state.config.eventTitle;
    f.welcome.value = state.config.welcome;
    f.origin.value = state.config.origin;
    f.heroWord.value = state.config.heroWord;
    const d = new Date(state.config.endsAt);
    const pad = (n) => String(n).padStart(2, '0');
    f.endsAt.value = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    openOverlay('overlay-settings');
  }
  $('#btn-settings-splash').addEventListener('click', openSettings);
  $('#btn-settings-dash').addEventListener('click', openSettings);
  $('#form-settings').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.target;
    const patch = {
      eventTitle: f.eventTitle.value.trim() || state.config.eventTitle,
      welcome: f.welcome.value.trim() || state.config.welcome,
      origin: f.origin.value.trim(),
      heroWord: f.heroWord.value.trim() || state.config.heroWord,
    };
    if (f.endsAt.value) patch.endsAt = new Date(f.endsAt.value).toISOString();
    state.config = db.config.set(patch);
    renderConfig();
    closeOverlay('overlay-settings');
    toast('Guardado.');
  });
  $('#btn-clear-demo').addEventListener('click', async () => {
    await db.photos.removeWhere((p) => p.demo);
    localStorage.setItem('jdr:demoSeeded', '1');
    await refresh();
    closeOverlay('overlay-settings');
    toast('Fotos de muestra retiradas.');
  });
  $('#btn-reset').addEventListener('click', async () => {
    if (!confirm('¿Borrar todas las fotos y los ajustes de este dispositivo?')) return;
    await db.photos.clear();
    db.config.reset(); db.user.clear();
    localStorage.removeItem('jdr:demoSeeded');
    location.reload();
  });

  /* ---------------- overlays ---------------- */
  $$('[data-close]').forEach((b) => b.addEventListener('click', () => closeOverlay(b.dataset.close)));
  $('#overlay-settings').addEventListener('click', (e) => { if (e.target.id === 'overlay-settings') closeOverlay('overlay-settings'); });
  $('#btn-people').addEventListener('click', () => openOverlay('overlay-people'));
  $('#btn-gallery').addEventListener('click', () => openOverlay('overlay-gallery'));

  function openDetail(id) {
    const p = state.photos.find((x) => x.id === id);
    if (!p) return;
    state.detailId = id;
    $('#flip').classList.remove('is-flipped');
    $('#detail-img').src = urlFor(p);
    $('#detail-author').textContent = p.author;
    $('#detail-style').textContent = styleName(p.style);
    $('#detail-meta').textContent = fmtDate(p.createdAt);
    $('#detail-note').textContent = p.note || '';
    $('#detail-back-author').textContent = `— ${p.author}`;
    $('#detail-back-date').textContent = fmtDate(p.createdAt);
    $('#btn-detail-delete').hidden = !(state.user && p.author === state.user.name);
    openOverlay('overlay-detail');
  }
  $('#flip').addEventListener('click', () => $('#flip').classList.toggle('is-flipped'));
  $('#album-grid').addEventListener('click', (e) => { const c = e.target.closest('[data-id]'); if (c) openDetail(c.dataset.id); });
  $('#gallery-grid').addEventListener('click', (e) => { const c = e.target.closest('[data-id]'); if (c) openDetail(c.dataset.id); });

  function download(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  function filenameFor(p, i) {
    const n = String(i + 1).padStart(4, '0');
    return `${n}-${p.author.replace(/[^\w.-]+/g, '_')}-${p.style}.jpg`;
  }
  $('#btn-detail-download').addEventListener('click', () => {
    const i = state.photos.findIndex((x) => x.id === state.detailId);
    if (i >= 0) download(state.photos[i].blob, filenameFor(state.photos[i], i));
  });
  $('#btn-detail-delete').addEventListener('click', async () => {
    if (!confirm('¿Eliminar esta foto?')) return;
    await db.photos.remove(state.detailId);
    closeOverlay('overlay-detail');
    await refresh();
  });

  $('#btn-download-all').addEventListener('click', async () => {
    if (!state.photos.length) { toast('No hay fotos para descargar.'); return; }
    const slug = state.config.eventTitle.replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'album';
    if (window.JSZip) {
      toast(`Preparando el álbum (${state.photos.length} fotos)…`, 4000);
      const zip = new JSZip();
      const folder = zip.folder(slug);
      state.photos.forEach((p, i) => folder.file(filenameFor(p, i), p.blob));
      folder.file('index.json', JSON.stringify(state.photos.map((p, i) => ({
        file: filenameFor(p, i), author: p.author, style: p.style, note: p.note || '', createdAt: p.createdAt,
      })), null, 2));
      const blob = await zip.generateAsync({ type: 'blob' });
      download(blob, `${slug}.zip`);
    } else {
      // Fallback without JSZip (offline): sequential downloads
      toast('Descargando foto por foto…', 3000);
      for (let i = 0; i < state.photos.length; i++) {
        download(state.photos[i].blob, filenameFor(state.photos[i], i));
        await new Promise((r) => setTimeout(r, 350));
      }
    }
  });

  /* ---------------- camera ---------------- */
  const video = $('#cam-video');

  async function startCamera() {
    stopCamera();
    $('#cam-fallback').hidden = true;
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { showCamFallback(); return; }
    try {
      state.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: state.facing }, width: { ideal: 1920 }, height: { ideal: 1440 } },
        audio: false,
      });
      video.srcObject = state.stream;
      await video.play().catch(() => {});
      const track = state.stream.getVideoTracks()[0];
      const caps = track.getCapabilities ? track.getCapabilities() : {};
      state.torchSupported = !!caps.torch;
      state.hwZoom = caps.zoom || null;
      const settings = track.getSettings ? track.getSettings() : {};
      const isFront = settings.facingMode === 'user' || (state.facing === 'user' && !settings.facingMode);
      video.style.setProperty('--mirror', isFront ? -1 : 1);
      state.mirror = isFront;
      applyZoom(state.zoom);
      applyFlash();
    } catch (err) {
      console.warn('Camera unavailable', err);
      showCamFallback();
    }
  }
  function showCamFallback() { $('#cam-fallback').hidden = false; }
  function stopCamera() {
    if (state.stream) { state.stream.getTracks().forEach((t) => t.stop()); state.stream = null; }
    video.srcObject = null;
  }

  function applyZoom(z) {
    state.zoom = z;
    $$('.zoom-btn').forEach((b) => b.classList.toggle('is-active', parseFloat(b.dataset.zoom) === z));
    const track = state.stream && state.stream.getVideoTracks()[0];
    // Try hardware zoom first (covers 0.5x on devices with ultra-wide), fall back to CSS crop.
    if (track && state.hwZoom && z >= state.hwZoom.min && z <= state.hwZoom.max) {
      track.applyConstraints({ advanced: [{ zoom: z }] }).then(() => {
        state.zoomMode = 'hw'; video.style.setProperty('--zoom', 1);
      }).catch(() => cssZoom(z));
    } else cssZoom(z);
  }
  function cssZoom(z) {
    state.zoomMode = 'css';
    // Can't go wider than the lens; 0.5x is shown as 1x in CSS mode.
    video.style.setProperty('--zoom', Math.max(1, z));
    if (z < 1 && !state.hwZoom) toast('El gran angular no está disponible en este dispositivo.');
  }
  $('#zoom-group').addEventListener('click', (e) => {
    const b = e.target.closest('.zoom-btn'); if (b) applyZoom(parseFloat(b.dataset.zoom));
  });

  function applyFlash() {
    $('#btn-flash').dataset.state = state.flash ? 'on' : 'off';
    const track = state.stream && state.stream.getVideoTracks()[0];
    if (track && state.torchSupported) track.applyConstraints({ advanced: [{ torch: state.flash }] }).catch(() => {});
  }
  $('#btn-flash').addEventListener('click', () => { state.flash = !state.flash; applyFlash(); });
  $('#btn-flip').addEventListener('click', () => { state.facing = state.facing === 'user' ? 'environment' : 'user'; startCamera(); });

  $('#btn-open-camera').addEventListener('click', () => { showScreen('screen-camera'); startCamera(); });
  $('#btn-cam-close').addEventListener('click', () => { stopCamera(); showScreen('screen-dashboard'); });

  function captureFromVideo() {
    if (!state.stream || !video.videoWidth) return null;
    const vw = video.videoWidth, vh = video.videoHeight;
    const cssZ = state.zoomMode === 'css' ? Math.max(1, state.zoom) : 1;
    const crop = filters.coverCrop(vw, vh, PHOTO_ASPECT, cssZ);
    const h = Math.min(MAX_EDGE, Math.round(crop.sh));
    const w = Math.round(h * PHOTO_ASPECT);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    ctx.save();
    if (state.mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.drawImage(video, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
    ctx.restore();
    return c;
  }

  function captureFromImage(img) {
    const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
    const crop = filters.coverCrop(iw, ih, PHOTO_ASPECT, 1);
    const h = Math.min(MAX_EDGE, Math.round(crop.sh));
    const w = Math.round(h * PHOTO_ASPECT);
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
    return c;
  }

  $('#btn-shutter').addEventListener('click', () => {
    const flashEl = $('#flash-overlay');
    if (state.flash && !state.torchSupported) { flashEl.classList.remove('is-on'); void flashEl.offsetWidth; flashEl.classList.add('is-on'); }
    const c = captureFromVideo();
    if (!c) { toast('La cámara todavía no está lista.'); return; }
    if (navigator.vibrate) navigator.vibrate(12);
    goToStyle(c);
  });

  function handleFile(file) {
    if (!file) return;
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(img.src); goToStyle(captureFromImage(img)); };
    img.onerror = () => toast('No se pudo leer la imagen.');
    img.src = URL.createObjectURL(file);
  }
  $('#cam-file').addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });
  $('#cam-file-2').addEventListener('change', (e) => { handleFile(e.target.files[0]); e.target.value = ''; });

  /* ---------------- style selection ---------------- */
  const canvasOriginal = $('#canvas-original');
  const canvasStyled = $('#canvas-styled');
  const compare = $('#compare');

  function goToStyle(captureCanvas) {
    stopCamera();
    state.capture = captureCanvas;
    state.styleId = filters.DEFAULT_STYLE;
    $('#input-note').value = '';
    showScreen('screen-style');
    buildSwatches();
    renderPreview();
  }

  function previewSize() {
    // Render preview at a modest size for speed; full-res render happens on save.
    const h = Math.min(900, state.capture.height);
    return { width: Math.round(h * PHOTO_ASPECT), height: h };
  }

  function renderPreview() {
    const size = previewSize();
    filters.render(state.capture, canvasOriginal, 'original', { width: size.width, height: size.height });
    filters.render(state.capture, canvasStyled, state.styleId, { width: size.width, height: size.height });
    const s = filters.STYLES.find((x) => x.id === state.styleId);
    bind('styleName', s.name); bind('styleDesc', s.desc); bind('styleLabel', s.name);
    $$('.swatch').forEach((el) => el.classList.toggle('is-active', el.dataset.style === state.styleId));
  }

  function buildSwatches() {
    const wrap = $('#swatches');
    wrap.innerHTML = '';
    filters.STYLES.forEach((s) => {
      const el = document.createElement('button');
      el.type = 'button'; el.className = 'swatch'; el.dataset.style = s.id;
      const thumb = document.createElement('div'); thumb.className = 'swatch__thumb';
      const c = document.createElement('canvas');
      filters.render(state.capture, c, s.id, { width: 128, height: 128, crop: filters.coverCrop(state.capture.width, state.capture.height, 1, 1) });
      thumb.appendChild(c);
      const label = document.createElement('span'); label.className = 'swatch__label sans'; label.textContent = s.name;
      el.append(thumb, label);
      el.addEventListener('click', () => { state.styleId = s.id; renderPreview(); });
      wrap.appendChild(el);
    });
  }

  // Hold to compare → split view (left: original, right: styled)
  function startCompare(e) { e.preventDefault(); compare.classList.add('is-comparing'); $('.compare__divider').hidden = false; }
  function endCompare() { compare.classList.remove('is-comparing'); $('.compare__divider').hidden = true; }
  compare.addEventListener('pointerdown', startCompare);
  ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => compare.addEventListener(ev, endCompare));
  compare.addEventListener('contextmenu', (e) => e.preventDefault());

  $('#btn-style-back').addEventListener('click', () => { showScreen('screen-camera'); startCamera(); });

  $('#btn-style-next').addEventListener('click', async () => {
    const btn = $('#btn-style-next'); btn.disabled = true;
    try {
      const out = document.createElement('canvas');
      filters.render(state.capture, out, state.styleId, { width: state.capture.width, height: state.capture.height });
      const blob = await filters.canvasToBlob(out, 0.88);
      const photo = {
        id: uid(), blob, author: state.user ? state.user.name : 'Invitado', style: state.styleId,
        note: $('#input-note').value.trim(),
        createdAt: new Date().toISOString(), width: out.width, height: out.height, demo: false,
      };
      await db.photos.add(photo);
      await refresh();
      showScreen('screen-dashboard');
      toast('Momento añadido al cuaderno.');
    } catch (err) {
      console.error(err); toast('No se pudo guardar la foto.');
    } finally { btn.disabled = false; }
  });

  /* ---------------- demo seed ---------------- */
  // Procedurally generated "photos" so the dashboard looks alive on first launch.
  async function seedDemo() {
    if (localStorage.getItem('jdr:demoSeeded')) return;
    const existing = await db.photos.all();
    if (existing.length) { localStorage.setItem('jdr:demoSeeded', '1'); return; }
    const names = ['Brian.S', 'Yen.K', 'Marta.L', 'Théo.R', 'Amara.O', 'Luis.P'];
    const palettes = [
      ['#e9c7b3', '#c98a7a', '#7d8b5a'], ['#f2d9a6', '#c99a9c', '#5c473a'], ['#d9c7a8', '#a9737a', '#3f2e24'],
      ['#f6e6d9', '#e58fa3', '#7d8b5a'], ['#e6dac7', '#7d8b5a', '#a9737a'], ['#fbe7ea', '#c9a262', '#5b6741'],
    ];
    const stylesSeq = ['vintage', 'vintage', 'bw', 'vintage', 'original', 'vintage'];
    const notes = [
      'Que nunca dejéis de bailar así.', 'Gracias por dejarnos ser parte de este día.', '',
      'Para Emma y Daniel, con todo el cariño.', 'Un brindis por lo que viene.', 'Primer baile. Lágrimas garantizadas.',
    ];
    const now = Date.now();
    for (let i = 0; i < names.length; i++) {
      const w = 640, h = 800;
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const ctx = c.getContext('2d');
      const [a, b, d] = palettes[i];
      const g = ctx.createLinearGradient(0, 0, w, h); g.addColorStop(0, a); g.addColorStop(1, b);
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // soft bokeh circles
      for (let k = 0; k < 14; k++) {
        const r = 40 + Math.random() * 140;
        const rg = ctx.createRadialGradient(Math.random() * w, Math.random() * h, 0, 0, 0, 0);
        const x = Math.random() * w, y = Math.random() * h;
        const rg2 = ctx.createRadialGradient(x, y, 0, x, y, r);
        rg2.addColorStop(0, k % 2 ? d + 'aa' : '#ffffff88'); rg2.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = rg2; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        void rg;
      }
      // a "stem"
      ctx.strokeStyle = d; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.globalAlpha = .55;
      ctx.beginPath(); ctx.moveTo(w * .5, h); ctx.bezierCurveTo(w * .55, h * .7, w * .4, h * .5, w * .5, h * .35); ctx.stroke();
      ctx.globalAlpha = 1;
      const out = document.createElement('canvas');
      filters.render(c, out, stylesSeq[i], { width: w, height: h });
      const blob = await filters.canvasToBlob(out, 0.8);
      await db.photos.add({
        id: 'demo-' + i, blob, author: names[i], style: stylesSeq[i], note: notes[i], demo: true,
        createdAt: new Date(now - (i + 1) * 47 * 60000).toISOString(), width: w, height: h,
      });
    }
    localStorage.setItem('jdr:demoSeeded', '1');
  }

  /* ---------------- init ---------------- */
  async function init() {
    renderConfig();
    renderUser();
    try { await seedDemo(); } catch (e) { console.warn('seed failed', e); }
    await refresh();
    setInterval(renderClock, 30000);
    if (state.user) {
      $('#input-name').value = state.user.name;
      showScreen('screen-dashboard');
    } else {
      showScreen('screen-splash');
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && state.stream) stopCamera();
      else if (!document.hidden && $('#screen-camera').classList.contains('is-active') && !state.stream) startCamera();
    });
  }
  init();
})();

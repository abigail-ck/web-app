/* ---------------------------------------------------------
   Canvas image processing: "Vintage Film" preset, B&W, grain.
   --------------------------------------------------------- */
(function (global) {
  const STYLES = [
    {
      id: 'original',
      name: 'Original',
      desc: 'Untouched capture, with a fine layer of film grain only.',
      grain: 0.05,
    },
    {
      id: 'vintage',
      name: 'Vintage',
      desc: 'Warm, golden tones with soft fade, lifted blacks and film grain — like a disposable camera in 1983.',
      grain: 0.11,
    },
    {
      id: 'bw',
      name: 'Black & White',
      desc: 'Silver halide monochrome. Gentle contrast, faded shadows, heavy grain.',
      grain: 0.14,
    },
  ];
  const DEFAULT_STYLE = 'vintage';

  const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : v);

  // Pre-computed tone curves (LUTs) for speed.
  function buildLUT(fn) { const lut = new Uint8ClampedArray(256); for (let i = 0; i < 256; i++) lut[i] = clamp(fn(i)); return lut; }
  // S-curve with lifted blacks (the "fade") and slightly compressed highlights.
  const fadeCurve = buildLUT((v) => {
    const x = v / 255;
    const s = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; // smooth ease
    const mixed = x * 0.55 + s * 0.45;
    return 22 + mixed * (245 - 22); // lift blacks to ~22, cap whites ~245
  });
  const bwCurve = buildLUT((v) => {
    const x = v / 255;
    const s = x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
    const mixed = x * 0.4 + s * 0.6;
    return 18 + mixed * (240 - 18);
  });

  function applyVintage(d) {
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      // Slight desaturation toward luma
      const l = 0.299 * r + 0.587 * g + 0.114 * b;
      r = r * 0.86 + l * 0.14;
      g = g * 0.86 + l * 0.14;
      b = b * 0.86 + l * 0.14;
      // Warm / golden color cast: push reds & greens, pull blues; tint shadows amber, highlights cream
      const t = l / 255;
      r = r * 1.07 + 12 + t * 6;
      g = g * 1.01 + 6 + t * 4;
      b = b * 0.88 - 8 + (1 - t) * 6;
      d[i] = fadeCurve[clamp(r) | 0];
      d[i + 1] = fadeCurve[clamp(g) | 0];
      d[i + 2] = fadeCurve[clamp(b) | 0];
    }
  }

  function applyBW(d) {
    for (let i = 0; i < d.length; i += 4) {
      // Orthochromatic-ish weighting (slightly more red) for a classic look
      const l = 0.34 * d[i] + 0.5 * d[i + 1] + 0.16 * d[i + 2];
      const v = bwCurve[clamp(l) | 0];
      // Very faint warm tint (selenium/paper)
      d[i] = clamp(v + 3); d[i + 1] = v; d[i + 2] = clamp(v - 4);
    }
  }

  function applyGrain(d, amount, w, h) {
    if (!amount) return;
    const strength = amount * 255;
    for (let i = 0; i < d.length; i += 4) {
      // Triangular-ish noise (sum of two uniform) reads more like film than white noise
      const n = (Math.random() + Math.random() - 1) * strength;
      d[i] = clamp(d[i] + n);
      d[i + 1] = clamp(d[i + 1] + n);
      d[i + 2] = clamp(d[i + 2] + n);
    }
  }

  function applyVignette(ctx, w, h, strength) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(30,15,10,0)');
    g.addColorStop(1, `rgba(30,15,10,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function applyLightLeak(ctx, w, h) {
    // Soft warm leak in one corner, very subtle
    const g = ctx.createRadialGradient(w * 0.95, h * 0.1, 0, w * 0.95, h * 0.1, w * 0.8);
    g.addColorStop(0, 'rgba(255,190,110,0.16)');
    g.addColorStop(0.5, 'rgba(255,150,120,0.05)');
    g.addColorStop(1, 'rgba(255,150,120,0)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  /**
   * Render `source` (image/video/canvas) into `target` canvas with a style applied.
   * `crop` = { sx, sy, sw, sh } optional source crop; `mirror` flips horizontally.
   */
  function render(source, target, styleId, opts) {
    opts = opts || {};
    const style = STYLES.find((s) => s.id === styleId) || STYLES[1];
    const w = opts.width || target.width;
    const h = opts.height || target.height;
    target.width = w; target.height = h;
    const ctx = target.getContext('2d', { willReadFrequently: true });
    ctx.save();
    if (opts.mirror) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    if (opts.crop) {
      const c = opts.crop; ctx.drawImage(source, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
    } else {
      ctx.drawImage(source, 0, 0, w, h);
    }
    ctx.restore();

    const img = ctx.getImageData(0, 0, w, h);
    const d = img.data;
    if (style.id === 'vintage') applyVintage(d);
    else if (style.id === 'bw') applyBW(d);
    applyGrain(d, style.grain, w, h);
    ctx.putImageData(img, 0, 0);

    if (style.id === 'vintage') { applyLightLeak(ctx, w, h); applyVignette(ctx, w, h, 0.38); }
    else if (style.id === 'bw') applyVignette(ctx, w, h, 0.45);
    else applyVignette(ctx, w, h, 0.12);
    return target;
  }

  /** Crop-to-cover: compute a source crop for target aspect ratio and zoom. */
  function coverCrop(srcW, srcH, aspect, zoom) {
    zoom = zoom || 1;
    let cw = srcW, ch = srcW / aspect;
    if (ch > srcH) { ch = srcH; cw = srcH * aspect; }
    cw /= zoom; ch /= zoom;
    return { sx: (srcW - cw) / 2, sy: (srcH - ch) / 2, sw: cw, sh: ch };
  }

  function canvasToBlob(canvas, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality || 0.86));
  }

  global.JDR = global.JDR || {};
  global.JDR.filters = { STYLES, DEFAULT_STYLE, render, coverCrop, canvasToBlob };
})(window);

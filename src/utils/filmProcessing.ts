import { PhotoStyleConfig, PhotoStyleId } from '../types';

export const PHOTO_STYLES: PhotoStyleConfig[] = [
  {
    id: 'vintage',
    name: 'Película Vintage',
    subtitle: 'Tono Cálido Dorado 35mm',
    description: 'Tonos dorados y cálidos con desvanecimiento suave, sombras levantadas y auténtico grano de película de 35mm.',
    badge: 'VINTAGE',
    filterClass: 'filter-vintage-film',
    contrast: 1.08,
    saturate: 1.15,
    sepia: 0.22,
    hueRotate: -5,
    brightness: 0.98,
    grainIntensity: 0.14,
    tintRgb: [255, 220, 160, 0.08], // subtle amber warm cast
  },
  {
    id: 'bw',
    name: 'Blanco & Negro Plata',
    subtitle: 'Haluro de Plata Clásico',
    description: 'Monocromo de alto contraste con grano rico en haluro de plata, negros profundos y viñeteado suave.',
    badge: 'MONO',
    filterClass: 'filter-bw-silver',
    contrast: 1.25,
    saturate: 0,
    sepia: 0.05,
    hueRotate: 0,
    brightness: 0.95,
    grainIntensity: 0.18,
    tintRgb: [240, 240, 245, 0.04],
  },
  {
    id: 'original',
    name: 'Analógico Natural',
    subtitle: 'Luz Natural Equilibrada',
    description: 'Colores vibrantes y naturales con sutil textura de papel y balance de exposición orgánico.',
    badge: 'NATURAL',
    filterClass: '',
    contrast: 1.02,
    saturate: 1.02,
    sepia: 0.02,
    hueRotate: 0,
    brightness: 1.0,
    grainIntensity: 0.06,
  },
  {
    id: 'rose',
    name: 'Rosa Vintage / Rubor',
    subtitle: 'París Romántico 1970',
    description: 'Matices románticos en rosa empolvado y melocotón inspirados en grabados editoriales vintage.',
    badge: 'ROMANCE',
    filterClass: 'filter-old-rose',
    contrast: 1.05,
    saturate: 1.1,
    sepia: 0.35,
    hueRotate: 315,
    brightness: 0.98,
    grainIntensity: 0.12,
    tintRgb: [225, 175, 190, 0.12], // dusty rose tint
  },
  {
    id: 'olive',
    name: 'Herbario Olivo',
    subtitle: 'Verde Botánico Moteado',
    description: 'Tonos terrosos y follaje suave de olivo, sombras cálidas y luces cremosas.',
    badge: 'BOTÁNICO',
    filterClass: 'filter-olive-herb',
    contrast: 1.1,
    saturate: 0.92,
    sepia: 0.25,
    hueRotate: 45,
    brightness: 0.96,
    grainIntensity: 0.12,
    tintRgb: [180, 200, 160, 0.1], // olive herb tint
  },
];

export function getStyleConfig(id: PhotoStyleId): PhotoStyleConfig {
  return PHOTO_STYLES.find((s) => s.id === id) || PHOTO_STYLES[0];
}

/**
 * Applies color grading and procedural film grain to an image element or canvas
 */
export async function processImageWithStyle(
  imageSource: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  styleId: PhotoStyleId,
  outputWidth = 1080,
  outputHeight = 1350
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const style = getStyleConfig(styleId);

  // Source aspect ratio handling (cover center crop)
  let sw: number;
  let sh: number;
  let sx = 0;
  let sy = 0;

  if (imageSource instanceof HTMLVideoElement) {
    sw = imageSource.videoWidth || 640;
    sh = imageSource.videoHeight || 480;
  } else if (imageSource instanceof HTMLImageElement) {
    sw = imageSource.naturalWidth || imageSource.width;
    sh = imageSource.naturalHeight || imageSource.height;
  } else {
    sw = imageSource.width;
    sh = imageSource.height;
  }

  const targetAspect = outputWidth / outputHeight;
  const sourceAspect = sw / sh;

  if (sourceAspect > targetAspect) {
    const cropWidth = sh * targetAspect;
    sx = (sw - cropWidth) / 2;
    sw = cropWidth;
  } else {
    const cropHeight = sw / targetAspect;
    sy = (sh - cropHeight) / 2;
    sh = cropHeight;
  }

  // Draw base image
  ctx.drawImage(imageSource, sx, sy, sw, sh, 0, 0, outputWidth, outputHeight);

  // Apply pixel manipulation for film response & color curve
  const imageData = ctx.getImageData(0, 0, outputWidth, outputHeight);
  const data = imageData.data;
  const grainAmount = style.grainIntensity * 255;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // Grayscale if B&W
    if (styleId === 'bw') {
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      r = gray;
      g = gray;
      b = gray;
    }

    // Vintage warm curve / sepia blend
    if (style.sepia > 0) {
      const sr = r * 0.393 + g * 0.769 + b * 0.189;
      const sg = r * 0.349 + g * 0.686 + b * 0.168;
      const sb = r * 0.272 + g * 0.534 + b * 0.131;
      const factor = style.sepia;
      r = r * (1 - factor) + sr * factor;
      g = g * (1 - factor) + sg * factor;
      b = b * (1 - factor) + sb * factor;
    }

    // Lift blacks (film fade characteristic)
    r = Math.min(255, r * style.contrast + 12);
    g = Math.min(255, g * style.contrast + 10);
    b = Math.min(255, b * style.contrast + 8);

    // Old Rose extra warmth
    if (styleId === 'rose') {
      r = Math.min(255, r * 1.08 + 10);
      b = Math.min(255, b * 0.96 + 4);
    }

    // Olive herb extra green earthiness
    if (styleId === 'olive') {
      g = Math.min(255, g * 1.05 + 6);
      b = Math.max(0, b * 0.92);
    }

    // Authentic Silver Halide Stochastic Film Grain
    if (grainAmount > 0) {
      const noise = (Math.random() - 0.5) * grainAmount;
      r = Math.min(255, Math.max(0, r + noise));
      g = Math.min(255, Math.max(0, g + noise));
      b = Math.min(255, Math.max(0, b + noise));
    }

    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }

  ctx.putImageData(imageData, 0, 0);

  // Soft Vignette Overlay
  const gradient = ctx.createRadialGradient(
    outputWidth / 2,
    outputHeight / 2,
    outputWidth * 0.35,
    outputWidth / 2,
    outputHeight / 2,
    outputWidth * 0.75
  );
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, styleId === 'bw' ? 'rgba(10, 10, 10, 0.28)' : 'rgba(44, 36, 30, 0.22)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, outputWidth, outputHeight);

  // Tint overlay if configured
  if (style.tintRgb) {
    const [tr, tg, tb, ta] = style.tintRgb;
    ctx.fillStyle = `rgba(${tr}, ${tg}, ${tb}, ${ta})`;
    ctx.fillRect(0, 0, outputWidth, outputHeight);
  }

  return canvas.toDataURL('image/jpeg', 0.92);
}

/**
 * Creates a ready-to-print or export full Polaroid frame with torn paper texture,
 * bottom handwritten text, author stamp and 'fond' watermark.
 */
export async function createPolaroidExport(
  photoUrl: string,
  author: string,
  caption?: string,
  dateStr = 'FR.1983'
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const pWidth = 1200;
      const pHeight = 1500;
      const margin = 70;
      const photoWidth = pWidth - margin * 2;
      const photoHeight = 1050;

      const canvas = document.createElement('canvas');
      canvas.width = pWidth;
      canvas.height = pHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(photoUrl);
        return;
      }

      // 1. Polaroid Paper Base (Ivory warm textured)
      ctx.fillStyle = '#FAF7F0';
      ctx.fillRect(0, 0, pWidth, pHeight);

      // Subtle paper border shadow
      ctx.strokeStyle = 'rgba(212, 163, 115, 0.3)';
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, pWidth - 8, pHeight - 8);

      // 2. Draw Photo
      ctx.drawImage(img, margin, margin, photoWidth, photoHeight);

      // Inner subtle border around image
      ctx.strokeStyle = 'rgba(44, 36, 30, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(margin, margin, photoWidth, photoHeight);

      // 3. Bottom Polaroid Information
      // Author & Event line
      ctx.fillStyle = '#2C241E';
      ctx.font = '500 32px "Manrope", Arial, sans-serif';
      ctx.fillText(author || 'Invitado Especial', margin + 10, photoHeight + margin + 65);

      // Date / Origin
      ctx.fillStyle = '#68795A';
      ctx.font = '400 24px "Manrope", Arial, sans-serif';
      ctx.fillText(dateStr, margin + 10, photoHeight + margin + 105);

      // Caption
      if (caption) {
        ctx.fillStyle = '#3D2B24';
        ctx.font = '34px "Patrick Hand", "Segoe Print", cursive';
        ctx.fillText(`"${caption}"`, margin + 10, photoHeight + margin + 160);
      }

      // Watermark "fond"
      ctx.fillStyle = 'rgba(44, 36, 30, 0.4)';
      ctx.font = 'italic 600 36px "Cormorant Garamond", serif';
      ctx.textAlign = 'right';
      ctx.fillText('fond', pWidth - margin - 15, pHeight - margin - 20);

      resolve(canvas.toDataURL('image/jpeg', 0.95));
    };
    img.onerror = () => resolve(photoUrl);
    img.src = photoUrl;
  });
}

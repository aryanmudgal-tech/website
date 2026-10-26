// Raster jobs from Aryan's own photos (source: "aryan"). They read Pictures/, which is untracked,
// so they run only on Aryan's machine; their outputs are committed.
import sharp from 'sharp';

/** Pencil on paper to a black-plus-alpha palette PNG, used as a mask, so it sits on any paper without a white box. */
export async function pencilAlpha(src, region, size) {
  const { data, info } = await sharp(src).extract(region).greyscale()
    .resize(size[0], size[1], { kernel: 'lanczos3' }).raw().toBuffer({ resolveWithObject: true });
  const out = Buffer.alloc(info.width * info.height * 4);
  for (let i = 0; i < info.width * info.height; i++) {
    // the scan's paper sits at L 209 to 226 (measured 26 October 2026), so 206 is the clear point: paper drops out, ink stays
    const a = Math.pow(Math.max(0, Math.min(1, (206 - data[i * info.channels]) / 142)), 0.82);
    out[i * 4 + 3] = Math.round(a * 255);
  }
  // black plus alpha, quantised to a 16-colour palette: the alpha is all the mask needs
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } }).png({ palette: true, colours: 16, compressionLevel: 9, effort: 10 }).toBuffer();
}

/**
 * A one-ink duotone plate: greyscale, normalised, levels and gamma lifted so it multiplies cleanly onto a stock.
 * crop is [x0, y0, x1, y1] as fractions of the image after resizing to width.
 */
export async function duotone(src, width, crop, size, quality = 74) {
  // sharp keeps only the last resize of a pipeline, so the first resize gets its own pass
  const { data: base, info: bi } = await sharp(src).resize({ width: Math.round(width) }).toBuffer({ resolveWithObject: true });
  const left = Math.round(crop[0] * bi.width), top = Math.round(crop[1] * bi.height);
  const w = Math.round((crop[2] - crop[0]) * bi.width), h = Math.round((crop[3] - crop[1]) * bi.height);
  let img = sharp(base).extract({ left, top, width: w, height: h }).greyscale().normalise({ lower: 1, upper: 99 });
  if (size) img = img.resize(size[0], size[1], { fit: 'fill' });
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.alloc(info.width * info.height);
  for (let i = 0; i < px.length; i++) px[i] = Math.round(255 * Math.pow(Math.min(1, Math.max(0, (data[i * info.channels] / 255 - 0.05) / 0.85)), 0.42));
  return sharp(px, { raw: { width: info.width, height: info.height, channels: 1 } }).jpeg({ quality, mozjpeg: true }).toBuffer();
}

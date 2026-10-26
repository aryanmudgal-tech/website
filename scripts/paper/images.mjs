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

/**
 * The social card (spec 5.8): the hero's own pieces composed on --paper at 1200x630, no text. librsvg does not load
 * file hrefs from an SVG passed as a buffer, so the photo and the handwriting go in as data URIs, and each paper
 * shape is nested from its committed SVG. Every piece turns about its own centre, as the hero's do.
 */
export async function ogCard({ photo, hand, paper, tokens }) {
  const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  const box = (svg) => svg.match(/viewBox="([^"]+)"/)[1];
  // a paper file nested at x, y, w, h; ids are prefixed so two nested files never share a filter
  let n = 0;
  const nest = (file, x, y, w, h, fill = '') => {
    const id = `p${n++}`;
    const body = inner(paper(file)).replace(/id="([^"]+)"/g, `id="${id}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${id}$1)`);
    return `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${box(paper(file))}" preserveAspectRatio="none">${fill ? `<g fill="${fill}">${body}</g>` : body}</svg>`;
  };
  const turn = (x, y, w, h, deg, body) => `<g transform="rotate(${deg} ${x + w / 2} ${y + h / 2})" filter="url(#lift)">${body}</g>`;
  const t = (name) => tokens[name];
  const png = `data:image/png;base64,${hand.toString('base64')}`;
  const jpg = `data:image/jpeg;base64,${photo.toString('base64')}`;
  const tape = (x, y, w, h, deg) => `<g transform="rotate(${deg} ${x + w / 2} ${y + h / 2})" opacity=".9">${nest('tape-a.svg', x, y, w, h, t('--tape'))}</g>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<defs><filter id="lift" x="-15%" y="-15%" width="130%" height="140%">
<feGaussianBlur in="SourceAlpha" stdDeviation="5" result="far"/><feOffset in="far" dy="6" result="farOff"/>
<feFlood flood-color="${t('--on-stock')}" flood-opacity=".14"/><feComposite in2="farOff" operator="in" result="farShadow"/>
<feGaussianBlur in="SourceAlpha" stdDeviation=".7" result="near"/><feOffset in="near" dy="1" result="nearOff"/>
<feFlood flood-color="${t('--on-stock')}" flood-opacity=".22"/><feComposite in2="nearOff" operator="in" result="nearShadow"/>
<feMerge><feMergeNode in="farShadow"/><feMergeNode in="nearShadow"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="1200" height="630" fill="${t('--paper')}"/>
${turn(330, 79, 620, 520, -1, nest('sky.outer.svg', 330, 79, 620, 520, t('--fibre')) + nest('sky.inner.svg', 330, 79, 620, 520, t('--stock-sky')))}
${turn(300, 274, 64, 320, 0.5, nest('braille.outer.svg', 300, 274, 64, 320, t('--fibre')) + nest('braille.inner.svg', 300, 274, 64, 320, t('--stock-leaf')) + nest('braille.dots.svg', 300, 274, 64, 320))}
${turn(420, 104, 380, 470, 1.2, `<rect x="420" y="104" width="380" height="470" fill="${t('--fibre')}"/><image x="430" y="114" width="360" height="450" preserveAspectRatio="xMidYMid slice" href="${jpg}"/>` + tape(504, 91, 88, 26, -3))}
${turn(760, 480, 144, 124, -2, nest('plan.outer.svg', 760, 480, 144, 124, t('--fibre')) + nest('plan.inner.svg', 760, 480, 144, 124, t('--stock-kraft')) + nest('plan.pencil.svg', 769, 494, 127, 100))}
${turn(628, 22, 156, 120, 2, nest('hand.outer.svg', 628, 22, 156, 120, t('--fibre')) + `<image x="649" y="28" width="113" height="110" preserveAspectRatio="none" href="${png}"/>` + tape(608, 24, 64, 20, -20))}
</svg>`;
  return sharp(Buffer.from(svg)).flatten({ background: t('--paper') }).jpeg({ quality: 82, mozjpeg: true }).toBuffer();
}

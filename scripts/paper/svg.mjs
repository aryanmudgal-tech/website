// SVG document writers for the paper assets. Masks carry no colour; colour files carry 6-digit token hex.
const head = (w, h) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">`;

export const path = (d) => `<path d="${d}"/>`;

/** A mask: default black fill, no colour literal. body is SVG markup. */
export function maskDoc(w, h, body) {
  return `${head(w, h)}${body}</svg>\n`;
}

/** A pencil mask: the body under the graphite filter, so the mask's alpha carries the pencil texture. */
export function pencilDoc(w, h, body) {
  return `${head(w, h)}<filter id="g" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="4" result="t"/><feColorMatrix in="t" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 2.0" result="m"/><feComposite in="SourceGraphic" in2="m" operator="in"/></filter><g filter="url(#g)">${body}</g></svg>\n`;
}

/** A coloured file: the body sets its own fills from token hex. */
export function colourDoc(w, h, body) {
  return `${head(w, h)}${body}</svg>\n`;
}

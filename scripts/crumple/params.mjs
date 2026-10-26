// Crumple tuning. Lengths are in CSS px unless they are fractions of the band height.
export const PARAMS = {
  common: {
    frames: 18,
    rollFrames: 8,       // one turn of the finished ball
    seg: 2.5,            // mesh spacing
    cell: 0.24,          // crease size, x band height
    creaseDensity: 1.25,
    pull: 0.45,          // in-plane take-up around a crease
    wrinkle: 1.0,        // crease amplitude once fully wrinkled
    wrinkleBy: 0.32,     // progress by which the whole band is wrinkled
    wrinkleFloor: 0.0,
    wrinkleNear: 0.9,    // extra crumpling where the paper enters the ball
    feedStart: 0.10, feedEnd: 0.0, feedPow: 1.25,
    enterF: 0.06,        // the pinch and lift at the ball engage over this much feed
    lam: 0.9,            // how far from the ball the tails lift and pinch, x band height
    db: 0.7,             // length of paper being folded into the ball, x band height
    pinch: 0.45, nearPull: 0.25, r0: 0.3,
    mapScale: 3.2, mapScale2: 0.6, mapAmp2: 0.12, mapUp: 0.0,
    rMin: 0.92, rRidge: 0.08, rLayer: 0.05, ridgeF: 1.6, ballCrease: 0.45, facets: 30, sphereCreases: 150, sphereCrease: 0.6,
    light: [-0.22, 0.5, 0.84],
    key: 0.78,
    aoR: 18, aoK: 1.35,
    shStep: 2.0, shSoft: 2.6, shK: 0.75,
  },
  d: {},
  m: { seg: 1.6, aoR: 12, shStep: 1.2, shSoft: 1.8 },
};

/** Frame progress values. The pinch at the ball engages quickly once feeding starts (t 0.10 to 0.2), so that stretch
 *  gets four frames instead of two; the rest is even. The page places each frame at its own t, so scroll speed maps
 *  linearly to crumple progress and the denser onset only adds steps, it does not slow anything. */
export function frameTimes(n) {
  const onset = [0.056, 0.12, 0.145, 0.17, 0.2];
  const rest = n - onset.length, ts = [...onset];
  for (let i = 1; i <= rest; i++) ts.push(+(0.2 + 0.8 * i / rest).toFixed(4));
  return ts;
}

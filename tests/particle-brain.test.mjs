import assert from "node:assert/strict";
import test from "node:test";

import {
  createBrainModel,
  interpolateScene,
  particleBudget,
} from "../src/lib/particle-brain.mjs";

const modelOptions = { seed: 20260721, count: 64 };

test("brain particles are deterministic for identical options", () => {
  const first = createBrainModel(modelOptions);
  const second = createBrainModel(modelOptions);

  assert.deepEqual(first.slice(0, 20), second.slice(0, 20));
});

test("brain particles change when the seed changes", () => {
  const first = createBrainModel(modelOptions);
  const second = createBrainModel({ ...modelOptions, seed: 20260722 });

  assert.notDeepEqual(first.slice(0, 20), second.slice(0, 20));
});

test("every brain particle exposes finite model values", () => {
  const particles = createBrainModel(modelOptions);

  for (const point of particles) {
    for (const key of ["x", "y", "cluster", "tone", "phase"]) {
      assert.equal(Number.isFinite(point[key]), true, `${key} must be finite`);
    }
  }
});

test("particle budgets adapt at the approved viewport boundaries", () => {
  assert.equal(particleBudget(320, true), 420);
  assert.equal(particleBudget(1440, true), 420);
  assert.equal(particleBudget(639, false), 420);
  assert.equal(particleBudget(640, false), 800);
  assert.equal(particleBudget(1023, false), 800);
  assert.equal(particleBudget(1024, false), 1400);
});

test("scene interpolation clamps progress and returns finite camera values", () => {
  const frames = [
    { x: -0.5, y: 0.25, zoom: 1, clusterMix: 0 },
    { x: 0.25, y: -0.5, zoom: 2.4, clusterMix: 1 },
  ];

  assert.deepEqual(interpolateScene(frames, -1), frames[0]);
  assert.deepEqual(interpolateScene(frames, 2), frames[1]);

  const interpolated = interpolateScene(frames, 0.5);
  for (const key of ["x", "y", "zoom", "clusterMix"]) {
    assert.equal(Number.isFinite(interpolated[key]), true, `${key} must be finite`);
  }
});

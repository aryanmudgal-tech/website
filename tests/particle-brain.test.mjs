import assert from "node:assert/strict";
import test from "node:test";

import {
  createBridgeEdges,
  createBrainModel,
  interpolateScene,
  leadershipAccent,
  PARTICLE_SHAPES,
  particleBudget,
  particleShapeState,
} from "../src/lib/particle-brain.mjs";

const modelOptions = { seed: 20260721, count: 64 };

test("the six chapters expose the approved semantic micro-shapes", () => {
  assert.deepEqual(PARTICLE_SHAPES, [
    "triangle",
    "square",
    "diamond",
    "ring",
    "hexagon",
    "dot",
  ]);

  PARTICLE_SHAPES.forEach((shape, index) => {
    assert.deepEqual(particleShapeState(index), {
      fromShape: shape,
      toShape: shape,
      amount: 0,
    });
  });
});

test("shape state exposes a clamped continuous transition", () => {
  assert.deepEqual(particleShapeState(-1), {
    fromShape: "triangle",
    toShape: "triangle",
    amount: 0,
  });
  assert.deepEqual(particleShapeState(1.5), {
    fromShape: "square",
    toShape: "diamond",
    amount: 0.5,
  });
  assert.deepEqual(particleShapeState(Number.POSITIVE_INFINITY), {
    fromShape: "dot",
    toShape: "dot",
    amount: 0,
  });
});

test("brain particles are deterministic for identical options", () => {
  const first = createBrainModel(modelOptions);
  const second = createBrainModel(modelOptions);

  assert.equal(first.length, modelOptions.count);
  assert.equal(second.length, modelOptions.count);
  assert.ok(first.length >= 20, "the deterministic sample requires at least twenty particles");
  assert.deepEqual(first.slice(0, 20), second.slice(0, 20));
});

test("brain particles change when the seed changes", () => {
  const first = createBrainModel(modelOptions);
  const second = createBrainModel({ ...modelOptions, seed: 20260722 });

  assert.notDeepEqual(first.slice(0, 20), second.slice(0, 20));
});

test("every brain particle exposes finite model values", () => {
  const particles = createBrainModel({ seed: modelOptions.seed, count: 1400 });
  const clusterIds = new Set();

  for (const point of particles) {
    for (const key of ["x", "y", "cluster", "tone", "phase"]) {
      assert.equal(Number.isFinite(point[key]), true, `${key} must be finite`);
    }
    assert.ok(point.x >= -1 && point.x <= 1, `x must stay inside model bounds: ${point.x}`);
    assert.ok(point.y >= -1 && point.y <= 1, `y must stay inside model bounds: ${point.y}`);
    assert.ok(Number.isInteger(point.cluster), `cluster must be an integer ID: ${point.cluster}`);
    clusterIds.add(point.cluster);
  }

  assert.deepEqual([...clusterIds].sort((left, right) => left - right), [0, 1, 2, 3, 4, 5]);
});

test("bridge edges deterministically connect representative adjacent clusters", () => {
  const particles = createBrainModel({ seed: modelOptions.seed, count: 1400 });
  const first = createBridgeEdges(particles, 3);
  const second = createBridgeEdges(particles, 3);

  assert.deepEqual(first, second);
  assert.equal(first.length, 15);
  for (const edge of first) {
    assert.equal(edge.toCluster, edge.fromCluster + 1);
    assert.equal(particles[edge.from].cluster, edge.fromCluster);
    assert.equal(particles[edge.to].cluster, edge.toCluster);
    assert.equal(Number.isFinite(edge.phase), true);
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

test("leadership accent stays fully present at the settled leadership scene", () => {
  assert.equal(leadershipAccent(3), 0);
  assert.equal(leadershipAccent(3.5), 0.5);
  assert.equal(leadershipAccent(4), 1);
  assert.equal(leadershipAccent(4.5), 0.5);
  assert.equal(leadershipAccent(5), 0);
});

test("scene interpolation clamps progress and returns finite camera values", () => {
  const frames = [
    { x: 0, y: 0, zoom: 1, clusterMix: 0 },
    { x: 4, y: -4, zoom: 2, clusterMix: 1 },
    { x: 8, y: 4, zoom: 3, clusterMix: 2 },
  ];

  assert.deepEqual(interpolateScene(frames, -1), frames[0]);
  assert.deepEqual(interpolateScene(frames, 3), frames[2]);
  assert.deepEqual(interpolateScene(frames, Number.POSITIVE_INFINITY), frames[2]);
  assert.deepEqual(interpolateScene(frames, Number.NEGATIVE_INFINITY), frames[0]);
  assert.deepEqual(interpolateScene(frames, Number.NaN), frames[0]);
  assert.deepEqual(interpolateScene(frames, 0), frames[0]);
  assert.deepEqual(interpolateScene(frames, 1), frames[1]);
  assert.deepEqual(interpolateScene(frames, 2), frames[2]);

  assert.deepEqual(interpolateScene(frames, 0.5), {
    x: 2,
    y: -2,
    zoom: 1.5,
    clusterMix: 0.5,
  });
  assert.deepEqual(interpolateScene(frames, 1.5), {
    x: 6,
    y: 0,
    zoom: 2.5,
    clusterMix: 1.5,
  });

  const interpolated = interpolateScene(frames, 0.75);
  for (const key of ["x", "y", "zoom", "clusterMix"]) {
    assert.equal(Number.isFinite(interpolated[key]), true, `${key} must be finite`);
    const endpoints = [frames[0][key], frames[1][key]];
    assert.ok(
      interpolated[key] >= Math.min(...endpoints) && interpolated[key] <= Math.max(...endpoints),
      `${key} must not overshoot its adjacent frames`,
    );
  }
});

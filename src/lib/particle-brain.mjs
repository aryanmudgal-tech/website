const CLUSTER_CENTERS = Object.freeze([
  Object.freeze({ x: -0.035, y: -0.035 }),
  Object.freeze({ x: -0.5, y: -0.43 }),
  Object.freeze({ x: 0.08, y: -0.55 }),
  Object.freeze({ x: 0.52, y: -0.2 }),
  Object.freeze({ x: -0.5, y: 0.12 }),
  Object.freeze({ x: 0.035, y: 0.035 }),
]);

const SCENE_ZOOMS = Object.freeze([0.88, 2.2, 2.45, 2.6, 2.25, 0.9]);
const SCENE_FRAMES = Object.freeze(CLUSTER_CENTERS.map((center, cluster) => Object.freeze({
  x: center.x,
  y: center.y,
  zoom: SCENE_ZOOMS[cluster],
  clusterMix: cluster,
})));

function mulberry32(seed) {
  let state = seed >>> 0;

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function isInsideBrain(x, y) {
  const leftLobe = ((x + 0.27) / 0.72) ** 2 + ((y + 0.04) / 0.9) ** 2 <= 1;
  const rightLobe = ((x - 0.27) / 0.72) ** 2 + ((y + 0.04) / 0.9) ** 2 <= 1;
  if (!leftLobe && !rightLobe) return false;

  const lowerTaper = y <= 0.42 || Math.abs(x) <= 0.78 - (y - 0.42) * 0.72;
  const centerCleft = y > -0.92 || Math.abs(x) > (-0.92 - y) * 1.8;
  return lowerTaper && centerCleft;
}

function closestCluster(x, y) {
  let closest = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (let index = 0; index < CLUSTER_CENTERS.length; index += 1) {
    const center = CLUSTER_CENTERS[index];
    const distance = (x - center.x) ** 2 + (y - center.y) ** 2;
    if (distance < closestDistance) {
      closest = index;
      closestDistance = distance;
    }
  }

  return closest;
}

export function createBrainModel({ seed = 1, count = 1400 } = {}) {
  const random = mulberry32(Number.isFinite(seed) ? seed : 1);
  const targetCount = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const particles = [];

  while (particles.length < targetCount) {
    const x = random() * 2 - 1;
    const y = random() * 2 - 1;
    if (!isInsideBrain(x, y)) continue;

    particles.push({
      x,
      y,
      cluster: closestCluster(x, y),
      tone: random(),
      phase: particles.length % 2,
    });
  }

  return particles;
}

export function particleBudget(width, reducedMotion = false) {
  if (reducedMotion || width < 640) return 420;
  if (width < 1024) return 800;
  return 1400;
}

export function interpolateScene(frames, progress) {
  if (!Array.isArray(frames) || frames.length === 0) {
    return { x: 0, y: 0, zoom: 1, clusterMix: 0 };
  }

  const maximum = frames.length - 1;
  const normalizedProgress = progress === Number.POSITIVE_INFINITY
    ? maximum
    : Number.isFinite(progress)
      ? progress
      : 0;
  const clampedProgress = Math.min(Math.max(normalizedProgress, 0), maximum);
  const startIndex = Math.floor(clampedProgress);
  const endIndex = Math.min(startIndex + 1, maximum);
  const amount = clampedProgress - startIndex;
  const start = frames[startIndex];
  const end = frames[endIndex];

  return {
    x: start.x + (end.x - start.x) * amount,
    y: start.y + (end.y - start.y) * amount,
    zoom: start.zoom + (end.zoom - start.zoom) * amount,
    clusterMix: start.clusterMix + (end.clusterMix - start.clusterMix) * amount,
  };
}

function sceneProgress(sceneElements) {
  if (sceneElements.length < 2) return 0;

  const viewportCenter = window.innerHeight / 2;
  const centers = sceneElements.map((element) => {
    const bounds = element.getBoundingClientRect();
    return bounds.top + bounds.height / 2;
  });

  if (viewportCenter <= centers[0]) return 0;
  const lastIndex = centers.length - 1;
  if (viewportCenter >= centers[lastIndex]) return lastIndex;

  for (let index = 0; index < lastIndex; index += 1) {
    if (viewportCenter > centers[index + 1]) continue;
    const relativePosition = viewportCenter - centers[index];
    const interval = centers[index + 1] - centers[index];
    return index + relativePosition / Math.max(interval, 1);
  }

  return lastIndex;
}

function trianglePath(context, x, y, radius, phase) {
  const direction = phase === 0 ? -1 : 1;
  context.moveTo(x, y + direction * radius);
  context.lineTo(x - radius * 0.86, y - direction * radius * 0.55);
  context.lineTo(x + radius * 0.86, y - direction * radius * 0.55);
  context.closePath();
}

function clusterBlend(clusterMix) {
  const lastCluster = CLUSTER_CENTERS.length - 1;
  const clampedMix = Math.min(Math.max(clusterMix, 0), lastCluster);
  const fromCluster = Math.floor(clampedMix);
  const toCluster = Math.min(fromCluster + 1, lastCluster);

  return {
    fromCluster,
    toCluster,
    amount: clampedMix - fromCluster,
  };
}

export function initParticleBrain(canvas, sceneElements) {
  const context = canvas.getContext("2d");
  if (!context) {
    document.documentElement.classList.add("brain-unavailable");
    return () => {};
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const frames = SCENE_FRAMES.slice(0, Math.max(1, sceneElements.length));
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let particles = [];
  let animationId = null;
  let resizeTimer = null;
  let canvasVisible = true;
  let observer = null;
  let tornDown = false;

  function resizeCanvas() {
    width = Math.max(canvas.clientWidth || window.innerWidth, 1);
    height = Math.max(canvas.clientHeight || window.innerHeight, 1);
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(width * pixelRatio);
    canvas.height = Math.floor(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    particles = createBrainModel({
      seed: 20260721,
      count: particleBudget(width, reducedMotion.matches),
    });
  }

  function modelPoint(point, frame, transitionAmount) {
    const center = CLUSTER_CENTERS[point.cluster];
    const clusterStrength = Math.max(0, 1 - Math.abs(point.cluster - frame.clusterMix));
    const spread = transitionAmount * (0.045 + point.tone * 0.035) * clusterStrength;
    const modelX = point.x + (point.x - center.x) * spread;
    const modelY = point.y + (point.y - center.y) * spread;
    const scale = Math.min(width, height) * 0.46 * frame.zoom;

    return {
      x: width / 2 + (modelX - frame.x) * scale,
      y: height / 2 + (modelY - frame.y) * scale,
      scale,
    };
  }

  function drawConnectionField(frame, transitionAmount, cluster, weight, color) {
    if (weight <= 0) return;

    const activeParticles = particles.filter((point) => point.cluster === cluster);
    const threshold = 0.17 / Math.max(frame.zoom, 1);

    context.strokeStyle = color;
    context.lineWidth = 0.65;
    context.globalAlpha = (0.045 + transitionAmount * 0.045) * weight;
    context.beginPath();

    for (let index = 0; index < activeParticles.length; index += 1) {
      const point = activeParticles[index];
      const start = modelPoint(point, frame, transitionAmount);
      const neighborhoodEnd = Math.min(index + 14, activeParticles.length);

      for (let neighborIndex = index + 1; neighborIndex < neighborhoodEnd; neighborIndex += 1) {
        const neighbor = activeParticles[neighborIndex];
        const distance = Math.hypot(point.x - neighbor.x, point.y - neighbor.y);
        if (distance > threshold) continue;
        const end = modelPoint(neighbor, frame, transitionAmount);
        context.moveTo(start.x, start.y);
        context.lineTo(end.x, end.y);
      }
    }

    context.stroke();
  }

  function drawConnections(frame, transitionAmount, blend) {
    const fromWeight = 1 - blend.amount;
    const toWeight = blend.amount;

    drawConnectionField(frame, transitionAmount, blend.fromCluster, fromWeight, "#15846e");
    if (blend.toCluster !== blend.fromCluster) {
      drawConnectionField(frame, transitionAmount, blend.toCluster, toWeight, "#15846e");
    }

    if (transitionAmount > 0) {
      drawConnectionField(
        frame,
        transitionAmount,
        blend.fromCluster,
        fromWeight * transitionAmount * 0.65,
        "#ffb829",
      );
      drawConnectionField(
        frame,
        transitionAmount,
        blend.toCluster,
        toWeight * transitionAmount,
        "#ffb829",
      );
    }
  }

  function strokeParticle(point, projected, radius, color, alpha, lineWidth) {
    context.strokeStyle = color;
    context.globalAlpha = alpha;
    context.lineWidth = lineWidth;
    context.beginPath();
    trianglePath(context, projected.x, projected.y, radius, point.phase);
    context.stroke();
  }

  function renderFrame(frame) {
    const blend = clusterBlend(frame.clusterMix);
    const transitionAmount = Math.sin(blend.amount * Math.PI);
    context.clearRect(0, 0, width, height);
    drawConnections(frame, transitionAmount, blend);

    for (const point of particles) {
      const projected = modelPoint(point, frame, transitionAmount);
      const clusterDistance = Math.abs(point.cluster - frame.clusterMix);
      const clusterStrength = Math.max(0, 1 - clusterDistance);
      const radius = (0.85 + point.tone * 1.15 + clusterStrength * 1.65 + transitionAmount * 0.45)
        * Math.min(Math.max(frame.zoom * 0.72, 0.8), 1.8);

      strokeParticle(
        point,
        projected,
        radius,
        point.tone > 0.82 ? "#15846e" : "#bdbdbd",
        0.12 + point.tone * 0.16,
        0.65,
      );

      if (clusterStrength > 0) {
        strokeParticle(
          point,
          projected,
          radius,
          "#8052ff",
          clusterStrength * 0.62,
          0.65 + clusterStrength * 0.7,
        );
      }

      if (clusterStrength > 0 && transitionAmount > 0) {
        strokeParticle(
          point,
          projected,
          radius,
          "#ffb829",
          clusterStrength * transitionAmount * 0.38,
          0.7 + clusterStrength * 0.7,
        );
      }
    }

    context.globalAlpha = 1;
  }

  resizeCanvas();

  const teardown = () => {
    tornDown = true;
    if (animationId !== null) cancelAnimationFrame(animationId);
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    observer?.disconnect();
    window.removeEventListener("resize", handleResize);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    reducedMotion.removeEventListener("change", handleMotionPreferenceChange);
  };

  function animate() {
    animationId = null;
    if (document.hidden) return;
    if (!canvasVisible) return;
    if (reducedMotion.matches) return;

    const progress = sceneProgress(sceneElements);
    const frame = interpolateScene(frames, progress);
    renderFrame(frame);
    animationId = requestAnimationFrame(animate);
  }

  function handleResize() {
    if (resizeTimer !== null) clearTimeout(resizeTimer);
    resizeTimer = setTimeout(finishResize, 120);
  }

  function finishResize() {
    resizeTimer = null;
    resizeCanvas();
    if (reducedMotion.matches) {
      const frame = interpolateScene(frames, 0);
      renderFrame(frame);
      return;
    }
    if (!tornDown && !document.hidden && canvasVisible && animationId === null) {
      animationId = requestAnimationFrame(animate);
    }
  }

  window.addEventListener("resize", handleResize);
  observer = new IntersectionObserver((entries) => {
    canvasVisible = entries[0].isIntersecting;
    if (canvasVisible) {
      if (!tornDown && !document.hidden && !reducedMotion.matches && animationId === null) {
        animationId = requestAnimationFrame(animate);
      }
    } else if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  });
  observer.observe(canvas);

  document.addEventListener("visibilitychange", handleVisibilityChange);
  function handleVisibilityChange() {
    if (!document.hidden && canvasVisible && !reducedMotion.matches) {
      if (!tornDown && animationId === null) animationId = requestAnimationFrame(animate);
    } else if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }
  }

  reducedMotion.addEventListener("change", handleMotionPreferenceChange);
  function handleMotionPreferenceChange() {
    if (animationId !== null) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    resizeCanvas();
    if (reducedMotion.matches) {
      const frame = interpolateScene(frames, 0);
      renderFrame(frame);
      return;
    }

    if (!tornDown && !document.hidden && canvasVisible) {
      animationId = requestAnimationFrame(animate);
    }
  }

  if (reducedMotion.matches) {
    const frame = interpolateScene(frames, 0);
    renderFrame(frame);
  } else {
    animationId = requestAnimationFrame(animate);
  }
  return teardown;
}

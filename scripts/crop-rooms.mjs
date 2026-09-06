import { copyFile, mkdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { extras, ogRoom, rooms } from "../src/data/rooms.ts";

const root = resolve(import.meta.dirname, "..");
const sources = resolve(root, "Pictures");
const roomsOut = resolve(root, "src", "assets", "rooms");
const fullOut = resolve(root, "src", "assets", "full");
const publicOut = resolve(root, "public");

const ROOM_RATIO = 3 / 2;
const ROOM_MAX_WIDTH = 1440;
const FULL_MAX_SIDE = 1600;
const REGISTER = { x: 0.5, y: 0.4 };
const DEFAULT_MIN_COVER = 0.7;
const PAPER = { r: 243, g: 242, b: 238 };

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/**
 * Crop of the given aspect ratio that puts the focal point at the registration point when the
 * source allows it, zooming in no further than minCover of the source height.
 */
function cropBox(width, height, ratio, focal, register, minCover) {
  const maxHeight = Math.min(height, Math.floor(width / ratio));
  const exactHeights = [
    (focal.y * height) / register.y,
    ((1 - focal.y) * height) / (1 - register.y),
    (focal.x * width) / register.x / ratio,
    ((1 - focal.x) * width) / (1 - register.x) / ratio,
  ];
  const exact = Math.min(maxHeight, ...exactHeights);
  const floor = Math.min(maxHeight, minCover * height);
  const cropHeight = Math.floor(Math.max(exact, floor));
  const cropWidth = Math.floor(cropHeight * ratio);
  const left = clamp(Math.round(focal.x * width - register.x * cropWidth), 0, width - cropWidth);
  const top = clamp(Math.round(focal.y * height - register.y * cropHeight), 0, height - cropHeight);
  return { left, top, width: cropWidth, height: cropHeight };
}

async function writeRoom(room) {
  const input = resolve(sources, room.source);
  if (!(await exists(input))) throw new Error(`missing source photo: ${room.source}`);
  const image = sharp(input, { failOn: "none" }).rotate();
  const { width, height } = await image.metadata();
  const out = resolve(roomsOut, `${room.id}.jpg`);

  if (room.fit === "contain") {
    const targetWidth = Math.min(ROOM_MAX_WIDTH, Math.round(Math.max(width, height * ROOM_RATIO)));
    const targetHeight = Math.round(targetWidth / ROOM_RATIO);
    await image
      .flatten({ background: PAPER })
      .resize(targetWidth, targetHeight, { fit: "contain", background: PAPER })
      .jpeg({ quality: 84, mozjpeg: true })
      .toFile(out);
    return { out, faceY: null };
  }

  const box = cropBox(width, height, ROOM_RATIO, room.focal, REGISTER, room.minCover ?? DEFAULT_MIN_COVER);
  await image
    .extract(box)
    .resize({ width: Math.min(ROOM_MAX_WIDTH, box.width), withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true })
    .toFile(out);
  const faceY = (room.focal.y * height - box.top) / box.height;
  return { out, faceY };
}

async function writeFull(item) {
  const input = resolve(sources, item.source);
  if (!(await exists(input))) throw new Error(`missing source photo: ${item.source}`);
  const out = resolve(fullOut, `${item.id}.jpg`);
  await sharp(input, { failOn: "none" })
    .rotate()
    .flatten({ background: PAPER })
    .resize({ width: FULL_MAX_SIDE, height: FULL_MAX_SIDE, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  return out;
}

async function writeOg() {
  const room = rooms.find((candidate) => candidate.id === ogRoom);
  const input = resolve(sources, room.source);
  const image = sharp(input, { failOn: "none" }).rotate();
  const { width, height } = await image.metadata();
  const box = cropBox(width, height, 1200 / 630, room.focal, { x: 0.5, y: 0.45 }, 0.6);
  const out = resolve(publicOut, "og.jpg");
  await image.extract(box).resize(1200, 630, { fit: "fill" }).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  return out;
}

await mkdir(roomsOut, { recursive: true });
await mkdir(fullOut, { recursive: true });
await mkdir(publicOut, { recursive: true });

for (const room of rooms) {
  const { out, faceY } = await writeRoom(room);
  const written = await sharp(out).metadata();
  const face = faceY === null ? "contain" : `face at ${(faceY * 100).toFixed(0)}% of height`;
  console.log(`room  ${room.id.padEnd(11)} ${String(written.width).padStart(4)}x${written.height}  ${face}`);
}
for (const item of [...rooms, ...extras]) {
  const out = await writeFull(item);
  const written = await sharp(out).metadata();
  console.log(`full  ${item.id.padEnd(16)} ${written.width}x${written.height}`);
}
console.log(`og    ${await writeOg()}`);

const resumeSource = resolve(sources, "resume.pdf");
if (await exists(resumeSource)) {
  await copyFile(resumeSource, resolve(publicOut, "resume.pdf"));
  console.log("resume copied to public/resume.pdf");
}

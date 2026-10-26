// Writes tests/fixtures/copy-v3.json: every served string of the v3 data, so v4 cannot change copy by accident.
// Run once before any data edit. Regenerate only in a commit that applies a content change Aryan approved.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const portfolio = await import("../src/data/portfolio.ts");
const { rooms, extras } = await import("../src/data/rooms.ts");
const pick = (object, keys) => Object.fromEntries(keys.map((key) => [key, object[key]]));

const copy = {
  portfolio: Object.fromEntries(Object.entries(portfolio).filter(([key]) => key !== "titleBlock")),
  rooms: rooms.map((room) => pick(room, ["id", "caption", "alt", "receipt", "source"])),
  extras: extras.map((extra) => pick(extra, ["id", "caption", "alt", "source", "room"])),
};
const file = join(root, "tests", "fixtures", "copy-v3.json");
mkdirSync(dirname(file), { recursive: true });
writeFileSync(file, `${JSON.stringify(copy, null, 2)}\n`);
console.log("wrote tests/fixtures/copy-v3.json");

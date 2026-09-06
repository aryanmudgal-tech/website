export type Focal = { readonly x: number; readonly y: number };

export type Receipt = {
  readonly label: string;
  readonly href: string;
};

export type ChapterId =
  | "hero"
  | "dots"
  | "armie"
  | "streamfair"
  | "wod"
  | "safeline"
  | "research"
  | "chancellor"
  | "pillar"
  | "pbk"
  | "contact";

export type Room = {
  /** Output filename stem and the value of data-room on the chapter that owns it. */
  readonly id: ChapterId;
  /** Path under Pictures/ (untracked). */
  readonly source: string;
  /** Face center as fractions of the source width and height. */
  readonly focal: Focal;
  /**
   * Smallest share of the source height the crop may keep while chasing registration.
   * 1 keeps the whole photo (plaques and certificates stay legible); lower values zoom toward the face.
   */
  readonly minCover?: number;
  /** "contain" letterboxes on the paper color instead of cropping (used for the drawing). */
  readonly fit?: "cover" | "contain";
  readonly alt: string;
  readonly caption: string;
  readonly receipt: Receipt;
};

export type Extra = {
  readonly id: string;
  readonly source: string;
  readonly alt: string;
  readonly caption: string;
  /** The room whose popover shows this extra. */
  readonly room: ChapterId;
};

export const rooms: readonly Room[] = [
  {
    id: "hero",
    source: "LA-hacks/IMG_9046.jpg",
    focal: { x: 0.65, y: 0.5 },
    alt: "Aryan demoing the Dots iOS app on a phone to two people at a table at LA Hacks, with a Create Prototype Present sign behind him",
    caption: "LA Hacks, UCLA, April 2026. Demoing Dots. 1st, Catalyst for Care track.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/dots-y5r21j" },
  },
  {
    id: "dots",
    source: "LA-hacks/IMG_9063.jpg",
    focal: { x: 0.595, y: 0.32 },
    minCover: 0.9,
    alt: "Team Dots holding two award boxes and a shirt under the LA Hacks 2026 banner at Pauley Pavilion",
    caption: "LA Hacks, UCLA, April 2026. Team Dots with two track awards.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/dots-y5r21j" },
  },
  {
    id: "armie",
    source: "MIT-win/mit-armie-arm.png",
    focal: { x: 0.59, y: 0.42 },
    alt: "A teammate holding the 3D-printed ARMIE robot arm with red servos while Aryan gestures at it during MIT Reality Hack",
    caption: "MIT Reality Hack, January 2026. Building ARMIE, the robot arm.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/armie" },
  },
  {
    id: "streamfair",
    source: "CMU-win/cmu-streamfair-stage.jpg",
    focal: { x: 0.506, y: 0.625 },
    fit: "contain",
    alt: "Aryan and two teammates on stage at TartanHacks under a slide reading RIPPLE 1st place, Water Mellon",
    caption: "TartanHacks, Carnegie Mellon, February 2026. 1st, Ripple track.",
    receipt: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/StreamFair" },
  },
  {
    id: "wod",
    source: "stanford-win/stanford-wod-selfie.png",
    focal: { x: 0.27, y: 0.475 },
    alt: "Aryan grinning in a selfie with a teammate and the game-console prize boxes after winning the Moonlake track at Immerse The Bay",
    caption: "Immerse The Bay, Stanford XR, November 2025. Best Creation on Moonlake.",
    receipt: { label: "Devpost", href: "https://devpost.com/software/c-o-r-e" },
  },
  {
    id: "safeline",
    source: "YC-hackathon/yc-safeline-stage.png",
    focal: { x: 0.53, y: 0.37 },
    minCover: 0.85,
    alt: "Aryan presenting Safeline with a microphone on a small stage between two projector screens showing an incident report portal",
    caption: "YC Voice Agents Hackathon, San Francisco, May 2026. Demoing Safeline.",
    receipt: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/safeline" },
  },
  {
    id: "research",
    source: "Research/research-portrait.jpg",
    focal: { x: 0.53, y: 0.22 },
    minCover: 0.6,
    alt: "Aryan in a black hoodie standing in a lab room at the University at Buffalo",
    caption: "University at Buffalo, 2025. Research assistant, fetomaternal hemorrhage detection.",
    receipt: { label: "Resume", href: "resume.pdf" },
  },
  {
    id: "pillar",
    source: "Pillars-award/innovative-student-leader-award-3.png",
    focal: { x: 0.53, y: 0.23 },
    minCover: 1,
    alt: "Aryan holding the Pillar of Leadership plaque for the Innovative Student Leadership Award in front of a University at Buffalo backdrop",
    caption: "University at Buffalo, April 2026. Award for Innovative Student Leadership.",
    receipt: { label: "UB Student Life", href: "https://www.buffalo.edu/studentlife/life-on-campus/clubs-and-activities/event-calendars/ceremonies-and-celebrations/leadership-awards.html" },
  },
  {
    id: "chancellor",
    source: "Chancellors-award/Chancellors-award-Albany.jpeg",
    focal: { x: 0.545, y: 0.19 },
    minCover: 0.85,
    alt: "Aryan holding the SUNY Chancellor's Award for Student Excellence certificate between SUNY Chancellor John B. King Jr. and a University at Buffalo administrator in front of a SUNY backdrop",
    caption: "Albany, 27 April 2026. SUNY Chancellor's Award for Student Excellence, with Chancellor John B. King Jr.",
    receipt: { label: "SUNY", href: "https://www.suny.edu/suny-news/press-releases/4-26/4-27-26-3/case.html" },
  },
  {
    id: "pbk",
    source: "phi-beta-kappa.png",
    focal: { x: 0.45, y: 0.6 },
    minCover: 1,
    alt: "Aryan shaking hands at the Phi Beta Kappa induction while a slide reads Aryan Mudgal, Major: Computer Science",
    caption: "University at Buffalo, 2026. Phi Beta Kappa induction.",
    receipt: { label: "UB Arts and Sciences", href: "https://arts-sciences.buffalo.edu/phi-beta-kappa.html" },
  },
  {
    id: "contact",
    source: "Chancellors-award/scribble.png",
    focal: { x: 0.49, y: 0.485 },
    fit: "contain",
    alt: "A pencil self-portrait of Aryan in a suit with a handwritten arrow labelled me in every photo",
    caption: "Pencil, drawn on the train to Albany, April 2026. Me in every photo.",
    receipt: { label: "Drawn by Aryan", href: "#about" },
  },
];

export const extras: readonly Extra[] = [
  { id: "dots-pitch", source: "LA-hacks/IMG_9044.jpg", alt: "Aryan mid-sentence, gesturing while pitching Dots to a judge at LA Hacks", caption: "Pitching Dots to a judge.", room: "dots" },
  { id: "dots-booth", source: "LA-hacks/IMG_9051.jpg", alt: "Team Dots with Fetch.ai staff at the Agentverse booth at LA Hacks", caption: "At the Fetch.ai Agentverse booth after placing third in the track.", room: "dots" },
  { id: "armie-team", source: "MIT-win/mit-armie-team.png", alt: "The four-person ARMIE team with badges at MIT Reality Hack", caption: "The ARMIE team.", room: "armie" },
  { id: "streamfair-team", source: "CMU-win/TeamPhoto.png", alt: "Aryan, Yash Nakadi and Ayush Srivastava under the Carnegie Mellon University sign", caption: "Water Mellon, under the sign that named the team.", room: "streamfair" },
  { id: "wod-team", source: "stanford-win/StanfordWin.JPG", alt: "The W.O.D. team with prizes and sponsor badges at Immerse The Bay", caption: "After the Moonlake track announcement.", room: "wod" },
  { id: "safeline-portal", source: "YC-hackathon/yc-safeline-portal.png", alt: "Aryan on stage with the Safeline report review portal on the projector", caption: "The Safeline report portal on the projector.", room: "safeline" },
  { id: "chancellor-ub", source: "Chancellors-award/Chancellors-award-UB.jpeg", alt: "Aryan in a dark green suit between two University at Buffalo administrators in front of a UB backdrop", caption: "The UB celebration, April 2026.", room: "chancellor" },
  { id: "pillar-pair", source: "Pillars-award/innovative-student-leader-award-1.png", alt: "Aryan and Shaurya Jain each holding a Pillar of Leadership plaque", caption: "With Shaurya Jain, who received the Exemplary Student Leader Award the same evening.", room: "pillar" },
];

/** The 1.91:1 social image is cut from this room. */
export const ogRoom: ChapterId = "hero";

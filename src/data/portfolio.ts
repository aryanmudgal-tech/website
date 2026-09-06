import type { ChapterId, Receipt } from "./rooms";

export type { Receipt };

export type Link = { readonly label: string; readonly href: string };

/** Claims Aryan asked to keep although no public record exists. Each renders without a Source chip. */
export type KnownException = "armie-honorable-mention" | "men-in-green" | "safeline-remarks";

type Sourced = {
  readonly receipts: readonly Receipt[];
  readonly exception?: KnownException;
};

export type LedgerRow = {
  readonly fraction: string;
  readonly text: string;
  /** Anchor of the Recognition row that holds the full statement. */
  readonly anchor: string;
  readonly receipt: Receipt;
  readonly bold?: boolean;
};

export type Experience = Sourced & {
  readonly company: string;
  readonly role: string;
  readonly place: string;
  readonly period: string;
  readonly outcome: string;
  readonly detail: string;
  readonly myPart: string;
};

export type Project = Sourced & {
  readonly id: ChapterId;
  readonly name: string;
  readonly event: string;
  readonly date: string;
  readonly result: string;
  readonly pool?: string;
  readonly built: string;
  readonly myPart: string;
  readonly team: readonly string[];
  readonly aside?: string;
};

export type RouteEvent = {
  readonly period: string;
  readonly title: string;
  readonly href: string;
};

export type ResearchItem = Sourced & {
  readonly title: string;
  readonly role: string;
  readonly period: string;
  readonly summary: string;
  readonly detail: string;
};

export type LeadershipItem = Sourced & {
  readonly title: string;
  readonly role: string;
  readonly period: string;
  readonly summary: string;
};

export type Recognition = Sourced & {
  readonly id: ChapterId;
  readonly title: string;
  readonly fraction: string;
  readonly denominator: string;
  readonly context: string;
  readonly date: string;
  readonly watch?: Receipt;
};

export type AboutLine = {
  readonly text: string;
  readonly href?: string;
};

export const navItems: readonly Link[] = [
  { label: "Work", href: "#work" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#research" },
  { label: "Leadership", href: "#leadership" },
  { label: "Recognition", href: "#recognition" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export const links = {
  email: "mailto:aryanmudgal4493@gmail.com",
  linkedin: "https://www.linkedin.com/in/aryan-mudgal",
  github: "https://github.com/aryanmudgal-tech",
  devpost: "https://devpost.com/aryanmudgal4493",
  resume: "resume.pdf",
} as const;

const source = {
  ubnowChancellor: { label: "UBNow", href: "https://www.buffalo.edu/ubnow/stories/2026/04/student-chancellors-awards.html" },
  sunyRelease: { label: "SUNY", href: "https://www.suny.edu/suny-news/press-releases/4-26/4-27-26-3/case.html" },
  ubLeadershipAwards: { label: "UB Student Life", href: "https://www.buffalo.edu/studentlife/who-we-are/departments/engagement/leadership-awards.html" },
  ubPbk: { label: "UB Arts and Sciences", href: "https://arts-sciences.buffalo.edu/phi-beta-kappa.html" },
  spectrumCleanCampus: { label: "The Spectrum", href: "https://www.ubspectrum.com/article/2024/12/clean-campus-has-students-step-up-to-clean-ub-one-weekend-at-a-time" },
  ceremonyVideo: { label: "Hear Aryan speak at the ceremony, 2:56", href: "https://www.youtube.com/watch?v=Aru9b8gWmtE&t=176s" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/aryan-mudgal" },
  resume: { label: "Resume", href: "resume.pdf" },
  devpostDots: { label: "Devpost", href: "https://devpost.com/software/dots-y5r21j" },
  githubDots: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/dots" },
  devpostArmie: { label: "Devpost", href: "https://devpost.com/software/armie" },
  githubArmie: { label: "GitHub", href: "https://github.com/liviaellen/ble-mithack" },
  githubStreamFair: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/StreamFair" },
  videoStreamFair: { label: "Demo video, sign-in required", href: "https://drive.google.com/file/d/12grQ7uR837u36IkN1WaILOC0SHycm2rh/view?usp=sharing" },
  devpostWod: { label: "Devpost", href: "https://devpost.com/software/c-o-r-e" },
  githubWod: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/stanford-xr-core" },
  githubSafeline: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/safeline" },
  githubPortal: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/Student-Issue-Portal" },
  githubLitos: { label: "GitHub", href: "https://github.com/aryanmudgal-tech/Litos" },
} as const satisfies Record<string, Receipt>;

export const identity = {
  name: "Aryan Mudgal",
  fixationLine:
    "B.S. Computer Science, University at Buffalo, December 2026, GPA 3.93. Software Engineer Intern at Linde, Summer 2026; before that Meta Layer Initiative (2025) and HCLTech, Dubai (2024). Seeking new-grad software or forward-deployed engineering roles from January 2027. New York City, open to relocation.",
  fixationLineShort:
    "CS, University at Buffalo, Dec 2026. SWE Intern, Linde, 2026. Seeking new-grad SWE roles from Jan 2027. NYC, open to relocation.",
  description:
    "Aryan Mudgal: computer science at the University at Buffalo (December 2026), software engineer intern at Linde, two-time hackathon track winner, SUNY Chancellor's Award recipient. Seeking new-grad software roles in New York City.",
} as const;

/** One sentence per section; nav labels stay conventional, headings do the talking. */
export const headings = {
  work: "Three summers, one app that replaced paper on a plant floor",
  projects: "What I built in a day at UCLA, MIT, CMU and Stanford",
  trajectory: "Pune to Buffalo to New York City, as a list",
  research: "Counting fetal cells in maternal blood",
  leadership: "Elected twice, founded twice",
  recognition: "Two awards in one April, and a key",
  about: "Outside the work",
  contact: "Every claim above has a link",
} as const;

export const ledger: readonly LedgerRow[] = [
  {
    fraction: "1 of 2",
    text: "Award for Innovative Student Leadership, University at Buffalo, April 2026.",
    anchor: "#recognition-pillar",
    receipt: source.ubLeadershipAwards,
    bold: true,
  },
  {
    fraction: "1 of 15",
    text: "SUNY Chancellor's Award for Student Excellence, April 2026.",
    anchor: "#recognition-chancellor",
    receipt: source.sunyRelease,
  },
  {
    fraction: "Top 10%",
    text: "Phi Beta Kappa, University at Buffalo chapter, 2026.",
    anchor: "#recognition-pbk",
    receipt: source.ubPbk,
  },
];

export const experiences: readonly Experience[] = [
  {
    company: "Linde",
    role: "Software Engineer Intern",
    place: "Buffalo, NY",
    period: "Summer 2026",
    outcome: "Replaced paper production logging across a plant with an app that saves operators about three hours a day.",
    detail:
      "Built and shipped an ASP.NET Core MVC application from scratch. Designed the SQL Server schema, integrated Active Directory sign-in so floor laptops log in automatically, deployed on-prem via IIS, and built an Azure CI/CD pipeline for a second internal tool. In beta at the Palmer, Massachusetts site, slated to scale nationwide.",
    myPart: "The whole application, from schema to deployment.",
    receipts: [source.linkedin, source.resume],
  },
  {
    company: "Meta Layer Initiative",
    role: "Software Engineer Intern",
    place: "Remote",
    period: "Summer 2025",
    outcome: "Built the core browser extension: a persistent layer over any webpage where people and AI agents work side by side.",
    detail: "Shipped the extension that the initiative's human-AI collaboration work runs on. Code is private to the initiative.",
    myPart: "The extension itself.",
    receipts: [source.linkedin],
  },
  {
    company: "HCLTech",
    role: "Technical Analyst Intern",
    place: "Dubai, UAE",
    period: "May to August 2024",
    outcome: "Turned 50+ industry reports on AI in the MENA region into a strategy a Fortune 500 client acted on.",
    detail:
      "Analyzed 35+ customer journeys to align product localization with regional infrastructure standards, then delivered a 45-minute strategy presentation to C-suite stakeholders that shaped technology investment priorities across MENA markets.",
    myPart: "The research, the analysis, and the presentation.",
    receipts: [source.linkedin, source.resume],
  },
];

export const projects: readonly Project[] = [
  {
    id: "dots",
    name: "Dots",
    event: "LA Hacks, UCLA",
    date: "April 2026",
    result: "1st, Catalyst for Care track. 3rd, Agentverse track.",
    pool: "307 projects",
    built:
      "An iOS app built in 20 hours that turns floor plans or LiDAR room scans into Braille tactile maps and lets a blind user ask an AI voice agent about the space. On-device LiDAR scanning in Swift; a printable map for under 50 dollars instead of a compliance bill in the thousands.",
    myPart: "The iOS app and its full pipeline, the voice agent, and the backend that generates the Braille-map STL.",
    team: ["Ayush Srivastava", "Manav Sharma", "Abhi Ramtel"],
    aside: "One blind user tested it before the demo: my cousin.",
    receipts: [source.devpostDots, source.githubDots],
  },
  {
    id: "armie",
    name: "ARMIE",
    event: "MIT Reality Hack",
    date: "January 2026",
    result: "Honorable mention.",
    built:
      "Mixed-reality surgical training on Snap Spectacles paired with a 3D-printed robot arm, so a trainee's hands practice on something physical while the headset scores them.",
    myPart: "The anomaly-detection model, trained on existing neurosurgical training datasets.",
    team: ["Livia Ellen", "Lidia Likaya"],
    receipts: [source.devpostArmie, source.githubArmie],
    exception: "armie-honorable-mention",
  },
  {
    id: "streamfair",
    name: "StreamFair",
    event: "TartanHacks, Carnegie Mellon",
    date: "February 2026",
    result: "1st, Ripple track.",
    built:
      "A Chrome extension built in 24 hours for YouTube and Amazon Prime rentals: pay per second watched through XRPL and RLUSD micropayments instead of the full rental fee, and creators are paid for watch time.",
    myPart: "The extension and the payment flow.",
    team: ["Yash Nakadi", "Ayush Srivastava"],
    aside: "The team was Water Mellon. It is a Carnegie Mellon pun and nothing deeper.",
    receipts: [source.githubStreamFair, source.videoStreamFair],
  },
  {
    id: "wod",
    name: "W.O.D.",
    event: "Immerse The Bay, Stanford XR",
    date: "November 2025",
    result: "1st, Best Creation on Moonlake.",
    pool: "56 projects",
    built: "A playable VR world set in Tang-dynasty China, built in Moonlake by a two-person team over a weekend.",
    myPart: "World logic and the playable loop.",
    team: ["Ayush Srivastava"],
    receipts: [source.devpostWod, source.githubWod],
  },
  {
    id: "safeline",
    name: "Safeline",
    event: "YC Voice Agents Hackathon, San Francisco",
    date: "May 2026",
    result: "Did not place. The demo ran.",
    built: "A voice agent that drafts law-enforcement incident reports from a spoken account, built in a day.",
    myPart: "The voice pipeline and the report portal.",
    team: ["Ayush Srivastava"],
    aside: "Officers we spoke with said it would cut hours of documentation; the judges called the idea unique. Both are what people said in the room, not a citation.",
    receipts: [source.githubSafeline],
    exception: "safeline-remarks",
  },
];

export const route: readonly RouteEvent[] = [
  { period: "2020 to 2023", title: "Pune, India. Army family; ten schools before university.", href: "#about" },
  { period: "August 2023", title: "University at Buffalo, Computer Science.", href: "#top" },
  { period: "2023 to 2024", title: "Student Senator.", href: "#leadership" },
  { period: "Summer 2024", title: "HCLTech, Dubai.", href: "#work" },
  { period: "Sept 2024 to Oct 2025", title: "SUNY Student Assembly Delegate.", href: "#leadership" },
  { period: "2025", title: "Research assistant, fetomaternal hemorrhage detection.", href: "#research" },
  { period: "Summer 2025", title: "Meta Layer Initiative.", href: "#work" },
  { period: "November 2025", title: "W.O.D., Immerse The Bay.", href: "#projects" },
  { period: "January 2026", title: "ARMIE, MIT Reality Hack.", href: "#projects" },
  { period: "February 2026", title: "StreamFair, TartanHacks.", href: "#projects" },
  { period: "April 2026", title: "Dots, LA Hacks. Two awards in Buffalo and Albany the same month.", href: "#recognition" },
  { period: "Summer 2026", title: "Linde, Buffalo.", href: "#work" },
  { period: "December 2026", title: "Graduation. New York City from 2027.", href: "#contact" },
];

export const research: readonly ResearchItem[] = [
  {
    title: "Fetomaternal hemorrhage detection",
    role: "Research Assistant, University at Buffalo",
    period: "February to December 2025",
    summary: "Automated the cell-level work behind the Kleihauer-Betke test, a slide assay that counts fetal red cells in maternal blood.",
    detail:
      "Built a segmentation pipeline that seeds SAM2 with Grounding DINO detections, isolating 2.5 million individual cells into pixel-level masks and removing manual per-cell prompting. Ran Kleihauer-Betke slide data from a Cornell collaboration and improved detection accuracy from 89% to 92%. The condition is associated with around 4% of stillbirths.",
    receipts: [source.resume],
  },
];

export const leadership: readonly LeadershipItem[] = [
  {
    title: "SUNY Student Assembly",
    role: "Delegate",
    period: "September 2024 to October 2025",
    summary: "Elected voice for UB's roughly 30,000 students in the statewide assembly.",
    receipts: [source.spectrumCleanCampus, source.ubnowChancellor],
  },
  {
    title: "UB Student Association",
    role: "Student Senator",
    period: "2023 to 2024",
    summary: "Voted on more than 50,000 dollars in club funds.",
    receipts: [source.ubnowChancellor],
  },
  {
    title: "Men In Green",
    role: "Co-founder",
    period: "Agra, India, since July 2023",
    summary:
      "Screens Indian military-academy candidates for correctable medical disqualifiers. 450+ screened; 3 commissioned as officers who would otherwise have been turned away.",
    receipts: [],
    exception: "men-in-green",
  },
  {
    title: "Clean Campus",
    role: "Co-founder, with Chirag Ohri",
    period: "Since spring 2024",
    summary: "Ten cleanup drives, about 150 pounds of litter, chapters started at NYU and Boston University, about 500 dollars raised through UB's Get Seeded competition.",
    receipts: [source.spectrumCleanCampus],
  },
  {
    title: "Student Issue Portal",
    role: "Built it",
    period: "2024",
    summary: "A site for UB's roughly 30,000 students to report campus issues and follow up on them.",
    receipts: [source.githubPortal],
  },
];

export const recognitions: readonly Recognition[] = [
  {
    id: "pillar",
    title: "Award for Innovative Student Leadership",
    fraction: "1 of 2",
    denominator: "from 130+ nominations across UB's 20,000+ undergraduates",
    context: "The Pillar of Leadership award for the student whose initiative changed something at the university.",
    date: "University at Buffalo, April 2026",
    receipts: [source.ubLeadershipAwards],
  },
  {
    id: "chancellor",
    title: "SUNY Chancellor's Award for Student Excellence",
    fraction: "1 of 15",
    denominator: "at UB, 205 across the 64-campus SUNY system",
    context: "SUNY's highest student honor, presented in Albany by Chancellor John B. King Jr.",
    date: "Albany, 27 April 2026",
    receipts: [source.sunyRelease, source.ubnowChancellor],
    watch: source.ceremonyVideo,
  },
  {
    id: "pbk",
    title: "Phi Beta Kappa",
    fraction: "Top 10%",
    denominator: "of the graduating class, the chapter's criterion",
    context: "Inducted into the oldest academic honor society in the United States.",
    date: "University at Buffalo, 2026",
    receipts: [source.ubPbk],
  },
];

export const about: readonly AboutLine[] = [
  { text: "I do impressions, mostly Bollywood, on request." },
  { text: "Army kid: ten schools before university. Pune from 2020 to 2023, Buffalo since 2023." },
  { text: "Golf handicap 20. Badminton most weeks." },
  { text: "Geopolitics and public speaking, when nobody stops me." },
  { text: "Building Litos, a Chrome extension on the Chrome Web Store that shows what each Claude message costs you.", href: source.githubLitos.href },
];

export const colophon = {
  version: "v3, September 2026. v2 (July 2026) was a plain page. v1 (June 2026) had a projector and a mini-golf game.",
  photos: "Photos by event photographers and by me. The last one is pencil.",
  type: "Set in Newsreader and Instrument Sans.",
  corrections: "Figures aligned to UBNow, SUNY and Devpost, September 2026.",
} as const;

export const places = ["Pune", "Buffalo", "New York City"] as const;

export type Link = {
  label: string;
  href: string;
};

export type ProofPoint = {
  value: string;
  label: string;
  ariaLabel?: string;
};

export type Experience = {
  period: string;
  company: string;
  role: string;
  summary: string;
  capabilities: readonly string[];
  featured?: boolean;
};

export type Project = {
  name: string;
  event: string;
  recognition: string;
  problem: string;
  built: string;
  scopeLabel: "Team scope" | "Individual contribution";
  contribution: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  href: string;
  linkLabel: string;
  lead?: boolean;
};

export type TrajectoryEvent = {
  id: string;
  period: string;
  column: "2022" | "2023" | "2024" | "2025" | "2026";
  lane: "Work" | "Build" | "Research" | "Leadership" | "Recognition";
  title: string;
  outcome: string;
  detail: string;
};

export type ResearchItem = {
  status: string;
  title: string;
  subject: string;
  summary: string;
  capabilities: readonly string[];
  featured?: boolean;
};

export type LeadershipItem = {
  value: string;
  title: string;
  context: string;
  scale: "wide" | "tall" | "standard";
};

export type Recognition = {
  title: string;
  year?: string;
  value: string;
  context: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
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
} as const;

export const proofPoints: readonly ProofPoint[] = [
  { value: "Linde", label: "Software engineering, 2026" },
  { value: "MIDL", label: "Accepted medical AI research" },
  { value: "4", label: "Hackathon recognitions", ariaLabel: "four hackathon recognitions" },
  { value: "$500K+", label: "Student budget stewarded" },
  { value: "30K+", label: "Students represented" },
];

export const experiences: readonly Experience[] = [
  {
    period: "Summer 2026",
    company: "Linde",
    role: "Software Engineer Intern",
    summary:
      "Built an ML system that turns dozens of live industrial-plant signals into predictions and prioritized alerts for remote operators. After licensing to a partner, gathered on-site feedback and iterated for their team.",
    capabilities: ["ML engineering", "Predictive systems", "On-site deployment"],
    featured: true,
  },
  {
    period: "Summer 2025",
    company: "Meta Layer Initiative",
    role: "Software Engineer Intern",
    summary:
      "Built the core browser extension: a persistent interaction layer over any webpage where humans and AI agents can work side by side.",
    capabilities: ["Browser extension", "AI agents", "Human-AI interaction"],
  },
  {
    period: "Summer 2024",
    company: "HCLTech",
    role: "Technical Analyst",
    summary:
      "Modeled the direction of the AI market and translated that analysis into investment strategy.",
    capabilities: ["Market analysis", "AI strategy", "Research"],
  },
];

export const projects: readonly Project[] = [
  {
    name: "Dots",
    event: "LA Hacks, UCLA, Apr 2026",
    recognition: "1st, Catalyst for Care; 3rd, Fetch.ai",
    problem:
      "Blind and low-vision visitors need a practical way to understand an unfamiliar building before and during a visit.",
    built:
      "A team-built system that turns floor plans into tactile-ready maps and supports text or voice questions about the space.",
    scopeLabel: "Team scope",
    contribution: "Team project built and demonstrated during LA Hacks.",
    image: "/assets/hack-dots.jpg",
    imageWidth: 1092,
    imageHeight: 736,
    imageAlt: "Team Dots holding two awards at LA Hacks at UCLA",
    href: "https://devpost.com/software/dots-y5r21j",
    linkLabel: "View Dots on Devpost",
    lead: true,
  },
  {
    name: "ARMIE",
    event: "Reality Hack, MIT, Jan 2026",
    recognition: "Honorable mention among 300 teams",
    problem:
      "Surgical training needs repeatable physical practice without putting a patient at risk.",
    built:
      "An augmented-reality training experience paired with a physical robot arm, built and demonstrated by the team at MIT.",
    scopeLabel: "Individual contribution",
    contribution: "Machine-learning engineering within the project team.",
    image: "/assets/hack-armie.jpg",
    imageWidth: 986,
    imageHeight: 544,
    imageAlt: "Team ARMIE presenting at MIT Reality Hack",
    href: "https://devpost.com/software/armie",
    linkLabel: "View ARMIE on Devpost",
  },
  {
    name: "StreamFair",
    event: "TartanHacks, Carnegie Mellon, Feb 2026",
    recognition: "1st, Ripple track",
    problem:
      "Streaming monetization often separates viewing time from how and when creators are paid.",
    built:
      "A team prototype that connected streamed viewing with continuous payment, then returned for a YC hackathon demo.",
    scopeLabel: "Team scope",
    contribution: "Team project built, pitched, and demonstrated under hackathon constraints.",
    image: "/assets/hack-streamfair.jpg",
    imageWidth: 1500,
    imageHeight: 1974,
    imageAlt: "StreamFair team receiving the Ripple track award at TartanHacks",
    href: "https://drive.google.com/file/d/12grQ7uR837u36IkN1WaILOC0SHycm2rh/view?usp=sharing",
    linkLabel: "Watch the StreamFair demo",
  },
  {
    name: "W.O.D.",
    event: "XR Hacks, Stanford, Nov 2025",
    recognition: "1st, Best Creation on MoonLake",
    problem:
      "History education often asks learners to memorize dates without experiencing the world behind them.",
    built:
      "A playable VR world set in medieval China, built with MoonLake's environment tools.",
    scopeLabel: "Team scope",
    contribution: "Two-person team project recognized at the top of the MoonLake track.",
    image: "/assets/hack-core.jpg",
    imageWidth: 1417,
    imageHeight: 928,
    imageAlt: "W.O.D. team with prizes after winning the MoonLake track at Stanford XR Hacks",
    href: "https://devpost.com/software/c-o-r-e",
    linkLabel: "View W.O.D. on Devpost",
  },
];

export const trajectoryColumns = ["2022", "2023", "2024", "2025", "2026"] as const;

export const trajectoryLanes = ["Work", "Build", "Research", "Leadership", "Recognition"] as const;

export const trajectoryEvents: readonly TrajectoryEvent[] = [
  {
    id: "delegate",
    period: "2022-2025",
    column: "2022",
    lane: "Leadership",
    title: "SUNY Delegate",
    outcome: "Represented 30,000+ students.",
    detail:
      "The role required turning concerns from a large student community into clear priorities and an accountable public voice.",
  },
  {
    id: "senator",
    period: "2023",
    column: "2023",
    lane: "Leadership",
    title: "Student Senator",
    outcome: "Stewarded a $500K+ student budget.",
    detail:
      "The work paired representation with resource decisions, weighing where student funding could create the most practical value.",
  },
  {
    id: "hcl",
    period: "2024",
    column: "2024",
    lane: "Work",
    title: "HCLTech",
    outcome: "Connected AI market analysis to investment strategy.",
    detail:
      "The starting point was analytical: model where the AI market was moving, then turn that signal into a decision the business could use.",
  },
  {
    id: "meta-layer",
    period: "Summer 2025",
    column: "2025",
    lane: "Work",
    title: "Meta Layer Initiative",
    outcome: "Built the core human-AI browser extension.",
    detail:
      "The work moved from analysis into product infrastructure, creating a persistent layer where people and AI agents could collaborate on any webpage.",
  },
  {
    id: "core",
    period: "Nov 2025",
    column: "2025",
    lane: "Build",
    title: "W.O.D.",
    outcome: "Won the MoonLake track at Stanford XR Hacks.",
    detail:
      "The two-person team built a playable historical VR world with MoonLake's environment tools and won Best Creation on MoonLake.",
  },
  {
    id: "fmh",
    period: "2025",
    column: "2025",
    lane: "Research",
    title: "Fetal-maternal hemorrhage detection",
    outcome: "Medical AI work accepted at MIDL.",
    detail:
      "The research applies deep learning to detecting a faint fetal signal within maternal blood samples, where missing a small trace can matter.",
  },
  {
    id: "armie",
    period: "Jan 2026",
    column: "2026",
    lane: "Build",
    title: "ARMIE",
    outcome: "Recognized at MIT Reality Hack.",
    detail:
      "The project joined augmented reality with a physical robot arm for a training experience that had to work in front of judges, not only in a deck.",
  },
  {
    id: "streamfair",
    period: "Feb 2026",
    column: "2026",
    lane: "Build",
    title: "StreamFair",
    outcome: "Won the Ripple track at TartanHacks.",
    detail:
      "The team connected streaming behavior to continuous payment, won at Carnegie Mellon, and later demonstrated the work at a YC hackathon.",
  },
  {
    id: "dots",
    period: "Apr 2026",
    column: "2026",
    lane: "Build",
    title: "Dots",
    outcome: "Won two awards at LA Hacks.",
    detail:
      "The team focused applied AI on spatial accessibility and left UCLA with both the Catalyst for Care win and Fetch.ai third place.",
  },
  {
    id: "innovative-student-leadership",
    period: "2026",
    column: "2026",
    lane: "Recognition",
    title: "Award for Innovative Student Leadership",
    outcome: "Selected as 1 of 2 among 20,000 students.",
    detail:
      "Chosen among 20,000 students for university innovation and leadership.",
  },
  {
    id: "suny-chancellors-award",
    period: "2026",
    column: "2026",
    lane: "Recognition",
    title: "SUNY Chancellor's Award for Student Excellence",
    outcome: "Selected as 1 of 15 among 8,000 students.",
    detail:
      "Selected among 8,000 students for SUNY's highest student honor.",
  },
  {
    id: "linde",
    period: "Summer 2026",
    column: "2026",
    lane: "Work",
    title: "Linde",
    outcome: "Shipped predictive support for industrial operators.",
    detail:
      "The system distilled live plant signals into forecasts and prioritized alerts, then evolved through direct feedback from a licensed partner team.",
  },
];

export const researchItems: readonly ResearchItem[] = [
  {
    status: "MIDL-accepted",
    title: "Fetal-maternal hemorrhage detection",
    subject: "Finding a clinically important signal hidden among maternal cells.",
    summary:
      "Deep-learning research focused on detecting fetal-maternal hemorrhage from a signal that is easy to miss and costly to overlook.",
    capabilities: ["Medical imaging", "Deep learning", "Peer review"],
    featured: true,
  },
  {
    status: "Ongoing research",
    title: "Unhealthy wound detection",
    subject: "Flagging signs of a wound deteriorating earlier.",
    summary:
      "Computer-vision research aimed at detecting unhealthy wounds before their condition becomes harder to manage.",
    capabilities: ["Computer vision", "Clinical AI", "Early detection"],
  },
];

export const leadershipItems: readonly LeadershipItem[] = [
  {
    value: "30,000+",
    title: "SUNY Delegate",
    context: "Elected voice for students across the SUNY system.",
    scale: "wide",
  },
  {
    value: "$500K+",
    title: "Student Senator",
    context: "Stewarded a student budget through public votes and tradeoffs.",
    scale: "tall",
  },
  {
    value: "Co-founder",
    title: "Men In Green",
    context: "Advanced early health screening for rural communities.",
    scale: "standard",
  },
  {
    value: "100,000+",
    title: "Clean Campus",
    context: "Built a movement with 1,500+ followers and broad social reach.",
    scale: "standard",
  },
  {
    value: "30,000+",
    title: "Civic platform",
    context: "Built a site where students could report campus issues and follow action.",
    scale: "wide",
  },
];

export const recognitions: readonly Recognition[] = [
  {
    title: "Award for Innovative Student Leadership",
    year: "2026",
    value: "1 of 2",
    context: "Chosen among 20,000 students for university innovation and leadership.",
    image: "/assets/award-leader.jpg",
    imageWidth: 1195,
    imageHeight: 793,
    imageAlt: "Aryan holding the Award for Innovative Student Leadership at the University at Buffalo",
  },
  {
    title: "SUNY Chancellor's Award for Student Excellence",
    year: "2026",
    value: "1 of 15",
    context: "Selected among 8,000 students for SUNY's highest student honor.",
    image: "/assets/award-chancellor.jpg",
    imageWidth: 1500,
    imageHeight: 1000,
    imageAlt: "Aryan receiving the SUNY Chancellor's Award for Student Excellence",
  },
  {
    title: "Phi Beta Kappa",
    value: "Top 10%",
    context: "Inducted into America's oldest academic honor society.",
    image: "/assets/award-pbk.jpg",
    imageWidth: 1500,
    imageHeight: 895,
    imageAlt: "Aryan being inducted into Phi Beta Kappa",
  },
];

export const interests = ["Gym", "Golf", "Badminton", "Acting and mimicry"] as const;

export const places = ["New Delhi", "Buffalo", "San Francisco"] as const;

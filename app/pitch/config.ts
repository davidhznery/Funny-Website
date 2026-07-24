export type ForkModeId = "stalk" | "steal" | "learn";

export type ForkMode = {
  label: string;
  /** Temporary button label shown while the joke plays out. */
  pending: string;
  image: string;
  alt: string;
  message: string;
  /** Placeholder destinations — swap these for the real URLs. */
  url: string;
};

export const forkConfig: Record<ForkModeId, ForkMode> = {
  stalk: {
    label: "Stalk my profile",
    pending: "Investigating…",
    image: "/memes/fork-stalk.png",
    alt: "Fork character wearing sunglasses, pointing knowingly",
    message: "Fine. Let’s investigate my professional life.",
    url: "https://www.linkedin.com/", // TODO: real LinkedIn profile URL
  },
  steal: {
    label: "Steal my ideas",
    pending: "Preparing the robbery…",
    image: "/memes/fork-steal.png",
    alt: "Fork character holding a handle aloft, ready to swipe something",
    message: "At least pretend they were inspired by me.",
    url: "https://github.com/", // TODO: real projects / ideas URL
  },
  learn: {
    label: "Learn with me",
    pending: "Excellent decision.",
    image: "/memes/fork-learn.png",
    alt: "Fork character cheering, surrounded by confetti",
    message: "You clicked the responsible option.",
    url: "https://www.skool.com/", // TODO: real School community URL
  },
};

export const FORK_ORDER: ForkModeId[] = ["stalk", "steal", "learn"];

/** Accent palette used by the confetti — site accents plus the meme sprinkles. */
export const CONFETTI_COLORS = [
  "#d8ff48", // lime
  "#ff6a49", // coral-red
  "#151512", // ink
  "#ff5da2", // pink
  "#38bdf8", // blue
  "#a855f7", // purple
  "#ffd23f", // yellow
];

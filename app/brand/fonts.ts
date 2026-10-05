import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The image generator (next/og) can't use the web fonts from next/font, so the
// brand images load these two files. Fraunces is the 144pt cut, the design the
// site shows at large sizes. Licenses in NOTICES.md.
const dir = join(process.cwd(), "assets/fonts");

export const fonts = [
  {
    name: "Fraunces",
    data: await readFile(join(dir, "Fraunces-Black.ttf")),
    weight: 900 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: await readFile(join(dir, "Inter-SemiBold.ttf")),
    weight: 600 as const,
    style: "normal" as const,
  },
];

// The light-mode tokens from app/globals.css, plus the dark-mode coral for
// charcoal backgrounds. Brand images never follow the theme.
export const CHALK = "#fafaf7";
export const CHARCOAL = "#222222";
export const LIME = "#d4ff3a";
export const VIOLET = "#6a45c2";
export const MUTED = "#5c5c56";
export const CORAL_ON_CHARCOAL = "#ff6b4a";

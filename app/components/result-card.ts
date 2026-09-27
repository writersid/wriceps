// Draws the result card on a canvas and returns it as a PNG. Always
// paper-light, 1080×1350 (portrait, 4:5). See SPEC.md "Sharing details".
import { layoutRuns, type Placed } from "@/lib/card-layout";
import { bandFor } from "@/lib/engine/score";
import { ignoredLine, type Card, type Run } from "@/lib/share";

const W = 1080;
const H = 1350;
const PAD = 80;
const CHALK = "#fafaf7";
const CHARCOAL = "#222222";
const MUTED = "#5c5c56";
const RULE = "#e3e1d8";
const LIME = "#d4ff3a";
// The piece shrinks to fit, from the largest size to the smallest, then trims.
const PIECE_SIZES = [44, 40, 36, 34, 32, 30, 28, 26, 24];
const LINE_HEIGHT = 1.5;
const PLATE_HEIGHTS = [64, 72, 88, 104];

// The next/font family lists, from the CSS variables set in app/layout.tsx.
function families() {
  const css = getComputedStyle(document.documentElement);
  return {
    display: css.getPropertyValue("--font-fraunces").trim() || "Georgia, serif",
    sans: css.getPropertyValue("--font-inter").trim() || "system-ui, sans-serif",
  };
}

export async function drawResultCard(card: Card): Promise<Blob> {
  const { display, sans } = families();
  await Promise.all(
    [`900 40px ${display}`, `800 40px ${display}`, `400 40px ${sans}`, `600 40px ${sans}`].map((f) =>
      document.fonts.load(f).catch(() => []),
    ),
  );

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = CHALK;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";
  const text = (s: string, x: number, y: number, font: string, color = CHARCOAL) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
    return ctx.measureText(s).width;
  };

  // Header: wordmark, mechanic, title (up to two lines).
  text("wriceps", PAD, 128, `900 44px ${display}`);
  text([card.mechanic, ...(card.team ? ["With a spotter"] : [])].join(" · ").toUpperCase(), PAD, 212, `600 26px ${sans}`, MUTED);
  let titleSize = 72;
  let titleLines: Placed[][];
  do {
    ctx.font = `800 ${titleSize}px ${display}`;
    titleLines = layoutRuns([{ text: card.title, style: "plain" }], (s) => ctx.measureText(s).width, W - 2 * PAD);
    titleSize -= 8;
  } while (titleLines.length > 2 && titleSize >= 48);
  titleSize += 8;
  let y = 212 + titleSize * 1.15;
  for (const line of titleLines.slice(0, 2)) {
    text(line.map((p) => p.text).join(" "), PAD, y, `800 ${titleSize}px ${display}`);
    y += titleSize * 1.1;
  }

  // The piece, between the title and the score.
  const top = y + 20;
  const bottom = H - 360;
  drawPiece(ctx, card.runs, sans, top, bottom);

  // Score block: a rule, the score and band, the plate meter, the extra line.
  ctx.fillStyle = RULE;
  ctx.fillRect(PAD, H - 320, W - 2 * PAD, 2);
  const band = bandFor(card.score);
  const scoreWidth = text(String(card.score), PAD, H - 170, `900 130px ${display}`);
  text(band, PAD + scoreWidth + 24, H - 172, `600 40px ${sans}`);
  drawMeter(ctx, card.score > 0 ? ["Warm-up", "Working set", "Heavy lift", "PR"].indexOf(band) + 1 : 0, H - 205);
  const extra = [card.team ? "Team score" : "", ignoredLine(card.ignoredFlags)].filter(Boolean).join(" · ");
  if (extra) text(extra, PAD, H - 118, `400 30px ${sans}`, MUTED);

  // Footer: the app's address.
  text(new URL(card.url).host, PAD, H - 56, `600 30px ${sans}`, MUTED);

  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("The card couldn't be drawn."))), "image/png"),
  );
}

function drawPiece(ctx: CanvasRenderingContext2D, runs: Run[], sans: string, top: number, bottom: number) {
  const width = W - 2 * PAD;
  const fontFor = (style: Run["style"], size: number) => `${style === "bold" ? 600 : 400} ${size}px ${sans}`;
  let size = PIECE_SIZES[0];
  let lines: Placed[][] = [];
  for (size of PIECE_SIZES) {
    lines = layoutRuns(
      runs,
      (s, style) => {
        ctx.font = fontFor(style, size);
        return ctx.measureText(s).width;
      },
      width,
    );
    if (lines.length * size * LINE_HEIGHT <= bottom - top) break;
  }
  const lineHeight = size * LINE_HEIGHT;
  const fits = Math.floor((bottom - top) / lineHeight);
  const trimmed = lines.length > fits;
  lines = lines.slice(0, fits);

  lines.forEach((line, i) => {
    const baseline = top + size + i * lineHeight;
    for (const p of line) {
      if (p.style === "bar") {
        ctx.fillStyle = CHARCOAL;
        ctx.beginPath();
        ctx.roundRect(PAD + p.x, baseline - size * 0.82, p.width, size * 1.06, 4);
        ctx.fill();
      } else {
        ctx.font = fontFor(p.style, size);
        ctx.fillStyle = CHARCOAL;
        ctx.fillText(p.text, PAD + p.x, baseline);
      }
    }
    if (trimmed && i === lines.length - 1) {
      const end = line.at(-1);
      ctx.font = fontFor("plain", size);
      ctx.fillText("…", PAD + (end ? end.x + end.width : 0), baseline);
    }
  });
}

// The barbell meter, as on the score card: one lime plate per band reached.
function drawMeter(ctx: CanvasRenderingContext2D, loaded: number, centerY: number) {
  const plateWidth = 36;
  const gap = 12;
  let x = W - PAD - 340;
  ctx.fillStyle = CHARCOAL;
  ctx.fillRect(x, centerY - 4, 40, 8);
  x += 40 + gap;
  PLATE_HEIGHTS.forEach((h, i) => {
    ctx.beginPath();
    ctx.roundRect(x, centerY - h / 2, plateWidth, h, 8);
    if (i < loaded) {
      ctx.fillStyle = LIME;
      ctx.fill();
      ctx.lineWidth = 4;
      ctx.strokeStyle = CHARCOAL;
      ctx.setLineDash([]);
    } else {
      ctx.lineWidth = 2;
      ctx.strokeStyle = MUTED;
      ctx.setLineDash([6, 6]);
    }
    ctx.stroke();
    x += plateWidth + gap;
  });
  ctx.setLineDash([]);
  ctx.fillStyle = CHARCOAL;
  ctx.fillRect(x, centerY - 4, W - PAD - x, 8);
}

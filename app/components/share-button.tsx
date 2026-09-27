"use client";

import { useEffect, useState } from "react";
import type { Card } from "@/lib/share";
import { drawResultCard } from "./result-card";

// Shares the result card and message: with the image where the phone allows
// it, else the message alone, else Download / Copy / Open WhatsApp. The card
// is drawn when this appears, so a tap shares at once (iPhones allow sharing
// only right after a tap).
export function ShareButton({ card, message, fileName }: { card: Card; message: string; fileName: string }) {
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const [drawFailed, setDrawFailed] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [copied, setCopied] = useState<"yes" | "no" | null>(null);

  useEffect(() => {
    let url = "";
    let live = true;
    drawResultCard(card)
      .then((blob) => {
        if (!live) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
      })
      .catch(() => live && setDrawFailed(true));
    return () => {
      live = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [card]);

  async function share() {
    try {
      const file = image && new File([image.blob], fileName, { type: "image/png" });
      if (file && navigator.canShare?.({ files: [file] })) return await navigator.share({ files: [file], text: message });
      if (navigator.share) return await navigator.share({ text: message });
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // closed the share sheet
    }
    setFallback(true);
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied("yes");
    } catch {
      setCopied("no");
    }
  }

  const ready = image !== null || drawFailed;
  return (
    <>
      <button
        type="button"
        onClick={share}
        disabled={!ready}
        className="min-h-12 rounded-full bg-ink font-display text-lg font-black text-bg disabled:opacity-60"
      >
        {ready ? "Share this rep" : "Making the card…"}
      </button>
      {fallback && (
        <section aria-label="Share" className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4">
          {image && (
            // eslint-disable-next-line @next/next/no-img-element -- a local blob URL, not an optimizable image
            <img src={image.url} alt="Your result card" className="w-full rounded-xl border border-border" />
          )}
          <div className="flex flex-col gap-2">
            {image && (
              <a
                href={image.url}
                download={fileName}
                className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-border px-4 font-semibold"
              >
                Download image
              </a>
            )}
            <button
              type="button"
              onClick={copy}
              className="min-h-11 flex-1 rounded-full border border-border px-4 font-semibold"
            >
              {copied === "yes" ? "Copied" : "Copy message"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 flex-1 items-center justify-center rounded-full border border-border px-4 font-semibold"
            >
              Open WhatsApp
            </a>
          </div>
          <p className="text-sm text-muted" role="status">
            {copied === "no"
              ? "Copying didn't work here. Download the image, or open WhatsApp to send the message."
              : drawFailed
                ? "The card didn't draw on this device, but the message still works."
                : ""}
          </p>
        </section>
      )}
    </>
  );
}

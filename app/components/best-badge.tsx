"use client";

import { useSyncExternalStore } from "react";
import { getBest } from "@/lib/progress";

// Another tab logging a score changes localStorage and fires "storage" here.
const subscribe = (onChange: () => void) => {
  addEventListener("storage", onChange);
  return () => removeEventListener("storage", onChange);
};

// The set's PR from this browser. The home page is built ahead of time with
// no badge (the server snapshot), and the badge appears once it loads.
export function BestBadge({ setId }: { setId: string }) {
  const best = useSyncExternalStore(subscribe, () => getBest(setId), () => null);
  if (best === null) return null;
  return <span className="shrink-0 rounded-full bg-lime px-2.5 py-0.5 text-sm font-semibold text-charcoal">PR {best}</span>;
}

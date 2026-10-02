// The five analytics events (SPEC.md "Analytics details"), sent to PostHog
// cookieless. posthog-js loads only when the first event fires, and only with
// a project token set. Nothing the player writes is ever an event property, and
// keepOnly drops everything PostHog would add beyond the fields below.
import type { CaptureResult, PostHog } from "posthog-js";

type Mechanic = "constraint" | "fill-in" | "blackout";
type Mode = "solo" | "spotter";
export type SetInfo = { set: string; mechanic: Mechanic; mode: Mode };

type Events = {
  "exercise started": SetInfo;
  "exercise completed": SetInfo & { score: number; challenge: boolean };
  "result shared": SetInfo & { method: "share sheet" | "download" | "copy" | "whatsapp" };
  "challenge link opened": { set: string; mechanic: Mechanic; target: number };
  "challenge completed": { set: string; mechanic: Mechanic; score: number; target: number; result: "won" | "tied" | "lost" };
};
type EventName = keyof Events;

const EVENTS: EventName[] = [
  "exercise started",
  "exercise completed",
  "result shared",
  "challenge link opened",
  "challenge completed",
];

const OURS = ["set", "mechanic", "mode", "score", "challenge", "method", "target", "result"];
// Context kept with each event: device type (Mobile, Tablet, Desktop),
// browser and OS names, and the referring site's domain only.
const CONTEXT = ["$device_type", "$browser", "$os", "$referring_domain"];
// What PostHog needs to accept and count the event. Cookieless counting hashes
// the user agent, host, and IP, then deletes the user agent and IP.
const REQUIRED = ["token", "distinct_id", "$cookieless_mode", "$raw_user_agent", "$host", "$process_person_profile", "$lib", "$lib_version", "$insert_id", "$geoip_disable"];
const KEEP = new Set([...OURS, ...CONTEXT, ...REQUIRED]);

// Runs last, on every event: anything that isn't one of the five is dropped,
// and only the listed properties go out.
export function keepOnly(event: CaptureResult | null): CaptureResult | null {
  if (!event || !(EVENTS as string[]).includes(event.event)) return null;
  const properties: CaptureResult["properties"] = {};
  for (const [key, value] of Object.entries(event.properties ?? {})) if (KEEP.has(key)) properties[key] = value;
  return { uuid: event.uuid, event: event.event, properties, timestamp: event.timestamp };
}

let loading: Promise<PostHog | null> | null = null;

function load(): Promise<PostHog | null> {
  const token = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN;
  if (!token) return Promise.resolve(null);
  loading ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(token, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
        defaults: "2026-05-30",
        cookieless_mode: "always",
        person_profiles: "never",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        capture_exceptions: false,
        capture_heatmaps: false,
        capture_dead_clicks: false,
        capture_performance: false,
        rageclick: false,
        disable_session_recording: true,
        disable_surveys: true,
        disable_product_tours: true,
        disable_conversations: true,
        disable_web_experiments: true,
        disable_external_dependency_loading: true,
        advanced_disable_flags: true,
        save_campaign_params: false,
        before_send: keepOnly,
      });
      return posthog;
    })
    .catch(() => null);
  return loading;
}

// Pages already counted for a "challenge link opened", so a screen that loads
// twice (React's development mode does) counts once.
const opened = new Set<string>();

// Sends one event. Analytics failing must never break a set, so errors are dropped.
export function track<E extends EventName>(event: E, properties: Events[E]) {
  if (event === "challenge link opened") {
    if (opened.has(location.href)) return;
    opened.add(location.href);
  }
  load()
    .then((posthog) => posthog?.capture(event, { ...properties, $geoip_disable: true }))
    .catch(() => {});
}

// "Log this set": the completion, and on a challenge, how it went.
export function trackLog(info: SetInfo, score: number, challenge: { score: number } | null) {
  track("exercise completed", { ...info, score, challenge: !!challenge });
  if (!challenge) return;
  const target = challenge.score;
  const result = score > target ? "won" : score === target ? "tied" : "lost";
  track("challenge completed", { set: info.set, mechanic: info.mechanic, score, target, result });
}

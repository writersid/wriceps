import { describe, expect, it, vi } from "vitest";
import type { CaptureResult } from "posthog-js";
import { keepOnly, track } from "./analytics";

const { init } = vi.hoisted(() => ({ init: vi.fn() }));
vi.mock("posthog-js", () => ({ default: { init, capture: vi.fn() } }));

const event = (name: string, properties: Record<string, unknown>) =>
  ({ uuid: "u1", event: name, properties, timestamp: new Date(0) }) as CaptureResult;

describe("keepOnly", () => {
  it("drops events that aren't one of the five", () => {
    expect(keepOnly(event("$pageview", {}))).toBeNull();
    expect(keepOnly(event("$autocapture", {}))).toBeNull();
    expect(keepOnly(null)).toBeNull();
  });

  it("keeps our fields, the allowed context, and what PostHog needs, and nothing else", () => {
    const kept = keepOnly(
      event("exercise completed", {
        set: "morning-stretch",
        mechanic: "constraint",
        mode: "solo",
        score: 82,
        challenge: false,
        $device_type: "Mobile",
        $browser: "Chrome",
        $os: "Android",
        $referring_domain: "reddit.com",
        token: "phc_test",
        distinct_id: "$posthog_cookieless",
        $cookieless_mode: true,
        $raw_user_agent: "Mozilla/5.0",
        $host: "wriceps.com",
        $geoip_disable: true,
        // PostHog adds these by default; none may go out.
        $current_url: "https://wriceps.com/sets/morning-stretch?c=82",
        $pathname: "/sets/morning-stretch",
        $referrer: "https://www.reddit.com/r/writing/comments/abc",
        $browser_version: 140,
        $os_version: "15",
        $screen_width: 412,
        $viewport_width: 412,
        $browser_language: "en-US",
        $timezone: "Asia/Kolkata",
        $session_id: "s1",
        $window_id: "w1",
        utm_source: "whatsapp",
        $set: { anything: 1 },
      }),
    );
    expect(kept?.event).toBe("exercise completed");
    expect(Object.keys(kept!.properties).sort()).toEqual(
      [
        "set",
        "mechanic",
        "mode",
        "score",
        "challenge",
        "$device_type",
        "$browser",
        "$os",
        "$referring_domain",
        "token",
        "distinct_id",
        "$cookieless_mode",
        "$raw_user_agent",
        "$host",
        "$geoip_disable",
      ].sort(),
    );
  });
});

describe("track", () => {
  it("does nothing without a project token", async () => {
    vi.stubEnv("NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN", "");
    track("exercise started", { set: "morning-stretch", mechanic: "constraint", mode: "solo" });
    await new Promise((r) => setTimeout(r, 0));
    expect(init).not.toHaveBeenCalled();
    vi.unstubAllEnvs();
  });
});

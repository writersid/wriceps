"use client";

import { useLayoutEffect } from "react";
import { THEME_KEY, savedOrDeviceTheme } from "../theme";

export function ThemeToggle() {
  // In development, React's Strict Mode remount clears the attribute the head script set. Put it back.
  // In production this is a no-op.
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!root.dataset.theme) root.dataset.theme = savedOrDeviceTheme();
  }, []);

  function toggle() {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-11 place-items-center rounded-xl border border-border"
    >
      <span className="sr-only dark:hidden">Switch to dark mode</span>
      <span className="sr-only hidden dark:inline">Switch to light mode</span>
      {/* Moon in light mode, sun in dark mode, as in the mockups. */}
      <svg
        className="size-5 dark:hidden"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
      </svg>
      <svg
        className="hidden size-5 dark:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
    </button>
  );
}

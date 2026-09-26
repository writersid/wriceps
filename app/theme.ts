export type Theme = "light" | "dark";

export const THEME_KEY = "wriceps-theme";

// The saved choice if there is one, otherwise the device setting.
export function savedOrDeviceTheme(): Theme {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(THEME_KEY);
  } catch {}
  if (saved === "light" || saved === "dark") return saved;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// Runs in <head> before the first paint so the page never flashes the wrong theme.
// Same logic as savedOrDeviceTheme, as plain JavaScript.
export const themeScript = `(function(){var t;try{t=localStorage.getItem("${THEME_KEY}")}catch(e){}if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)})()`;

import Link from "next/link";

// The home page footer. See SPEC.md "Home, help, footer, and privacy".
export function SiteFooter() {
  const link = "min-h-11 inline-flex items-center underline underline-offset-4";
  return (
    <footer className="mt-4 flex flex-col gap-1 border-t border-border pt-4 text-sm text-muted">
      {/* DRAFT line: Sid writes the real one. */}
      <p>Made by Sid Sharma, one rep at a time.</p>
      <nav aria-label="Links" className="flex flex-wrap gap-x-5">
        <a href="https://github.com/writersid" target="_blank" rel="noopener noreferrer" className={link}>
          GitHub
        </a>
        <a href="https://x.com/ThisisSidSharma" target="_blank" rel="noopener noreferrer" className={link}>
          X
        </a>
        <Link href="/privacy" className={link}>
          Privacy and credits
        </Link>
      </nav>
    </footer>
  );
}

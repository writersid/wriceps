import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";

export function PageFrame({
  backHref,
  children,
}: {
  backHref?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-6">
      <header className="grid grid-cols-[2.75rem_1fr_2.75rem] items-center py-4">
        {backHref ? (
          <Link
            href={backHref}
            className="grid size-11 place-items-center rounded-xl border border-border"
          >
            <span className="sr-only">Back</span>
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
        ) : (
          <div />
        )}
        <p className="text-center font-display text-2xl font-black">wriceps</p>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 flex-col gap-4">{children}</main>
    </div>
  );
}

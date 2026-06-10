import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-border-soft bg-bg/80 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4 px-5 py-3 md:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12l5 5L20 6"
                stroke="#0c0a10"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            resolvd
          </span>
          <span className="hidden rounded-full bg-accent/12 px-2 py-0.5 text-[11px] font-medium text-accent sm:inline">
            inbox
          </span>
        </Link>

        {/* Faux search bar for the inbox feel */}
        <div className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] text-muted md:flex">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
            <path d="m20 20-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
          Search tickets
        </div>

        <nav className="flex items-center gap-1.5 text-[13px] text-muted sm:gap-4">
          <Link href="/about" className="px-2 py-1 transition hover:text-text">
            About
          </Link>
          <Link href="/help" className="px-2 py-1 transition hover:text-text">
            Help
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

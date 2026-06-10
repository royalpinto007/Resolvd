import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resolvd — inbox operator",
  description:
    "Triages, drafts, and acts on support tickets within policy, escalating the rest with the proposed action attached.",
};

function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 shadow-glow">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 12l5 5L20 6"
            stroke="#08080a"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-text">
        resolvd
      </span>
    </span>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="app-bg min-h-screen font-sans antialiased">
        <div className="relative z-10">
          <header className="sticky top-0 z-20 border-b border-border-soft bg-bg/70 backdrop-blur-md">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
              <Link href="/">
                <Logo />
              </Link>
              <nav className="flex items-center gap-5 text-[13px] text-muted">
                <span className="hidden sm:inline">inbox operator</span>
                <span className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-[11px]">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-good" />
                  live
                </span>
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-5xl px-5 py-10">{children}</main>
          <footer className="mx-auto max-w-5xl px-5 pb-12 pt-6 text-[12px] text-muted">
            Triage · act within policy · escalate the rest with one-tap approval.
          </footer>
        </div>
      </body>
    </html>
  );
}

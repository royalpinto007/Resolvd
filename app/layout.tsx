import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { themeInitScript } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Resolvd: inbox operator",
  description:
    "Triages, drafts, and acts on support tickets within policy, escalating the rest with the proposed action attached.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-bg min-h-screen font-sans antialiased">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Nav />
          <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10">
            {children}
          </main>
          <footer className="border-t border-border-soft">
            <div className="mx-auto flex max-w-5xl flex-col gap-2 px-5 py-6 text-[12px] text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>Triage, act within policy, escalate the rest.</span>
              <span className="flex gap-4">
                <Link href="/about" className="transition hover:text-text">
                  About
                </Link>
                <Link href="/help" className="transition hover:text-text">
                  Help
                </Link>
              </span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}

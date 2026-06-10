import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resolvd — inbox operator",
  description:
    "Triages, drafts, and acts on support tickets within policy, escalating the rest with the proposed action attached.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-mono antialiased">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
            <Link href="/" className="text-sm font-semibold tracking-tight">
              resolvd<span className="text-accent">.</span>
            </Link>
            <span className="text-[11px] uppercase tracking-widest text-muted">
              inbox operator
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-5 py-8">{children}</main>
      </body>
    </html>
  );
}

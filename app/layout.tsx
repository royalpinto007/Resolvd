import type { Metadata } from "next";
import Link from "next/link";
import { Inter, JetBrains_Mono, Sora } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { themeInitScript } from "@/components/ThemeToggle";
import { ChatWidget } from "@/components/ChatWidget";
import { SuiteLinks } from "@/components/SuiteLinks";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});
const sora = Sora({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

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
    <html
      lang="en"
      data-theme="dark"
      className={`${inter.variable} ${mono.variable} ${sora.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="app-bg min-h-screen font-sans antialiased">
        <div className="relative z-10 flex min-h-screen flex-col">
          <Nav />
          {/* pb-24 leaves room so the floating chat button never covers content. */}
          <main className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-6 pb-24 md:px-6 md:py-8">
            {children}
          </main>
          <footer className="border-t border-border-soft px-5 py-5 md:px-8">
            <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-3 text-[12px] text-muted">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>Triage, act within policy, escalate the rest.</span>
                <span className="flex gap-4">
                  <Link href="/about" className="transition hover:text-text">About</Link>
                  <Link href="/help" className="transition hover:text-text">Help</Link>
                </span>
              </div>
              <SuiteLinks />
            </div>
          </footer>
        </div>
        <ChatWidget
          name="Resolvd"
          greeting="Hi! Ask me about Resolvd, ticket triage, or when something auto-resolves vs escalates."
        />
      </body>
    </html>
  );
}

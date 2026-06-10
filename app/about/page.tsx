import Link from "next/link";

export const metadata = { title: "About: Resolvd" };

const features = [
  {
    icon: "◎",
    title: "Triages instantly",
    body: "Every incoming ticket is classified by category, urgency and sentiment.",
  },
  {
    icon: "✓",
    title: "Acts within policy",
    body: "Order status and small refunds are handled end to end, automatically.",
  },
  {
    icon: "⚑",
    title: "Escalates the risk",
    body: "Big refunds, complaints and angry customers go to a human with a plan.",
  },
  {
    icon: "✦",
    title: "One-tap approval",
    body: "Escalations carry a proposed action, approved from the Greenlite app.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 animate-fade-up">
      <section>
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          about
        </span>
        <h1 className="gradient-text mt-4 text-balance text-4xl font-semibold tracking-tight">
          Support that acts, not just drafts.
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
          Most AI support tools stop at a draft, so a human still re-reads every
          message and clicks every button and the time saving is small. Resolvd
          closes the loop: it triages, drafts, and takes the action within
          policy, then escalates only what genuinely needs a person.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="glass hover-lift rounded-2xl p-5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-[15px] font-bold text-bg">
              {f.icon}
            </div>
            <h2 className="mt-3 text-[15px] font-semibold">{f.title}</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-muted">
              {f.body}
            </p>
          </div>
        ))}
      </section>

      <section className="glass rounded-2xl p-6">
        <h2 className="text-sm font-medium text-muted">How it is built</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted">
          Next.js on Cloudflare Workers with a Supabase backend, an AI triage
          brain with a transparent keyword fallback, and a policy layer that
          decides act-or-escalate. An n8n workflow feeds it varied tickets every
          hour so the inbox stays live.
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[12px]">
          {["Next.js", "Cloudflare Workers", "Supabase", "n8n", "Ollama"].map(
            (t) => (
              <span
                key={t}
                className="rounded-md border border-border bg-bg px-2.5 py-1 text-muted"
              >
                {t}
              </span>
            ),
          )}
        </div>
      </section>

      <div className="flex gap-3">
        <Link
          href="/"
          className="rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-[13px] font-semibold text-bg"
        >
          Open the inbox
        </Link>
        <Link
          href="/help"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-[13px] transition hover:border-accent/50"
        >
          Read the docs
        </Link>
      </div>
    </div>
  );
}

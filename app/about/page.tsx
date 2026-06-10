export const metadata = { title: "About: Resolvd" };

export default function About() {
  return (
    <article className="mx-auto max-w-2xl space-y-6 animate-fade-up">
      <header className="space-y-2">
        <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          about
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Support that acts, not just drafts
        </h1>
      </header>

      <p className="text-[15px] leading-relaxed text-muted">
        Most AI support tools stop at a draft. A human still re-reads every
        message and clicks every button, so the time saving is small. Resolvd
        closes the loop: it triages, drafts, and takes the action within policy,
        then escalates only what genuinely needs a person.
      </p>

      <Section title="What it handles on its own">
        <ul className="space-y-2 text-[14px] text-muted">
          <li>Order status: looks it up and replies.</li>
          <li>Small refunds: issues them under a configurable auto-limit.</li>
          <li>Everything else: drafts a reply and routes it.</li>
        </ul>
      </Section>

      <Section title="What it escalates">
        <p className="text-[14px] leading-relaxed text-muted">
          Refunds over the limit, complaints, and anything negative at high
          urgency go to a human, with the proposed action already attached so
          approval is one tap (in the Greenlite mobile cockpit).
        </p>
      </Section>

      <Section title="How it is built">
        <p className="text-[14px] leading-relaxed text-muted">
          Next.js on Cloudflare Workers, a Supabase Postgres backend, optional
          Claude triage with a transparent keyword fallback, and a policy layer
          that decides act-or-escalate. An n8n workflow feeds it varied tickets
          every 30 minutes so the queue stays live.
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}

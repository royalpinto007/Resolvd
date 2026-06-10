import { db } from "@/lib/supabase";
import type { Ticket } from "@/lib/types";
import { DemoButton } from "@/components/DemoButton";

export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = db();
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  // Aggregate counts span all tickets; the list itself is paginated.
  const countOf = async (status?: string) => {
    let q = supabase
      .from("rv_tickets")
      .select("*", { count: "exact", head: true });
    if (status) q = q.eq("status", status);
    const { count } = await q;
    return count ?? 0;
  };
  const total = await countOf();
  const resolved = await countOf("resolved");
  const escalated = await countOf("escalated");
  const autoRate = total ? Math.round((resolved / total) * 100) : 0;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const { data } = await supabase
    .from("rv_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  const tickets = (data ?? []) as Ticket[];

  return (
    <div className="space-y-10">
      <section className="space-y-3 animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          support autonomy
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-tight">
          It doesn&apos;t just draft. It acts.
        </h1>
        <p className="max-w-xl text-[15px] leading-relaxed text-muted">
          Resolvd triages every incoming message, auto-handles the safe cases
          end to end, and escalates the rest with the proposed action already
          attached, ready for one-tap approval.
        </p>
        <div className="pt-1">
          <DemoButton />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 animate-fade-in sm:grid-cols-3">
        <Metric label="Tickets" value={total} />
        <Metric label="Auto-resolved" value={`${autoRate}%`} tone="good" />
        <Metric
          label="Awaiting human"
          value={escalated}
          tone={escalated > 0 ? "warn" : "good"}
        />
      </section>

      <HowItWorks />

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Recent tickets</h2>
        {tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="stagger grid gap-3">
            {tickets.map((t) => (
              <article
                key={t.id}
                className="rounded-2xl border border-border bg-surface p-5 shadow-card"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {t.subject || "(no subject)"}
                      </span>
                      <StatusDot status={t.status} />
                    </div>
                    <div className="mt-0.5 text-[12px] text-muted">
                      {t.sender}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {t.category && <Tag>{t.category}</Tag>}
                    {t.urgency === "high" && <Pill tone="bad">high</Pill>}
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-[13px] text-muted">
                  {t.body}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl bg-bg p-3">
                    <Label>
                      {t.action_taken ? "action taken" : "proposed action"}
                    </Label>
                    <div className="mt-1 text-[13px]">
                      {t.action_taken || t.proposed_action || "-"}
                    </div>
                    {t.reason && (
                      <div className="mt-1.5 text-[11px] text-muted">
                        {t.reason}
                      </div>
                    )}
                  </div>
                  {t.draft_reply && (
                    <div className="rounded-xl bg-bg p-3">
                      <Label>draft reply</Label>
                      <div className="mt-1 whitespace-pre-wrap text-[13px] text-muted">
                        {t.draft_reply}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
      </section>
    </div>
  );
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  const linkCls =
    "rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] transition hover:border-accent/50 hover:text-text";
  const disabled = "pointer-events-none opacity-40";
  return (
    <nav className="flex items-center justify-between pt-2 text-muted">
      <a
        href={`/?page=${page - 1}`}
        className={`${linkCls} ${page <= 1 ? disabled : ""}`}
      >
        ← Newer
      </a>
      <span className="text-[12px]">
        Page {page} of {totalPages}
      </span>
      <a
        href={`/?page=${page + 1}`}
        className={`${linkCls} ${page >= totalPages ? disabled : ""}`}
      >
        Older →
      </a>
    </nav>
  );
}

function HowItWorks() {
  const steps = [
    { n: "1", t: "Message arrives", d: "A ticket hits the inbound endpoint from your helpdesk or email." },
    { n: "2", t: "Triage", d: "Category, urgency, sentiment, and a draft reply are generated." },
    { n: "3", t: "Act in policy", d: "Safe cases (status, small refunds) are handled end to end." },
    { n: "4", t: "Escalate the rest", d: "Risky cases go to a human with the proposed action attached." },
  ];
  return (
    <section className="rounded-2xl border border-border bg-surface p-5 shadow-card animate-fade-in">
      <h2 className="mb-4 text-sm font-medium text-muted">How it works</h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {steps.map((s, i) => (
          <div key={s.n} className="relative rounded-xl bg-bg p-4">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-[13px] font-bold text-bg">
              {s.n}
            </div>
            <div className="mt-2.5 text-[13.5px] font-semibold">{s.t}</div>
            <div className="mt-1 text-[12px] leading-relaxed text-muted">
              {s.d}
            </div>
            {i < steps.length - 1 && (
              <span className="absolute -right-2 top-1/2 hidden text-muted sm:block">
                →
              </span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "good" | "warn";
}) {
  const color =
    tone === "warn" ? "text-warn" : tone === "good" ? "text-good" : "text-text";
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-card">
      <div className={`text-2xl font-semibold tabular-nums ${color}`}>
        {value}
      </div>
      <div className="mt-1 text-[12px] text-muted">{label}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const map: Record<string, { c: string; t: string }> = {
    resolved: { c: "bg-good", t: "text-good" },
    escalated: { c: "bg-warn", t: "text-warn" },
    pending: { c: "bg-muted", t: "text-muted" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] ${s.t}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.c}`} />
      {status}
    </span>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-bg px-2 py-0.5 text-[11px] text-muted">
      {children}
    </span>
  );
}

function Pill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "bad";
}) {
  return (
    <span className="rounded-md bg-bad/12 px-2 py-0.5 text-[11px] font-medium text-bad">
      {children}
    </span>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[10px] uppercase tracking-widest text-muted">
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm shadow-card">
      <p className="font-medium">No tickets yet.</p>
      <p className="mt-1 text-muted">Send one to the inbound endpoint:</p>
      <pre className="mt-3 overflow-x-auto rounded-xl bg-bg p-4 text-xs leading-relaxed text-muted">
        {`curl -X POST "$RESOLVD_URL/api/inbound" \\
  -H "x-resolvd-token: $TOKEN" \\
  -H "content-type: application/json" \\
  -d '{ "sender": "sam@buyer.com", "subject": "Where is my order?",
        "body": "status?", "orderId": "1042" }'`}
      </pre>
    </div>
  );
}

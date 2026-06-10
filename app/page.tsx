import { db } from "@/lib/supabase";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = db();
  const { data } = await supabase
    .from("rv_tickets")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  const tickets = (data ?? []) as Ticket[];
  const resolved = tickets.filter((t) => t.status === "resolved").length;
  const escalated = tickets.filter((t) => t.status === "escalated").length;
  const autoRate = tickets.length
    ? Math.round((resolved / tickets.length) * 100)
    : 0;

  return (
    <div className="space-y-10">
      <section className="space-y-3">
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
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Metric label="Tickets" value={tickets.length} />
        <Metric label="Auto-resolved" value={`${autoRate}%`} tone="good" />
        <Metric
          label="Awaiting human"
          value={escalated}
          tone={escalated > 0 ? "warn" : "good"}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">Recent tickets</h2>
        {tickets.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-3">
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
                      {t.action_taken || t.proposed_action || "—"}
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
      </section>
    </div>
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

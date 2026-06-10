import { db } from "@/lib/supabase";
import type { Ticket } from "@/lib/types";

export const dynamic = "force-dynamic";

const statusTone: Record<string, string> = {
  resolved: "text-good",
  escalated: "text-warn",
  pending: "text-muted",
};

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
    <div className="space-y-8">
      <section>
        <h1 className="text-lg font-semibold">Tickets</h1>
        <p className="mt-1 text-sm text-muted">
          Resolvd triages each incoming message, then auto-handles the safe cases
          and escalates the rest with a proposed action. {tickets.length} tickets
          · {autoRate}% auto-resolved · {escalated} awaiting a human.
        </p>
      </section>

      {tickets.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => (
            <div
              key={t.id}
              className={`rounded-lg border p-4 bg-surface ${
                t.status === "escalated" ? "border-warn/40" : "border-border"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {t.subject || "(no subject)"}{" "}
                  <span className="text-xs text-muted">— {t.sender}</span>
                </span>
                <span className="flex items-center gap-2 text-xs">
                  {t.category && (
                    <span className="rounded bg-bg px-2 py-0.5 text-muted">
                      {t.category}
                    </span>
                  )}
                  {t.urgency === "high" && (
                    <span className="rounded bg-bad/15 px-2 py-0.5 text-bad">
                      high
                    </span>
                  )}
                  <span
                    className={`uppercase ${statusTone[t.status] ?? "text-muted"}`}
                  >
                    {t.status}
                  </span>
                </span>
              </div>

              <p className="mt-2 text-xs text-muted">{t.body}</p>

              <div className="mt-3 grid gap-3 text-xs sm:grid-cols-2">
                <div className="rounded bg-bg p-2">
                  <div className="mb-1 text-[11px] uppercase tracking-widest text-muted">
                    {t.action_taken ? "action taken" : "proposed action"}
                  </div>
                  <div className="text-text">
                    {t.action_taken || t.proposed_action || "—"}
                  </div>
                  {t.reason && (
                    <div className="mt-1 text-[11px] text-muted">{t.reason}</div>
                  )}
                </div>
                {t.draft_reply && (
                  <div className="rounded bg-bg p-2">
                    <div className="mb-1 text-[11px] uppercase tracking-widest text-muted">
                      draft reply
                    </div>
                    <div className="whitespace-pre-wrap text-text">
                      {t.draft_reply}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-6 text-sm">
      <p className="font-medium">No tickets yet.</p>
      <p className="mt-1 text-muted">Send one to the inbound endpoint:</p>
      <pre className="mt-3 overflow-x-auto rounded bg-bg p-3 text-xs text-text">
        {`curl -X POST "$RESOLVD_URL/api/inbound" \\
  -H "x-resolvd-token: $RESOLVD_INBOUND_TOKEN" \\
  -H "content-type: application/json" \\
  -d '{
    "sender": "sam@buyer.com",
    "subject": "Where is my order?",
    "body": "Hi, can you tell me the status of my order?",
    "orderId": "1042"
  }'`}
      </pre>
    </div>
  );
}

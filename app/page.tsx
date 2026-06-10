import Link from "next/link";
import { db } from "@/lib/supabase";
import type { Ticket } from "@/lib/types";
import { DemoButton } from "@/components/DemoButton";

export const dynamic = "force-dynamic";

const PER_PAGE = 15;
const FILTERS = [
  { key: "all", label: "All" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
] as const;

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; status?: string };
}) {
  const supabase = db();
  const status =
    searchParams.status === "escalated" || searchParams.status === "resolved"
      ? searchParams.status
      : "all";
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;

  const countOf = async (s?: string) => {
    let q = supabase
      .from("rv_tickets")
      .select("*", { count: "exact", head: true });
    if (s) q = q.eq("status", s);
    return (await q).count ?? 0;
  };
  const total = await countOf();
  const resolved = await countOf("resolved");
  const escalated = await countOf("escalated");
  const autoRate = total ? Math.round((resolved / total) * 100) : 0;

  const counts: Record<string, number> = {
    all: total,
    escalated,
    resolved,
  };
  const filtered = counts[status];
  const totalPages = Math.max(1, Math.ceil(filtered / PER_PAGE));

  let listQ = supabase
    .from("rv_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  if (status !== "all") listQ = listQ.eq("status", status);
  const { data } = await listQ.range(from, to);
  const tickets = (data ?? []) as Ticket[];

  return (
    <div className="space-y-6">
      {/* Header band with the live action */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-card animate-fade-up md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Support inbox
          </h1>
          <p className="mt-1 text-[13px] text-muted">
            {autoRate}% auto-resolved · {escalated} waiting on a human
          </p>
        </div>
        <DemoButton />
      </div>

      {/* Inbox: filter rail + ticket list */}
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <aside className="space-y-1.5 lg:sticky lg:top-20 lg:self-start">
          {FILTERS.map((f) => {
            const active = status === f.key;
            return (
              <Link
                key={f.key}
                href={f.key === "all" ? "/" : `/?status=${f.key}`}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] transition ${
                  active
                    ? "border-accent/50 bg-accent/10 text-text"
                    : "border-transparent text-muted hover:bg-surface"
                }`}
              >
                <span className="flex items-center gap-2">
                  <Dot k={f.key} />
                  {f.label}
                </span>
                <span className="tabular-nums text-muted">{counts[f.key]}</span>
              </Link>
            );
          })}
          <div className="!mt-4 rounded-lg border border-border bg-surface p-3 text-[12px] text-muted">
            New messages are triaged automatically. Safe cases are actioned;
            risky ones land in <span className="text-warn">Escalated</span>.
          </div>
        </aside>

        <section className="min-w-0 space-y-3">
          {tickets.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="stagger overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
              {tickets.map((t) => (
                <article
                  key={t.id}
                  className="border-b border-border-soft p-4 transition last:border-0 hover:bg-surface-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={`mt-0.5 h-2 w-2 shrink-0 rounded-full ${
                          t.status === "escalated"
                            ? "bg-warn"
                            : t.status === "resolved"
                              ? "bg-good"
                              : "bg-muted"
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium">
                            {t.subject || "(no subject)"}
                          </span>
                          {t.urgency === "high" && <Pill>high</Pill>}
                        </div>
                        <div className="text-[12px] text-muted">{t.sender}</div>
                      </div>
                    </div>
                    {t.category && (
                      <span className="shrink-0 rounded-md bg-bg px-2 py-0.5 text-[11px] text-muted">
                        {t.category}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-1 pl-[18px] text-[13px] text-muted">
                    {t.body}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-2 pl-[18px] text-[12px]">
                    <span
                      className={
                        t.status === "resolved" ? "text-good" : "text-warn"
                      }
                    >
                      {t.action_taken
                        ? `✓ ${t.action_taken}`
                        : `→ ${t.proposed_action ?? "review"}`}
                    </span>
                    {t.reason && (
                      <span className="text-muted">· {t.reason}</span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
          {totalPages > 1 && <Pagination status={status} page={page} totalPages={totalPages} />}
        </section>
      </div>
    </div>
  );
}

function Dot({ k }: { k: string }) {
  const c =
    k === "escalated" ? "bg-warn" : k === "resolved" ? "bg-good" : "bg-accent";
  return <span className={`h-1.5 w-1.5 rounded-full ${c}`} />;
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-md bg-bad/12 px-2 py-0.5 text-[11px] font-medium text-bad">
      {children}
    </span>
  );
}

function Pagination({
  status,
  page,
  totalPages,
}: {
  status: string;
  page: number;
  totalPages: number;
}) {
  const base = status === "all" ? "/?" : `/?status=${status}&`;
  const linkCls =
    "rounded-lg border border-border bg-surface px-3 py-1.5 text-[13px] transition hover:border-accent/50 hover:text-text";
  const disabled = "pointer-events-none opacity-40";
  return (
    <nav className="flex items-center justify-between pt-1 text-muted">
      <a href={`${base}page=${page - 1}`} className={`${linkCls} ${page <= 1 ? disabled : ""}`}>
        ← Newer
      </a>
      <span className="text-[12px]">
        Page {page} of {totalPages}
      </span>
      <a href={`${base}page=${page + 1}`} className={`${linkCls} ${page >= totalPages ? disabled : ""}`}>
        Older →
      </a>
    </nav>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-sm shadow-card">
      <p className="font-medium">No tickets here.</p>
      <p className="mt-1 text-muted">
        Hit “Send a test ticket” above, or POST one to{" "}
        <span className="font-mono text-text">/api/inbound</span>.
      </p>
    </div>
  );
}

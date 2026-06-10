export const metadata = { title: "Help: Resolvd" };

const faqs = [
  {
    q: "How do tickets get in?",
    a: "POST them to /api/inbound with the x-resolvd-token header, from a helpdesk webhook or an email forwarder.",
  },
  {
    q: "When does it act on its own?",
    a: "Order-status requests with an order id, and refunds at or under REFUND_AUTO_LIMIT, are handled end to end. Everything else escalates.",
  },
  {
    q: "How do approvals work?",
    a: "Escalated tickets appear at /api/approvals. A human approves or denies via /api/approve, or one-taps it in the Greenlite mobile app.",
  },
  {
    q: "Does it need an AI key?",
    a: "Claude triage turns on when ANTHROPIC_API_KEY is set; without it, a transparent keyword heuristic is used, so it always works.",
  },
];

export default function Help() {
  return (
    <div className="max-w-2xl space-y-6 animate-fade-up">
      <header className="space-y-2">
        <span className="inline-block rounded-full border border-border bg-surface px-3 py-1 text-[11px] uppercase tracking-widest text-muted">
          help
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Sending tickets
        </h1>
      </header>

      <section className="rounded-2xl border border-border bg-surface p-5 shadow-card">
        <h2 className="mb-3 text-sm font-medium">Inbound example</h2>
        <pre className="overflow-x-auto rounded-xl bg-bg p-4 text-xs leading-relaxed text-muted">
          {`curl -X POST "$RESOLVD_URL/api/inbound" \\
  -H "x-resolvd-token: $TOKEN" \\
  -H "content-type: application/json" \\
  -d '{
    "sender": "sam@buyer.com",
    "subject": "Where is my order?",
    "body": "status?",
    "orderId": "1042"
  }'`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">FAQ</h2>
        <div className="stagger grid gap-3">
          {faqs.map((f) => (
            <details
              key={f.q}
              className="group rounded-2xl border border-border bg-surface p-4 shadow-card"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-[14px] font-medium">
                {f.q}
                <span className="text-muted transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-2 text-[13px] leading-relaxed text-muted">
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";

export function AiDigest({
  total,
  resolved,
  escalated,
}: {
  total: number;
  resolved: number;
  escalated: number;
}) {
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setText(null);
    const prompt =
      `Write a 2-sentence shift handover for a support lead. Inbox right now: ` +
      `${total} total tickets, ${resolved} auto-resolved by the agent, ` +
      `${escalated} escalated and waiting on a human. Mention what the human should prioritise.`;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const d = (await res.json()) as { reply?: string; error?: string };
      setText(d.reply || `Unavailable (${d.error ?? "?"}).`);
    } catch {
      setText("Network error, please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={run}
        disabled={busy}
        className="inline-flex items-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3.5 py-2 text-[13px] font-medium text-accent transition hover:bg-accent/15 disabled:opacity-50"
      >
        ✦ {busy ? "Summarizing…" : "AI inbox digest"}
      </button>
      {text && (
        <div className="mt-3 rounded-xl border border-border bg-bg/60 p-3 text-[13px] leading-relaxed text-text">
          {text}
        </div>
      )}
    </div>
  );
}

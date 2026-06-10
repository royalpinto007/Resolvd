"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Result = {
  status: "resolved" | "escalated";
  subject?: string;
  category?: string;
  proposedAction?: string;
  actionTaken?: string | null;
  reason?: string;
};

export function DemoButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function run() {
    setBusy(true);
    setResult(null);
    try {
      const res = await fetch("/api/demo", { method: "POST" });
      const data = (await res.json()) as Result;
      setResult(data);
      router.refresh(); // new ticket appears at the top of the list
    } catch {
      /* ignore */
    } finally {
      setBusy(false);
    }
  }

  const resolved = result?.status === "resolved";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          onClick={run}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-br from-accent to-accent-2 px-4 py-2 text-[13px] font-semibold text-bg transition hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "Sending…" : "▶ Send a test ticket"}
        </button>
        <span className="text-[12px] text-muted">
          watch it get triaged and acted on, or escalated
        </span>
      </div>

      {result && (
        <div
          className={`rounded-2xl border p-4 text-[13px] ${
            resolved ? "border-good/40 bg-good/5" : "border-warn/40 bg-warn/5"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            <span className={resolved ? "text-good" : "text-warn"}>
              {resolved ? "Auto-resolved ✓" : "Escalated to a human"}
            </span>
            <span className="text-muted">·</span>
            <span className="text-muted">{result.category}</span>
          </div>
          <div className="mt-1 text-muted">
            <span className="text-text">“{result.subject}”</span> ,{" "}
            {resolved ? result.actionTaken : result.proposedAction}
          </div>
          {result.reason && (
            <div className="mt-1 text-[12px] text-muted">
              why: {result.reason}
            </div>
          )}
          <div className="mt-2 text-[12px] text-muted">
            It is now the top item in Recent tickets below.
          </div>
        </div>
      )}
    </div>
  );
}

import { NextRequest, NextResponse } from "next/server";
import { db, checkInboundToken } from "@/lib/supabase";
import { triage } from "@/lib/agent";
import { decide } from "@/lib/policy";
import type { InboundPayload } from "@/lib/types";

export const runtime = "nodejs";

// POST /api/inbound — a new support message arrives (from a helpdesk webhook or
// email forwarder). Resolvd triages it, applies policy, and either auto-resolves
// (safe actions) or stores it as escalated with the proposed action attached.
export async function POST(req: NextRequest) {
  if (!checkInboundToken(req.headers.get("x-resolvd-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: InboundPayload;
  try {
    body = (await req.json()) as InboundPayload;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  if (!body.sender || !body.body) {
    return NextResponse.json(
      { error: "sender and body are required" },
      { status: 400 },
    );
  }

  const t = await triage(body.subject ?? "", body.body);
  const decision = decide(t, body);

  const supabase = db();
  const { data, error } = await supabase
    .from("rv_tickets")
    .insert({
      sender: body.sender,
      subject: body.subject ?? null,
      body: body.body,
      order_id: body.orderId ?? null,
      category: t.category,
      urgency: t.urgency,
      sentiment: t.sentiment,
      status: decision.status,
      proposed_action: decision.proposedAction,
      action_taken: decision.actionTaken,
      draft_reply: decision.draftReply,
      reason: decision.reason,
      resolved_at: decision.status === "resolved" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "store failed", detail: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    id: (data as { id: string }).id,
    status: decision.status,
    category: t.category,
    proposedAction: decision.proposedAction,
    actionTaken: decision.actionTaken,
  });
}

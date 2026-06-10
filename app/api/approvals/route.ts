import { NextRequest, NextResponse } from "next/server";
import { db, checkInboundToken } from "@/lib/supabase";

export const runtime = "nodejs";

// GET /api/approvals, the queue of escalated tickets awaiting a human decision.
// Server-side (service-role) read so clients (e.g. the Greenlite mobile app)
// never touch Supabase directly. Auth via the shared x-resolvd-token header.
export async function GET(req: NextRequest) {
  if (!checkInboundToken(req.headers.get("x-resolvd-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = db();
  const { data, error } = await supabase
    .from("rv_tickets")
    .select("id, subject, body, proposed_action, reason, created_at")
    .eq("status", "escalated")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const approvals = (data ?? []).map((t) => ({
    id: t.id as string,
    source: "resolvd",
    title: (t.subject as string) || "Support ticket",
    detail: (t.body as string) ?? "",
    proposedAction: (t.proposed_action as string) ?? "",
    reason: (t.reason as string) ?? null,
    createdAt: t.created_at as string,
  }));

  return NextResponse.json({ approvals });
}

import { NextRequest, NextResponse } from "next/server";
import { db, checkInboundToken } from "@/lib/supabase";

export const runtime = "nodejs";

// CORS so the Greenlite web app (a different origin) can read the queue.
const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,OPTIONS",
  "access-control-allow-headers": "content-type,x-resolvd-token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// GET /api/approvals, the queue of escalated tickets awaiting a human decision.
// Server-side (service-role) read so clients (e.g. the Greenlite app) never
// touch Supabase directly. Auth via the shared x-resolvd-token header.
export async function GET(req: NextRequest) {
  if (!checkInboundToken(req.headers.get("x-resolvd-token"))) {
    return NextResponse.json(
      { error: "unauthorized" },
      { status: 401, headers: CORS },
    );
  }

  const supabase = db();
  const { data, error } = await supabase
    .from("rv_tickets")
    .select("id, subject, body, proposed_action, reason, created_at")
    .eq("status", "escalated")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: CORS },
    );
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

  return NextResponse.json({ approvals }, { headers: CORS });
}

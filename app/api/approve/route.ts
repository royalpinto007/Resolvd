import { NextRequest, NextResponse } from "next/server";
import { db, checkInboundToken } from "@/lib/supabase";

export const runtime = "nodejs";

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type,x-resolvd-token",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

// POST /api/approve, a human approves (or rejects) an escalated ticket's
// proposed action. On approve, the action is recorded and the ticket resolved.
export async function POST(req: NextRequest) {
  if (!checkInboundToken(req.headers.get("x-resolvd-token"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: CORS });
  }

  const { id, approve } = (await req.json().catch(() => ({}))) as {
    id?: string;
    approve?: boolean;
  };
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const supabase = db();
  const { data: ticket } = await supabase
    .from("rv_tickets")
    .select("proposed_action, status")
    .eq("id", id)
    .maybeSingle();

  if (!ticket) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const proposed = (ticket as { proposed_action: string | null }).proposed_action;

  const { error } = await supabase
    .from("rv_tickets")
    .update(
      approve
        ? {
            status: "resolved",
            action_taken: `Approved by human: ${proposed ?? "action"}`,
            resolved_at: new Date().toISOString(),
          }
        : {
            status: "resolved",
            action_taken: "Rejected by human",
            resolved_at: new Date().toISOString(),
          },
    )
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true, approved: !!approve }, { headers: CORS });
}

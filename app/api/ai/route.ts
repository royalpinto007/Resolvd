import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";
const RESOLVD_SYSTEM =
  "You are the assistant for Resolvd, an AI support inbox operator. " +
  "Resolvd triages each incoming ticket (category, urgency, sentiment), " +
  "auto-resolves the safe cases within policy (order status, small refunds), " +
  "and escalates risky ones (large refunds, complaints, angry customers) to a " +
  "human with a proposed action attached. Answer questions about Resolvd and " +
  "support automation clearly in at most two complete short sentences.";

const GREENLITE_SYSTEM =
  "You are the assistant for Greenlite, a mobile command and approval cockpit " +
  "for AI agents. Greenlite lets operators review, approve, edit, or deny agent " +
  "actions from their phone with the context and policy trigger attached. Answer " +
  "questions about Greenlite and human-in-the-loop approvals clearly in at most " +
  "two complete short sentences.";

function cleanReply(reply?: string): string {
  return (reply ?? "")
    .trim()
    .replace(/^(?:assistant|ai|bot|resolvd|greenlite)\s*:\s*/i, "")
    .trim();
}

function fixedReply(prompt: string, context?: string): string | undefined {
  const question = prompt.trim().toLowerCase().replace(/[?!.,]+$/, "");
  const greenlite = context === "greenlite";
  if (/^(hi|hello|hey|hi there|hello there)$/.test(question)) {
    return greenlite
      ? "Hi! Ask me about Greenlite, agent approvals, or human-in-the-loop safety."
      : "Hi! Ask me about Resolvd, support automation, or how tickets are handled.";
  }
  if (/^(who are you|what are you|what do you do)$/.test(question)) {
    return greenlite
      ? "I'm the Greenlite assistant. I can explain agent approvals, policy checks, and human-in-the-loop operations."
      : "I'm the Resolvd assistant. I can explain ticket triage, safe auto-resolution, and human escalation.";
  }
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST,OPTIONS",
  "access-control-allow-headers": "content-type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: NextRequest) {
  const { prompt, history, max, context } = (await req.json().catch(() => ({}))) as {
    prompt?: string;
    history?: { role: string; content: string }[];
    max?: number;
    context?: string;
  };
  if (!prompt) {
    return NextResponse.json(
      { error: "prompt required" },
      { status: 400, headers: CORS },
    );
  }
  const fixed = fixedReply(prompt, context);
  if (fixed) return NextResponse.json({ reply: fixed }, { headers: CORS });

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured" },
      { status: 503, headers: CORS },
    );
  }

  const convo = (Array.isArray(history) ? history.slice(-4) : [])
    .map((m) =>
      `${m.role === "assistant" ? "Previous answer" : "Previous question"}: ${m.content}`,
    )
    .join("\n");
  const full = convo ? `${convo}\nCurrent question: ${prompt}` : prompt;
  const system = context === "greenlite" ? GREENLITE_SYSTEM : RESOLVD_SYSTEM;
  const outputMax = Math.min(Math.max(max ?? 140, 32), 220);

  try {
    const r = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: full },
        ],
        max_tokens: outputMax,
      }),
    });
    const d = (await r.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };
    return NextResponse.json(
      {
        reply: cleanReply(d.choices?.[0]?.message?.content),
        error: d.error?.message,
      },
      { headers: CORS },
    );
  } catch {
    return NextResponse.json(
      { error: "AI upstream unreachable" },
      { status: 502, headers: CORS },
    );
  }
}

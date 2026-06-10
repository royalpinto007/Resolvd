# Resolvd

An end-to-end inbox operator. Most "AI support" tools just draft a reply and make
a human re-read and click every action. Resolvd **triages, drafts, and acts**
within policy, issues the refund, sends the order status, closes the ticket, and
escalates only the cases that genuinely need a person, with the proposed action
already attached.

## Flow

1. A message hits `POST /api/inbound` (helpdesk webhook or email forwarder).
2. **Triage** classifies category, urgency, sentiment, and drafts a reply
   (Claude when `ANTHROPIC_API_KEY` is set; a keyword heuristic otherwise).
3. **Policy** (the guardrail) decides:
   - `order_status` with an order id -> auto-resolve (read-only lookup + reply)
   - `refund` at or under `REFUND_AUTO_LIMIT` -> auto-issue + reply
   - refund over the limit, complaints, or negative+high-urgency -> **escalate**
     with the proposed action attached
4. A human approves/rejects escalations via `POST /api/approve`.

The dashboard shows every ticket, the auto-resolution rate, what action was
taken (or proposed), and the reason.

## Stack

Next.js 14 + Supabase (`rv_*` tables in the shared project) + Cloudflare Workers
(OpenNext).

## Run

```bash
npm install
cp .env.example .env.local   # SUPABASE_*, RESOLVD_INBOUND_TOKEN, REFUND_AUTO_LIMIT
npm run dev
npm run deploy
```

Apply `supabase/schema.sql` in the Supabase SQL editor once.

## Examples

```bash
# auto-resolved: order status with an order id
curl -X POST "$URL/api/inbound" -H "x-resolvd-token: $TOKEN" \
  -H "content-type: application/json" \
  -d '{"sender":"sam@x.com","subject":"where is my order","body":"status?","orderId":"1042"}'

# auto-resolved: small refund under the limit
curl -X POST "$URL/api/inbound" -H "x-resolvd-token: $TOKEN" \
  -H "content-type: application/json" \
  -d '{"sender":"jo@x.com","subject":"refund","body":"please refund $20 for the damaged item"}'

# escalated: refund over the limit -> waits for human approval
curl -X POST "$URL/api/inbound" -H "x-resolvd-token: $TOKEN" \
  -H "content-type: application/json" \
  -d '{"sender":"al@x.com","subject":"refund","body":"I want a $900 refund now"}'
```

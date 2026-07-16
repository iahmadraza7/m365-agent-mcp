# 00 — Project Overview (Deep Memory)

> Internal engineering notes. Not for client hand-over. Captures the full mental model of this repo.

## One-line summary

A **remote MCP server** deployed on **Vercel** (Next.js App Router) that gives each ChatGPT workspace agent its **own dedicated Microsoft 365 mailbox** for reading and sending email, via the **Microsoft Graph API** using **app-only (client credentials)** auth. One deployment serves many agents; each agent is isolated by a **secret URL key** that maps to exactly one mailbox.

## Why this exists (the core problem)

- Inside ChatGPT, the native Outlook/M365 connection is tied to the **user account**, not to each agent. So natively you can only link **one** mailbox and every agent shares it.
- Fix: a custom backend (this MCP server) talks to Graph and maps **each agent → its own mailbox** for read + send. True separation per agent.

## Tech stack

| Piece | Value |
|---|---|
| Framework | Next.js `15.5.20` (App Router) |
| Runtime | Node `>=18.18.0` |
| MCP glue | `mcp-handler` `1.1.0` + `@modelcontextprotocol/sdk` `1.26.0` |
| Validation | `zod` `3.25.76` |
| UI | `react` / `react-dom` `18.3.1` (only a trivial health page) |
| Language | TypeScript `5.8.2`, strict mode |
| Hosting | Vercel (serverless functions) |
| Data store | **None** — all config in env vars |

## Repo file map

```
m365-agent-mcp/
├─ app/
│  ├─ layout.tsx                 # Root layout, <title>M365 Agent MCP</title>
│  ├─ page.tsx                   # Health page: "M365 Agent MCP server is running."
│  └─ api/agents/[agent]/[transport]/route.ts   # THE MCP endpoint (all logic)
├─ lib/
│  ├─ graph.ts                   # Microsoft Graph client (token cache + email ops)
│  └─ mailboxes.ts               # resolveMailbox(): agent key -> mailbox address
├─ .env.example                  # TENANT_ID, CLIENT_ID, CLIENT_SECRET, AGENT_MAILBOX_MAP
├─ README.md                     # Public setup/deploy guide (client-facing)
├─ CLIENT-SETUP-STEPS.md         # Call script: Microsoft + ChatGPT steps
├─ next.config.mjs               # Empty config
├─ tsconfig.json                 # Strict TS, bundler resolution
├─ package.json / package-lock.json
└─ .gitignore                    # ignores node_modules, .next, .env, .env.local, *.log
```

Git: single commit `b9e4e19 "MCP server for M365 agent mailboxes"` on `main`, tracks `origin/main`.

## Request flow (how a call works)

1. ChatGPT agent is configured with MCP URL: `https://<domain>/api/agents/<agent-key>/mcp`.
2. Next.js dynamic route `app/api/agents/[agent]/[transport]/route.ts` handles `GET`/`POST`/`DELETE`.
   - `[agent]` = the secret key. `[transport]` = `mcp` (the transport segment consumed by `mcp-handler`).
3. `handle()` awaits `ctx.params`, extracts `agent`, calls `resolveMailbox(agent)`.
   - Unknown key → `new Response("Unknown agent key", { status: 404 })`.
4. `buildHandler(agentKey, mailbox)` builds a per-request `createMcpHandler` with `basePath: /api/agents/${agentKey}` and registers the four tools, each closing over the resolved `mailbox`.
5. Tool call → `lib/graph.ts` function → Graph REST call with an app-only bearer token → JSON result returned as MCP `text` content.

## The four MCP tools (`route.ts`)

| Tool | Input (zod) | Graph op | Annotations |
|---|---|---|---|
| `list_recent_emails` | `count` int 1–25, default 10 | GET `/users/{mbx}/messages` `$top`,`$orderby receivedDateTime desc` | `readOnlyHint: true` |
| `search_emails` | `query` string(min1), `count` 1–25 default 10 | GET `/users/{mbx}/messages` `$search="..."` | `readOnlyHint: true` |
| `read_email` | `id` string(min1) | GET `/users/{mbx}/messages/{id}` | `readOnlyHint: true` |
| `send_email` | `to` email[] (min1), `subject` string, `body` string, `cc` email[]? | POST `/users/{mbx}/sendMail`, `saveToSentItems: true`, HTML body | `destructiveHint: true, openWorldHint: true` |

Tool results are returned as `content: [{ type: "text", text: JSON.stringify(...) }]`.

## `lib/graph.ts` details

- `GRAPH = https://graph.microsoft.com/v1.0`.
- **Token cache**: module-level `cachedToken {value, expiresAt}`; reused until 60s before expiry. Client-credentials grant to `https://login.microsoftonline.com/{TENANT_ID}/oauth2/v2.0/token`, scope `https://graph.microsoft.com/.default`.
- `requireEnv()` throws if `TENANT_ID`/`CLIENT_ID`/`CLIENT_SECRET` missing.
- `graphGet()` sends `Authorization: Bearer` + `ConsistencyLevel: eventual` (needed for `$search`).
- `simplify()` maps a message to `{id, subject, from, receivedDateTime, preview}`.
- `readEmail()` returns fuller shape incl. `to[]` and `body.content`.
- `sendEmail()` builds a `message` with HTML body, `toRecipients`/`ccRecipients`, `saveToSentItems: true`.
- `quotedSearch()` wraps/escapes the search query in quotes.

## `lib/mailboxes.ts` details

- `resolveMailbox(agentKey)` parses `AGENT_MAILBOX_MAP` (JSON string env var) and returns the mapped mailbox or `null`. Any parse error → `null` (→ 404 upstream).

## Environment variables (all four required)

```
TENANT_ID          # Entra directory (tenant) id
CLIENT_ID          # App registration application (client) id
CLIENT_SECRET      # App registration client secret VALUE (expires; must rotate)
AGENT_MAILBOX_MAP  # single-line JSON: {"<key>":"mailbox", ...}
```

`AGENT_MAILBOX_MAP` example:
```json
{"<reservations-key>":"reservations@kwantu.co.za","<kwantu-assistant-key>":"assistant@kwantu.co.za","<sapphire-assistant-key>":"assistant@sapphireglobalfs.com"}
```

## The three target mailboxes

- `reservations@kwantu.co.za`
- `assistant@kwantu.co.za`
- `assistant@sapphireglobalfs.com`

Two domains (`kwantu.co.za`, `sapphireglobalfs.com`) — client believes both are under **one tenant / one admin profile** (to be confirmed live). If separate tenants, the Sapphire mailbox needs its own app registration + consent in that tenant (and a separate deployment).

## Security model (defence in depth)

1. **Secret URL key** per agent — long random path segment; unknown → 404. This is a **bearer credential**: anyone with the full URL can hit that mailbox route.
2. **Microsoft-side mailbox lock** — the app should be restricted so it can only touch the three mailboxes (not the whole tenant). See `notes/03-SECURITY-APP-RBAC.md`.

This is an **MVP-grade** model, weaker than full OAuth. Acceptable per agreed scope.

## Known limitation to communicate

The server **reads mail on demand** (when the agent invokes a tool). It does **not** continuously monitor inboxes or auto-trigger an agent on new mail. Real-time monitoring would need Graph change notifications (webhooks/subscriptions) or a scheduled workflow — out of current scope.

## Build / run commands (PowerShell — use `;` not `&&`)

```powershell
npm install
npm run build          # verify build
npm run dev            # local at http://localhost:3000
Copy-Item .env.example .env.local   # local env
```

Local MCP URL: `http://localhost:3000/api/agents/<agent-key>/mcp`
Health page: `http://localhost:3000`

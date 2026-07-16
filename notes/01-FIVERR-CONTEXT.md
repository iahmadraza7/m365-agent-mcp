# 01 — Fiverr Deal Context (Deep Memory)

> Client relationship, scope, pricing, timeline, and the exact data the client shared.

## Parties

- **Client**: `digitalnomad789` (Fiverr). Timezone: South African Time (SAST, GMT+2). Works daily, generally free mornings.
- **Me (seller)**: gig — "I will build ai chatbot and ai agents using chatgpt, n8n, llm, vapi, API key, langgraph". Timezone: Pakistan (GMT+5).

## The problem the client had

Client built **multiple custom agents in ChatGPT Business (agent builder)**. Each is like an "employee". Native ChatGPT only lets them connect **one** M365 email account (account-level connector), so all agents share one mailbox. They want **a separate mailbox per agent**, read + write.

## Agreed scope (FINAL)

- **Email only. No calendar / no meetings.** (Meetings were briefly discussed at $450, then dropped.)
- 3 agents → 3 dedicated mailboxes, full send + receive separation.
- Custom MCP tool built + deployed on **client's Vercel**.
- Integration **inside each agent** in the ChatGPT builder (not just the tool standing alone).
- Secure Microsoft app registration + **admin consent** (client grants; only they can).
- End-to-end testing of send + receive across all three.
- **Full source code handed over** on completion. No lock-in. Client keeps Vercel + code.
- Short **setup guide**, including how to **renew the Microsoft app secret** later.

## Price & milestones (FINAL)

- **$300 USD fixed** (order funded on Jul 10).
- Custom offer title: "Custom MCP tool to give each ChatGPT agent its own Microsoft 365 mailbox".
- Delivery: **6 days** (a delivery-date extension was sent on Jul 16 because work waited on the client's Microsoft approval).
- **Milestone 1 (60%)**: build + deploy MCP tool on Vercel, connect to Graph, get **one** agent fully working. Client grants admin approval; I send exact steps.
- **Milestone 2 (40%)**: connect the other two agents, test send/receive across all three, hand over code + setup guide.

## Add-ons / future work

- Adding more mailboxes later: **$40 USD per mailbox** (core setup is reusable — routing + agent config + testing only). Not part of this order.

## Key clarifications captured from chat

- Agents are **Custom agents in ChatGPT Business (agent builder)**, not GPT-builder Custom GPTs.
- Client has **admin access** to the M365 tenant.
- Client has a **Vercel account**; no other hosting. Vercel confirmed suitable.
- These 3 mailboxes are **new/separate** accounts, excluding the client's own normally-linked ChatGPT connector account.
- **No mailbox password is used** — app-registration + admin consent based. Password expiry/change does **not** break anything.
- The thing that **does expire** is the **app client secret** (typ. 6–24 months). Renewal steps are in the guide.
- Client wasn't sure what a "tenant" is; believes both domains are under **one admin profile → assume one tenant** (confirm live).

## Credentials the client sent (Jul 16) — TREAT AS SECRETS

- **App (client) ID**: `13cca380-ab4e-40d9-8b85-48d5cc4aae5e`
- **Directory (tenant) ID**: `223981a6-98f1-4083-85a4-1931b5918f0a`
- **Client secret**: delivered via one-time-secret link (`uk.onetimesecret.com/...`). Link is single-use.

> App ID and Directory ID are **identifiers, not passwords**. The **client secret** and the **agent URL keys** ARE credentials and must be handled/rotated carefully. See `notes/03-SECURITY-APP-RBAC.md`.

## Current live situation (Jul 16, ~2:11 PM UTC+5)

- Order funded; build done on my side; deploying to Vercel now.
- Client completed the Microsoft app registration + consent steps from the PDF.
- Client hit an **error on the last security step** (the mailbox-restriction / Application Access Policy step) → wants to fix it together on a call.
- I told client I'd be available **after ~1.5 hours**; client is available then.
- Two docs were sent to client: `CLIENT-SETUP-STEPS.md` and a `microsoft setup.pdf` (~65.8 kB).

## Timeline of the deal (condensed)

- **Jul 03**: First contact; scoping; price settled at **$300 email-only** after meetings were added then removed.
- **Jul 04**: Client agrees to proceed; asks about password expiry (answered: no password used, only app secret).
- **Jul 10**: Client says "let's go"; custom offer sent ($300, 6 days); **order funded** 7:34 PM. Client sends 3 mailboxes + availability windows.
- **Jul 11**: Tenant question raised (one vs two tenants). Client: one admin profile → assume one tenant. Scheduling attempts.
- **Jul 12–13**: Prep for call; asked client to have M365 admin + ChatGPT workspace admin + Vercel ready. Call kept slipping.
- **Jul 14**: Sent Microsoft steps as a PDF so client can self-serve; noted one step (enable ChatGPT developer mode + publish 3 apps) still needs admin.
- **Jul 16**: Client actioned steps, sent App ID + Directory ID + secret (one-time link), hit error on last security step, requested a joint call. I'll be free in ~1.5h.

## Communication rules (important)

- **Do NOT tell the client everything is finished.** Correct framing: *core server is ready; security restriction, agent connection, and final testing remain.*
- Never paste real secrets / agent keys into Fiverr, ChatGPT, GitHub, screenshots, or docs.

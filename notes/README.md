# Engineering Memory — m365-agent-mcp

Internal deep-memory notes (not client-facing). Read in order.

| File | What it holds |
|---|---|
| [00-PROJECT-OVERVIEW.md](./00-PROJECT-OVERVIEW.md) | Architecture, stack, file map, request flow, the 4 MCP tools, Graph client, env vars, security model, limitations |
| [01-FIVERR-CONTEXT.md](./01-FIVERR-CONTEXT.md) | Client, scope, price ($300 email-only), milestones, timeline, mailboxes, App ID / Directory ID, comms rules |
| [02-STATUS-AND-REMAINING-WORK.md](./02-STATUS-AND-REMAINING-WORK.md) | Done vs not-done, ChatGPT review verdict, blocking items, code improvements, action order |
| [03-SECURITY-APP-RBAC.md](./03-SECURITY-APP-RBAC.md) | Legacy → App RBAC fix, exact PowerShell, verification, credential rotation |
| [04-CALL-SCRIPT-AND-MESSAGES.md](./04-CALL-SCRIPT-AND-MESSAGES.md) | Client message, live-call runbook, test matrix, hand-over package |

## 30-second recap

- **What**: Vercel/Next.js remote MCP server; each ChatGPT agent gets its own M365 mailbox (read+send) via Graph app-only auth. Isolation by secret URL key → mailbox.
- **Deal**: Fiverr, $300, email only, 3 agents/mailboxes, source code handed over, +$40/mailbox later.
- **Mailboxes**: `reservations@kwantu.co.za`, `assistant@kwantu.co.za`, `assistant@sapphireglobalfs.com`.
- **IDs**: App `13cca380-ab4e-40d9-8b85-48d5cc4aae5e`, Tenant `223981a6-98f1-4083-85a4-1931b5918f0a`.
- **Status**: core server built + deploying; NOT done → mailbox security restriction (App RBAC), credential rotation, ChatGPT app publish + attach, live e2e testing.
- **Client blocker**: error on the mailbox-restriction step → use **App RBAC**, not legacy `New-ApplicationAccessPolicy`.
- **Golden rules**: don't tell client it's finished; never leak secrets/keys.

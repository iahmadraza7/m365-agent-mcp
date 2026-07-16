# 04 — Call Script & Client Messages (Deep Memory)

> Ready-to-use wording and the exact live-call runbook. Keep client-safe (no "it's all done", no secrets).

## Message to send now (client is available in ~1.5h)

> Hi, yes, I'll be available in around 1.5 hours.
>
> Please keep these open: your Microsoft 365 / Entra admin account, Exchange Online admin access, your ChatGPT Business admin/owner account, and Vercel. Also keep the exact security-step error visible so I can read it.
>
> On the call we'll fix the mailbox access restriction first, then connect the three mailbox apps to their agents and run read + send tests for each one. I'll message you when I'm ready to connect.

## Framing rules (must follow)

- **Never** say the whole project is finished.
- Correct status: *core server ready; security restriction + agent connection + final testing remain.*
- Never expose real secrets or agent URL keys anywhere public.

## Pre-call prep (my side)

- Confirm Vercel deployment is live; note the production domain.
- Have the **App RBAC** command block ready (`notes/03-SECURITY-APP-RBAC.md`).
- Have the 3 fresh agent keys generation command ready.
- Know the 3 mailboxes + App ID + Directory ID.

## On-call runbook

1. **Read the client's exact PowerShell error** verbatim (screenshot/paste). Diagnose against the "likely causes" list.
2. Confirm **one tenant vs two** in the admin center (both domains under one org?).
3. Get the **Enterprise Application service-principal Object ID** (Entra > Enterprise applications). NOT the App registration object id.
4. Ensure a **mail-enabled security group** with the 3 mailboxes exists (create if needed).
5. Run App RBAC: `New-ManagementScope` → `New-ServicePrincipal` → 2× `New-ManagementRoleAssignment` (Mail.Read, Mail.Send).
6. Verify with `Test-ServicePrincipalAuthorization` for all 3 mailboxes + 1 unrelated (expect True/True and False).
7. **Remove org-wide Mail.Read/Mail.Send Entra grants** so scope isn't bypassed.
8. **Rotate**: new client secret + 3 new agent keys → update Vercel env → redeploy.
9. In ChatGPT: enable **developer mode** (workspace admin), create **3 MCP apps**, publish, attach each to the correct agent. Finish schema before publishing.
10. **Test matrix** per agent: list → search → read → send → verify sender → verify Sent Items → cross-mailbox denied → unrelated denied.
11. Explain the **on-demand read** limitation.
12. Update the guide, then submit delivery on Fiverr.

## Per-agent test matrix (tick each)

| Step | reservations@ | assistant@kwantu | assistant@sapphire |
|---|---|---|---|
| List recent | ☐ | ☐ | ☐ |
| Search known msg | ☐ | ☐ | ☐ |
| Read full msg | ☐ | ☐ | ☐ |
| Send test | ☐ | ☐ | ☐ |
| Correct sender | ☐ | ☐ | ☐ |
| In Sent Items | ☐ | ☐ | ☐ |
| Cannot read other mbx | ☐ | ☐ | ☐ |
| Unrelated mbx denied | ☐ | ☐ | ☐ |

## ChatGPT side — accurate 2026 steps (Business)

> OpenAI renamed "connectors" → "apps" (Dec 2025). Full write-capable MCP needs Business/Enterprise/Edu + developer mode; only admins/owners on Business.
> Client-facing version lives in repo root: `CHATGPT-AGENT-SETUP-STEPS.md` (sent in the interim so client can prep, minus publishing).

1. **Enable developer mode (admin)**: `chatgpt.com/admin` → Permissions & Roles → Connected data → "Developer mode / Create custom MCP connectors"; OR Settings → Apps → Advanced settings → Developer mode.
2. **Create app per agent**: Settings → Apps (`chatgpt.com/apps`, old: `/plugins`) → **+** → Name + MCP URL (ends `/mcp`) + **Auth: No authentication**. Lands in **Drafts**. Protocols: SSE / streaming HTTP.
3. **Publish (admin only)**: Workspace Settings → Apps → Drafts → Publish → approve write-action warning. Shows "custom" label.
4. **Attach**: one app per agent in the builder (Reservations / Kwantu / Sapphire).
5. **Business limitation**: published apps CANNOT be edited — must recreate + republish. So finish URLs/schema BEFORE publishing. → Do NOT create/publish apps until after security fix + key rotation + redeploy, so we only build them once with final URLs.

## Interim ask from client (Jul 16, 2:38 PM)

Client: "send me the next steps in the interim, I won't activate till we sort the security issue — saves time." → Delivered `CHATGPT-AGENT-SETUP-STEPS.md`: Part 1 (enable developer mode) safe now; Parts 2–4 wait for final URLs; Part 5 testing last.

## Hand-over package (Milestone 2)

- Full source code (already in repo / GitHub).
- Short setup guide (updated to App RBAC).
- Secret-renewal instructions (Entra > new secret → update Vercel `CLIENT_SECRET` → redeploy).
- Note: adding mailboxes later = $40/mailbox.

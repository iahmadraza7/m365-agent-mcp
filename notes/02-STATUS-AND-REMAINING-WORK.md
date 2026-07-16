# 02 — Status & Remaining Work (Deep Memory)

> Source of truth for "what's done vs what's left." Merges the code reality + the ChatGPT review verdict.

## Verdict

**Do NOT mark the project complete or deliver yet.** Core MCP server works, but the security restriction, live Graph verification, ChatGPT agent integration, and end-to-end testing (all in the offer) are not done.

## Verified / working

- `npm run build` succeeds. `node_modules` present.
- MCP endpoint initializes; the four tools are discoverable:
  `list_recent_emails`, `search_emails`, `read_email`, `send_email`.
- Invalid agent key → `404` (`resolveMailbox` returns null).
- Each valid key maps to exactly one mailbox.
- Read/send tool annotations mostly correct.
- No automated test suite exists.
- `npm install` reports **3 moderate dependency advisories** — do NOT run `npm audit fix --force` blindly.
- Could not verify live Vercel deployment, Microsoft token, mailbox access, or real sending (no prod endpoint / tenant access in this environment).

## Remaining work (blocking delivery)

### 1. Fix the Microsoft security / mailbox-restriction step  ← current client blocker
- Repo docs use **`New-ApplicationAccessPolicy`**, which Microsoft now labels **legacy**. New setups should use **Exchange Online App RBAC**.
- The client's error on the "last security step" is likely this. Full fix + commands in `notes/03-SECURITY-APP-RBAC.md`.

### 2. Rotate exposed credentials
- Treat as compromised: the **Microsoft client secret** and **all three agent URL keys** (secret was shared via link; keys may be discussed).
- App ID + Directory ID are identifiers, fine to keep.
- Steps: delete old secret → new secret → 3 new agent keys → update Vercel env → redeploy → never paste replacements anywhere public.

### 3. Finish ChatGPT integration
- Create + publish **3 MCP apps**, attach each to the correct agent:
  - Reservations Mailbox app → reservations MCP URL
  - Kwantu Assistant Mailbox app → Kwantu MCP URL
  - Sapphire Assistant Mailbox app → Sapphire MCP URL
- ChatGPT Business supports full MCP apps incl. write actions, but only **workspace admins/owners** can enable **developer mode** and publish. Each admin enables developer mode for their own account.
- ChatGPT may confirm before `send_email` depending on action controls.
- **Finish all tool-schema changes BEFORE publishing.** On Business, a published custom app can't be updated normally — changes may require recreate + republish.

### 4. Complete live end-to-end testing (per agent, all 3)
1. List recent emails
2. Search a known message
3. Read the full message
4. Send a test message
5. Confirm correct sender address
6. Confirm it appears in Sent Items
7. Confirm one agent cannot read another's mailbox
8. Confirm an unrelated tenant mailbox is denied

Also tell the client the **on-demand read limitation** (no auto inbox monitoring; would need Graph webhooks/subscriptions or a scheduled workflow).

## Code improvements before hand-over (non-blocking but recommended)

- Add explicit `readOnlyHint: false` to `send_email`.
- Require **non-empty** subject and body (currently `z.string()` allows empty).
- Add recipient / subject / body length limits.
- Consider listing `/mailFolders/inbox/messages` instead of all messages for `list_recent_emails`.
- Add a basic automated MCP discovery test.
- Add a live validation script per mailbox.
- Update BOTH setup docs from Application Access Policy → App RBAC.
- Document that the URL key is a **bearer credential**.
- Run `npm audit`, inspect the 3 moderate advisories, apply only safe non-breaking upgrades.

## Action order (do-now checklist)

1. Reply to client (see script in `notes/04-CALL-SCRIPT-AND-MESSAGES.md`).
2. Prepare Exchange **App RBAC** commands.
3. On the call, capture the client's exact PowerShell error text.
4. Fix + verify mailbox scoping (`Test-ServicePrincipalAuthorization` for all 3 + one unrelated).
5. Rotate the secret + 3 keys; update Vercel; redeploy.
6. Create + publish the 3 ChatGPT apps.
7. Attach each app to the correct agent.
8. Run the full test matrix.
9. Update the guide, then submit delivery.

## Status snapshot line (for client, safe wording)

> Core MCP server is built and deployed. Remaining: the mailbox security restriction, connecting the three agents, and final end-to-end testing.

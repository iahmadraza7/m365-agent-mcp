# ChatGPT setup — next steps for you (interim guide)

This is the ChatGPT side of the project: turning on developer mode, creating one app per agent, publishing them, and attaching each app to the right agent.

You asked for the next steps in the interim so we save time. Here they are.

**Important — read first:**
- **You can safely do Part 1 now** (turning on developer mode). It changes nothing on its own.
- **Do not do Parts 2–4 yet.** Wait until I send you the three final MCP URLs. I send those right after we finish the Microsoft security step and I redeploy. There is a reason for the order: on ChatGPT Business, once an app is published it **cannot be edited** — to change anything you have to delete and recreate it. So we only create the apps once, with the final URLs, to avoid redoing them.
- Nothing here activates email access until the Microsoft security step is done, so there is no risk in getting the ChatGPT side ready.

Everything below needs your ChatGPT **workspace admin/owner** account. A normal member cannot do it.

Note on wording: OpenAI recently renamed "connectors" to "apps". Depending on your version you may see either word. Menu labels can shift slightly, so if a label differs I have added where else to look.

---

## Part 1: Turn on developer mode (safe to do now)

Developer mode is what lets a Business workspace add a custom MCP app. On Business, only an admin can turn it on.

Do it in one of these two places (whichever your workspace shows):

**Option A — Workspace settings**
1. Go to `https://chatgpt.com/admin` (Workspace / Admin settings).
2. Open **Permissions & Roles → Connected data** (may also read "Connectors").
3. Turn on **Developer mode / Create custom MCP connectors**.

**Option B — Your account settings**
1. In ChatGPT, open **Settings → Apps** (older versions: "Connectors" or "Plugins").
2. Open **Advanced settings**.
3. Turn on **Developer mode**.

That is all for now. Tell me once it is on, and stop here until I send the three URLs.

---

## Part 2: Create one app per agent (do this after I send the three URLs)

Each agent has its own secret URL, so each agent needs its own app. We create three. I will send you the exact URLs; they look like:

```
https://<the-vercel-domain>/api/agents/<secret-key>/mcp
```

For each of the three:

1. In ChatGPT, open **Settings → Apps** (or go to `https://chatgpt.com/apps`; older versions: `chatgpt.com/plugins`).
2. Click the **+** (Create / Add custom app).
3. Fill in:
   - **Name**: use the names below so they are easy to tell apart.
   - **MCP Server URL**: paste the full URL I send (it ends in `/mcp`).
   - **Authentication**: choose **No authentication**. (Security is handled by the secret in the URL plus the Microsoft mailbox lock. There is no separate key to enter.)
4. Create it. It appears under **Drafts**.

The three apps:

| App name | Which URL |
|---|---|
| Reservations Mailbox | the reservations URL I send |
| Kwantu Assistant Mailbox | the Kwantu assistant URL I send |
| Sapphire Assistant Mailbox | the Sapphire assistant URL I send |

Please do not rename or change the URLs after this — see the note about publishing below.

---

## Part 3: Publish the three apps

On Business, only an admin/owner can publish, and this is where write actions (sending email) get approved.

1. Go to **Workspace Settings → Apps**.
2. Open **Drafts**.
3. For each of the three apps, click **Publish**.
4. Review the safety notice. It will call out that the app can perform write actions (sending email). That is expected — approve it.

Once published, each app shows in the workspace's approved apps with a **custom** label.

**One-time-only reminder:** on Business, a published app can't be edited later. If a URL ever needs to change, we delete that app and create a fresh one. So we publish only once everything is final.

---

## Part 4: Attach each app to the correct agent

1. Open each agent in the agent builder.
2. In its tools/apps section, enable **only that agent's own app**:
   - Reservations agent → **Reservations Mailbox** only
   - Kwantu assistant agent → **Kwantu Assistant Mailbox** only
   - Sapphire assistant agent → **Sapphire Assistant Mailbox** only
3. Do not enable more than one mailbox app on an agent. One app per agent keeps the mailboxes fully separated.

---

## Part 5: Testing (we do this together, last)

After the Microsoft security step is done and the apps are attached, we test each agent:

- Ask it to list recent emails.
- Ask it to read one.
- Ask it to send a test email, and confirm it arrives from the correct address and lands in that mailbox's Sent Items.
- Confirm one agent cannot see another agent's mailbox.

When an agent sends email, ChatGPT may ask you to confirm first, because sending is a write action. That is normal and can be adjusted in the agent's action settings.

---

## One thing to know about how it works

The agents **read email when you ask them to** (when the agent runs). They do **not** watch the inbox in the background or auto-reply the moment a new email arrives. If you ever want automatic "new email comes in → agent reacts" behaviour, that is a separate add-on and I can quote it.

---

## Quick recap of the order

1. **Now:** turn on developer mode (Part 1) and tell me.
2. **After the Microsoft security step:** I redeploy and send you the three final URLs.
3. **Then:** create the three apps (Part 2), publish them (Part 3), attach to agents (Part 4).
4. **Last:** we test together (Part 5) and I submit delivery.

# Setup steps for the approval call

This covers everything we do together on the call. You stay signed in as admin and I guide each step. Around 45 minutes.

Have ready:
- Microsoft 365 admin sign in
- ChatGPT Business workspace admin/owner sign in
- The three mailboxes: reservations@kwantu.co.za, assistant@kwantu.co.za, assistant@sapphireglobalfs.com

There are two sides. Part A is Microsoft. Part B is ChatGPT. Part C is for later.

---

## Part A: Microsoft 365

### A1. Register the app

1. Microsoft Entra admin center, then App registrations, then New registration.
2. Name it, for example "Agent Mailbox Connector". Single tenant. Register.
3. From the Overview page, copy the Application client id and the Directory tenant id.
4. Certificates and secrets, then New client secret. Choose an expiry. Copy the secret value immediately, it is shown only once.

### A2. Add permissions and approve

1. API permissions, then Add a permission, then Microsoft Graph, then Application permissions.
2. Add exactly these two: Mail.Read and Mail.Send.
3. Select Grant admin consent. This is the step that needs your admin rights.

Only these two permissions are used. Nothing wider is requested.

### A3. Lock access to only the three mailboxes

By default an approved app can reach every mailbox in the tenant. This step removes that. It is not optional.

1. Create a mail enabled security group containing the three mailboxes.
2. Connect to Exchange Online PowerShell.
3. Run, replacing the client id and the group address:

```
New-ApplicationAccessPolicy -AppId <CLIENT_ID> -PolicyScopeGroupId <GROUP_ADDRESS> -AccessRight RestrictAccess -Description "Restrict agent mailbox connector"
```

4. Verify each mailbox:

```
Test-ApplicationAccessPolicy -AppId <CLIENT_ID> -Identity reservations@kwantu.co.za
```

Run it for all three, and once for an unrelated mailbox, which should come back denied. The policy can take up to an hour to fully apply.

Note: if the two domains turn out to be in separate Microsoft tenants, Part A is repeated once inside the second tenant. We will see this immediately when we look at the admin center.

---

## Part B: ChatGPT

We will use the custom app or connector publishing flow available in the ChatGPT workspace. Please stay signed in with an account that can manage workspace apps/connectors. If the workspace requires admin or owner approval for custom apps, we handle that on the call.

### B1. Enable developer mode

If the workspace has a developer/custom-apps setting, turn it on from workspace settings. The exact label can vary, so we will confirm it in the UI during the call.

### B2. Create one app per agent

Each agent gets its own URL, so each agent needs its own app. We create three:

- Reservations, pointing at the reservations URL
- Kwantu assistant, pointing at its URL
- Sapphire assistant, pointing at its URL

Each URL ends in /mcp. I provide the exact URLs on the call.

For this version, do not add a ChatGPT-side token or API key. The server expects the secret URL key and the Microsoft mailbox lock from A3. If you want a formal ChatGPT OAuth flow later, that is a separate enhancement.

### B3. Publish and attach

1. Publish each app to the workspace.
2. Open each agent in the builder and enable only its own app.

Important: we confirm the URLs are correct before publishing or enabling them for agents.

### B4. Test

For each agent: list recent emails, then send one test email. We confirm the mail arrives from the correct address, and that an agent cannot see another agent's mailbox.

Reading is silent. ChatGPT may ask for confirmation before sending mail because sending is a write action.

---

## Part C: Renewing the secret later

The client secret from A1 expires on the date you chose. Before then:

1. App registration, then Certificates and secrets, then New client secret.
2. Copy the new value.
3. Update it in the Vercel environment variables and redeploy.

Nothing else changes and there is no downtime. The steps are in the handover guide.

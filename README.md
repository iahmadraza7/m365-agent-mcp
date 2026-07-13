# M365 Agent MCP

A remote MCP server for ChatGPT workspace agents. One Vercel deployment serves multiple agents, and each agent gets access only to the Microsoft 365 mailbox mapped to its secret URL key.

## Mailboxes

This project is configured for these three agent mailboxes:

- `reservations@kwantu.co.za`
- `assistant@kwantu.co.za`
- `assistant@sapphireglobalfs.com`

All three mailboxes must exist in the Microsoft 365 tenant identified by `TENANT_ID`. If one mailbox is in a different tenant, use a separate deployment for that tenant.

## Route Shape

Each MCP URL has this shape:

```text
https://<vercel-domain>/api/agents/<agent-key>/mcp
```

The app route is:

```text
app/api/agents/[agent]/[transport]/route.ts
```

`<agent-key>` is a long random secret. The server resolves it through `AGENT_MAILBOX_MAP`; unknown keys return HTTP 404.

## Tools

- `list_recent_emails`: lists recent messages from the mapped mailbox.
- `search_emails`: searches messages in the mapped mailbox.
- `read_email`: reads one message from the mapped mailbox.
- `send_email`: sends HTML email from the mapped mailbox.

No database is used. Secrets and mailbox mapping live only in environment variables.

## Microsoft Graph Setup

In Microsoft Entra admin center:

1. Create an app registration.
2. Create a client secret and copy the secret value immediately.
3. Add Microsoft Graph application permissions:
   - `Mail.Read`
   - `Mail.Send`
4. Grant admin consent for the tenant.

Recommended tenant safety control: restrict the app to only the three agent mailboxes with an Exchange Online application access policy.

```powershell
Connect-ExchangeOnline

New-DistributionGroup `
  -Name "M365 Agent MCP Mailboxes" `
  -Alias "m365-agent-mcp-mailboxes" `
  -Type Security `
  -PrimarySmtpAddress "m365-agent-mcp-mailboxes@kwantu.co.za"

Add-DistributionGroupMember -Identity "m365-agent-mcp-mailboxes@kwantu.co.za" -Member "reservations@kwantu.co.za"
Add-DistributionGroupMember -Identity "m365-agent-mcp-mailboxes@kwantu.co.za" -Member "assistant@kwantu.co.za"
Add-DistributionGroupMember -Identity "m365-agent-mcp-mailboxes@kwantu.co.za" -Member "assistant@sapphireglobalfs.com"

New-ApplicationAccessPolicy `
  -AppId "<CLIENT_ID>" `
  -PolicyScopeGroupId "m365-agent-mcp-mailboxes@kwantu.co.za" `
  -AccessRight RestrictAccess `
  -Description "Restrict M365 Agent MCP to approved agent mailboxes"

Test-ApplicationAccessPolicy -Identity "reservations@kwantu.co.za" -AppId "<CLIENT_ID>"
Test-ApplicationAccessPolicy -Identity "assistant@kwantu.co.za" -AppId "<CLIENT_ID>"
Test-ApplicationAccessPolicy -Identity "assistant@sapphireglobalfs.com" -AppId "<CLIENT_ID>"
```

Use a different `PrimarySmtpAddress` for the security group if `kwantu.co.za` is not an accepted domain in the tenant.

## Environment Variables

Set these four variables in Vercel:

```text
TENANT_ID=<directory-tenant-id>
CLIENT_ID=<application-client-id>
CLIENT_SECRET=<client-secret-value>
AGENT_MAILBOX_MAP={"<reservations-key>":"reservations@kwantu.co.za","<kwantu-assistant-key>":"assistant@kwantu.co.za","<sapphire-assistant-key>":"assistant@sapphireglobalfs.com"}
```

For local development, copy `.env.example` to `.env.local` and replace the placeholders.

## 1. Generate One Random Key Per Agent

From a terminal:

```powershell
node -e "const crypto=require('crypto'); for (const name of ['reservations','kwantu-assistant','sapphire-assistant']) console.log(name + '=' + crypto.randomBytes(24).toString('hex'))"
```

Example output shape:

```text
reservations=<reservations-key>
kwantu-assistant=<kwantu-assistant-key>
sapphire-assistant=<sapphire-assistant-key>
```

Then create the JSON map:

```json
{
  "<reservations-key>": "reservations@kwantu.co.za",
  "<kwantu-assistant-key>": "assistant@kwantu.co.za",
  "<sapphire-assistant-key>": "assistant@sapphireglobalfs.com"
}
```

When entering `AGENT_MAILBOX_MAP` in Vercel, paste it as one line with no outer quotes.

## 2. Set The Four Environment Variables In Vercel

In Vercel:

1. Open the project.
2. Go to Settings, then Environment Variables.
3. Add `TENANT_ID`, `CLIENT_ID`, `CLIENT_SECRET`, and `AGENT_MAILBOX_MAP`.
4. Apply them to Production, Preview, and Development if you want all environments to work.

With the Vercel CLI, you can also run:

```powershell
vercel env add TENANT_ID production
vercel env add CLIENT_ID production
vercel env add CLIENT_SECRET production
vercel env add AGENT_MAILBOX_MAP production
```

Repeat for `preview` and `development` if needed.

## 3. Deploy

Install dependencies and verify the build:

```powershell
npm install
npm run build
```

Deploy:

```powershell
vercel --prod
```

Or push the repo to GitHub and import it into Vercel, then deploy from the Vercel dashboard.

## 4. Get The Per-Agent MCP URLs

After deployment, use your Vercel production domain and each generated key:

```text
Reservations agent:
https://<vercel-domain>/api/agents/<reservations-key>/mcp

Kwantu assistant agent:
https://<vercel-domain>/api/agents/<kwantu-assistant-key>/mcp

Sapphire assistant agent:
https://<vercel-domain>/api/agents/<sapphire-assistant-key>/mcp
```

Paste the relevant URL into each ChatGPT workspace agent as its custom MCP server URL.

## Local Run

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Local MCP URL:

```text
http://localhost:3000/api/agents/<agent-key>/mcp
```

The health page is available at:

```text
http://localhost:3000
```

## Validation Checklist

- Unknown agent key returns HTTP 404.
- Each known key can list/read only its mapped mailbox.
- `send_email` sends from the mapped mailbox and saves to Sent Items.
- Exchange Online application access policy test passes for the three allowed mailboxes.
- Exchange Online application access policy test fails for an unrelated mailbox.

## Client Secret Renewal

Client secrets expire. Before expiry, create a new secret in the app registration, update `CLIENT_SECRET` in Vercel, and redeploy.

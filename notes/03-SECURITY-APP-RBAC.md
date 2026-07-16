# 03 — Microsoft Security: App RBAC + Credential Rotation (Deep Memory)

> The single most important technical fix. The repo docs use the legacy method; use App RBAC instead.

## Why the change

- Repo (`README.md`, `CLIENT-SETUP-STEPS.md`) uses **`New-ApplicationAccessPolicy`**.
- Microsoft now labels Application Access Policies as **legacy**; new configs should use **Exchange Online App RBAC** (Role Based Access Control for Applications).
  - Ref: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-access-policies (legacy)
  - Ref: https://learn.microsoft.com/en-us/exchange/permissions-exo/application-rbac
- App RBAC is likely why the client's "last security step" errored.

## Likely causes of the client's error

- User is not an Exchange Administrator / not in Exchange **Organization Management**.
- Wrong Object ID used.
- A normal/M365 group used incorrectly (need mail-enabled security group).
- Group membership not yet propagated.
- Exchange Online PowerShell module or permissions missing.

## CRITICAL distinction

For App RBAC you need the **Enterprise Application service-principal Object ID** — from **Entra > Enterprise applications > (the app)** — NOT the Object ID shown under **App registrations**. Microsoft explicitly warns about this.

## App RBAC command sequence (use on the call)

```powershell
Connect-ExchangeOnline

# Use the existing mail-enabled group containing the three mailboxes
$group = Get-Group "<GROUP_EMAIL_ADDRESS>"

# Create a mailbox scope from the group
New-ManagementScope `
  -Name "M365 Agent MCP Mailboxes" `
  -RecipientRestrictionFilter "MemberOfGroup -eq '$($group.DistinguishedName)'"

# OBJECT_ID must come from Entra > Enterprise applications > your app
New-ServicePrincipal `
  -AppId "<APP_ID>" `
  -ObjectId "<ENTERPRISE_APPLICATION_OBJECT_ID>" `
  -DisplayName "M365 Agent MCP"

New-ManagementRoleAssignment `
  -Name "M365 Agent MCP Mail Read" `
  -App "<ENTERPRISE_APPLICATION_OBJECT_ID>" `
  -Role "Application Mail.Read" `
  -CustomResourceScope "M365 Agent MCP Mailboxes"

New-ManagementRoleAssignment `
  -Name "M365 Agent MCP Mail Send" `
  -App "<ENTERPRISE_APPLICATION_OBJECT_ID>" `
  -Role "Application Mail.Send" `
  -CustomResourceScope "M365 Agent MCP Mailboxes"
```

Known values for this client:
- `<APP_ID>` = `13cca380-ab4e-40d9-8b85-48d5cc4aae5e`
- Tenant/Directory ID = `223981a6-98f1-4083-85a4-1931b5918f0a`
- `<ENTERPRISE_APPLICATION_OBJECT_ID>` = get live from Entra > Enterprise applications.
- `<GROUP_EMAIL_ADDRESS>` = mail-enabled security group holding the 3 mailboxes.

## Verify (bypasses propagation cache)

```powershell
Test-ServicePrincipalAuthorization -Identity "<ENTERPRISE_APPLICATION_OBJECT_ID>" -Resource "reservations@kwantu.co.za"
Test-ServicePrincipalAuthorization -Identity "<ENTERPRISE_APPLICATION_OBJECT_ID>" -Resource "assistant@kwantu.co.za"
Test-ServicePrincipalAuthorization -Identity "<ENTERPRISE_APPLICATION_OBJECT_ID>" -Resource "assistant@sapphireglobalfs.com"
# And one UNRELATED mailbox — must be denied
Test-ServicePrincipalAuthorization -Identity "<ENTERPRISE_APPLICATION_OBJECT_ID>" -Resource "<someone-else@domain>"
```

Expect `InScope = True` for the three approved mailboxes and `False` for the unrelated one, for both `Application Mail.Read` and `Application Mail.Send`.

## After App RBAC works

- **Remove the org-wide `Mail.Read` and `Mail.Send` application grants** from Entra API permissions. Otherwise the unrestricted Entra grant and the scoped RBAC are **additive**, so the app could still reach every mailbox.
- Live Graph authorization changes can take **30 min – 2 hours** to propagate (but the `Test-ServicePrincipalAuthorization` command bypasses that cache).

## Credential rotation (do before final testing)

Treat as compromised: **client secret** + **all three agent URL keys**. (App ID / Directory ID are identifiers, fine.)

1. Entra > App registrations > Certificates & secrets: **delete** current client secret.
2. **Create** a fresh client secret; copy the value once.
3. Generate **three fresh agent keys**:
   ```powershell
   node -e "const c=require('crypto');for(const n of ['reservations','kwantu-assistant','sapphire-assistant'])console.log(n+'='+c.randomBytes(24).toString('hex'))"
   ```
4. Update Vercel env: `CLIENT_SECRET` + rebuild `AGENT_MAILBOX_MAP` with the new keys.
5. **Redeploy**.
6. Never paste replacements into Fiverr / ChatGPT / GitHub / screenshots / docs.

## Note on tenants

If `kwantu.co.za` and `sapphireglobalfs.com` turn out to be **separate tenants**, repeat app registration + consent + RBAC inside the second tenant, and use a separate deployment/env for the Sapphire mailbox. Confirm live in the admin center.

// Microsoft Graph helper. Uses app-only auth (client credentials).
// All calls target a specific mailbox passed in by the caller.

const GRAPH = "https://graph.microsoft.com/v1.0";

let cachedToken: { value: string; expiresAt: number } | null = null;

function requireEnv(name: "TENANT_ID" | "CLIENT_ID" | "CLIENT_SECRET"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function userPath(mailbox: string, suffix: string, params?: Record<string, string>) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return `/users/${encodeURIComponent(mailbox)}${suffix}${query}`;
}

function quotedSearch(query: string) {
  return `"${query.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.value;
  }
  const tenantId = requireEnv("TENANT_ID");
  const clientId = requireEnv("CLIENT_ID");
  const clientSecret = requireEnv("CLIENT_SECRET");
  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );
  if (!res.ok) {
    throw new Error(`Token request failed ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = {
    value: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return cachedToken.value;
}

async function graphGet(path: string) {
  const token = await getToken();
  const res = await fetch(`${GRAPH}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      ConsistencyLevel: "eventual",
    },
  });
  if (!res.ok) {
    throw new Error(`Graph GET ${path} failed ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

type MailSummary = {
  id: string;
  subject: string;
  from?: string;
  receivedDateTime?: string;
  preview?: string;
};

function simplify(m: any): MailSummary {
  return {
    id: m.id,
    subject: m.subject,
    from: m.from?.emailAddress?.address,
    receivedDateTime: m.receivedDateTime,
    preview: m.bodyPreview,
  };
}

export async function listRecentEmails(mailbox: string, count: number) {
  const path = userPath(mailbox, "/messages", {
    $top: String(count),
    $select: "id,subject,from,receivedDateTime,bodyPreview",
    $orderby: "receivedDateTime desc",
  });
  const data = await graphGet(path);
  return (data.value || []).map(simplify);
}

export async function searchEmails(mailbox: string, query: string, count: number) {
  const path = userPath(mailbox, "/messages", {
    $search: quotedSearch(query),
    $top: String(count),
    $select: "id,subject,from,receivedDateTime,bodyPreview",
  });
  const data = await graphGet(path);
  return (data.value || []).map(simplify);
}

export async function readEmail(mailbox: string, id: string) {
  const path = userPath(mailbox, `/messages/${encodeURIComponent(id)}`, {
    $select: "id,subject,from,toRecipients,receivedDateTime,body",
  });
  const m = await graphGet(path);
  return {
    id: m.id,
    subject: m.subject,
    from: m.from?.emailAddress?.address,
    to: (m.toRecipients || []).map((r: any) => r.emailAddress?.address),
    receivedDateTime: m.receivedDateTime,
    body: m.body?.content,
  };
}

export async function sendEmail(
  mailbox: string,
  msg: { to: string[]; subject: string; body: string; cc?: string[] }
) {
  const token = await getToken();
  const payload = {
    message: {
      subject: msg.subject,
      body: { contentType: "HTML", content: msg.body },
      toRecipients: msg.to.map((a) => ({ emailAddress: { address: a } })),
      ccRecipients: (msg.cc || []).map((a) => ({ emailAddress: { address: a } })),
    },
    saveToSentItems: true,
  };
  const res = await fetch(
    `${GRAPH}/users/${encodeURIComponent(mailbox)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    throw new Error(`sendMail failed ${res.status}: ${await res.text()}`);
  }
}

// Maps an unguessable agent key (used inside the URL) to a mailbox address.
//
// Set AGENT_MAILBOX_MAP in Vercel as a single JSON string, for example:
// {"<reservations-key>":"reservations@kwantu.co.za","<kwantu-assistant-key>":"assistant@kwantu.co.za","<sapphire-assistant-key>":"assistant@sapphireglobalfs.com"}
//
// Each key is the secret path segment for one agent. Because the key is long
// and random, only someone who has the full URL can reach that mailbox. The
// Microsoft side is also locked to these three mailboxes, so this is defence
// in depth, not the only control.

export function resolveMailbox(agentKey: string): string | null {
  try {
    const raw = process.env.AGENT_MAILBOX_MAP || "{}";
    const map = JSON.parse(raw) as Record<string, string>;
    return map[agentKey] ?? null;
  } catch {
    return null;
  }
}

// Optional bearer-token gate for the MCP endpoint.
//
// If MCP_AUTH_TOKEN is unset/empty, auth is skipped (returns true). If set,
// the request must send "Authorization: Bearer <token>" and the token must
// match using a constant-time comparison.

import { timingSafeEqual } from "crypto";

function constantTimeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export function checkAuth(request: Request): boolean {
  const expected = process.env.MCP_AUTH_TOKEN;
  if (!expected) {
    return true;
  }
  const header = request.headers.get("authorization") || "";
  const prefix = "Bearer ";
  if (!header.startsWith(prefix)) {
    return false;
  }
  const provided = header.slice(prefix.length);
  return constantTimeEqual(provided, expected);
}

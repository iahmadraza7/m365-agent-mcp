import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import {
  listRecentEmails,
  searchEmails,
  readEmail,
  sendEmail,
} from "../../../../../lib/graph";
import { resolveMailbox } from "../../../../../lib/mailboxes";
import { checkAuth } from "../../../../../lib/auth";

export const maxDuration = 60;

function buildHandler(agentKey: string, mailbox: string) {
  return createMcpHandler(
    (server) => {
      server.registerTool(
        "list_recent_emails",
        {
          title: "List recent emails",
          description: "List the most recent emails in this agent's mailbox.",
          inputSchema: {
            count: z.number().int().min(1).max(25).default(10),
          },
          annotations: { readOnlyHint: true },
        },
        async ({ count }) => {
          const data = await listRecentEmails(mailbox, count);
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        }
      );

      server.registerTool(
        "search_emails",
        {
          title: "Search emails",
          description: "Search this agent's mailbox by keyword.",
          inputSchema: {
            query: z.string().min(1),
            count: z.number().int().min(1).max(25).default(10),
          },
          annotations: { readOnlyHint: true },
        },
        async ({ query, count }) => {
          const data = await searchEmails(mailbox, query, count);
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        }
      );

      server.registerTool(
        "read_email",
        {
          title: "Read email",
          description: "Read the full content of one email by its id.",
          inputSchema: {
            id: z.string().min(1),
          },
          annotations: { readOnlyHint: true },
        },
        async ({ id }) => {
          const data = await readEmail(mailbox, id);
          return {
            content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
          };
        }
      );

      server.registerTool(
        "send_email",
        {
          title: "Send email",
          description: "Send an email from this agent's mailbox.",
          inputSchema: {
            to: z.array(z.string().email()).min(1),
            subject: z.string().min(1),
            body: z.string().min(1),
            cc: z.array(z.string().email()).optional(),
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: true,
            openWorldHint: true,
          },
        },
        async ({ to, subject, body, cc }) => {
          await sendEmail(mailbox, { to, subject, body, cc });
          return {
            content: [
              {
                type: "text",
                text: `Email sent from ${mailbox} to ${to.join(", ")}`,
              },
            ],
          };
        }
      );
    },
    {},
    { basePath: `/api/agents/${agentKey}` }
  );
}

async function handle(
  request: Request,
  ctx: { params: Promise<{ agent: string }> }
) {
  if (!checkAuth(request)) {
    return new Response("Unauthorized", { status: 401 });
  }
  const { agent } = await ctx.params;
  const mailbox = resolveMailbox(agent);
  if (!mailbox) {
    return new Response("Unknown agent key", { status: 404 });
  }
  const handler = buildHandler(agent, mailbox);
  return handler(request);
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle;

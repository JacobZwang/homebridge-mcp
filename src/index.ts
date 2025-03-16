import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { HomeBridge } from "./client";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

const server = new McpServer({
  name: "homebridge",
  version: "0.1.0",
});

async function main() {
  const client = new HomeBridge();

  const tools = await client.genTools();

  for (const tool of tools) {
    server.tool(
      tool.tool.type,
      tool.tool.description,
      tool.input,
      async ({ value }, _extra): Promise<CallToolResult> => {
        try {
          const res = await client.sendToolCall(
            {
              uniqueId: tool.tool.accessory.uniqueId,
              type: tool.tool.type,
            },
            value,
          );

          return {
            isError: false,
            content: [
              {
                type: "text",
                text: JSON.stringify(res),
              },
            ],
          };
        } catch (err) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify(err),
              },
            ],
          };
        }
      },
    );
  }

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Homebridge server is running...");
}

main().catch((err) => {
  console.error("Error running server:", err);
  process.exit(1);
});

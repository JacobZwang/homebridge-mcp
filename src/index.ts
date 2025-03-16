import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { HomeBridge, type AccessoryTool } from "./client";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

function exludeTool(tool: AccessoryTool) {
  if (
    tool.tool.name.includes("burner") ||
    tool.tool.name.includes("air") ||
    tool.tool.name.includes("oven")
  ) {
    return true;
  }

  return false;
}

const server = new McpServer({
  name: "homebridge",
  version: "0.1.0",
});

async function main() {
  const client = new HomeBridge();

  const tools = await client.genTools();

  for (const tool of tools) {
    console.error("Registering tool:", tool.tool.name);
    if (tool.tool.name.length > 64) {
      throw new Error("Tool name is too long");
    }

    if (exludeTool(tool)) {
      continue;
    }

    server.tool(
      tool.tool.name,
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
            content: [],
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

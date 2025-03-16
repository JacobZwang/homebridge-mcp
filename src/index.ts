import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { HomeBridge } from "./client";

const server = new McpServer({
  name: "homebridge",
  version: "0.1.0",
});

// server.tool("name", "description", input_schema, async (input) => {})

async function main() {
  const client = new HomeBridge();

  const tools = await client.genTools();

  for (const tool of tools) {
    server.tool(
      tool.tool.type,
      tool.tool.description,
      tool.input,
      async ({ value }) => {},
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

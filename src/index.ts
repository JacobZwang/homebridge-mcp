import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { HomeBridge, type AccessoryTool } from "./client";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

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

  server.tool("list_accessories", "List all accessories", {}, async () => {
    const accessories = await client.fetchAccessories();

    return {
      content: [
        {
          type: "text",
          text: accessories
            .map((accessory) =>
              `
Accessory Id: ${accessory.uniqueId}
Accessory Type: ${accessory.humanType}
Accessory Name: ${accessory.serviceName}

Services:
${accessory.serviceCharacteristics
  .map((serviceCharacteristic) =>
    `
Name: ${serviceCharacteristic.serviceName}
ServiceType: ${serviceCharacteristic.type}
`.trim(),
  )
  .join("\n")}
`.trim(),
            )
            .join("\n"),
        },
      ],
    };
  });

  server.tool(
    "read_accessory_info",
    `
Get information from all of the accessories.

Use this to get the current state of all accessories and their services.

Also read this before writing to any accessory to determine its rules.

Make sure you've listed accessories at least once before using this.
`.trim(),
    {
      accessoryId: z.string(),
    },
    async ({ accessoryId }): Promise<CallToolResult> => {
      const accessories = await client.fetchAccessories();

      const accessory = accessories.find(
        (accessory) => accessory.uniqueId === accessoryId,
      );

      if (!accessory) {
        return {
          isError: true,
          content: [
            {
              type: "text",
              text: `Accessory with id ${accessoryId} not found`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: accessory.serviceCharacteristics
              .filter(
                (serviceCharacteristic) =>
                  serviceCharacteristic.format !== "tlv8",
              )
              .map(
                (serviceCharacteristic) =>
                  `
Accessory Id: ${accessory.uniqueId}
Accessory Type: ${accessory.humanType}
Accessory Name: ${accessory.serviceName}
Service Type: ${serviceCharacteristic.serviceType}
Description: ${serviceCharacteristic.description}
Format: ${serviceCharacteristic.format}
Current Value: ${serviceCharacteristic.value}

Permissions:
Can Read: ${serviceCharacteristic.canRead}
Can Write: ${serviceCharacteristic.canWrite}

Value Rules:
Min Value: ${serviceCharacteristic.minValue}
Max Value: ${serviceCharacteristic.maxValue}
Min Step: ${serviceCharacteristic.minStep}
---------------------------------------------------
`,
              )
              .join("\n"),
          },
        ],
      };
    },
  );

  server.tool(
    "write_accessory_value",
    "Write a value to an accessory or service by its unique id.",
    {
      accessoryId: z.string(),
      serviceType: z.string(),
      value: z.string().or(z.number()).or(z.boolean()),
    },
    async (
      { accessoryId, serviceType, value },
      _extra,
    ): Promise<CallToolResult> => {
      try {
        await client.sendToolCall(
          {
            uniqueId: accessoryId,
            type: serviceType,
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

  const transport = new StdioServerTransport();

  await server.connect(transport);

  console.error("Homebridge server is running...");
}

main().catch((err) => {
  console.error("Error running server:", err);
  process.exit(1);
});

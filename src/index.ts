import process from "node:process";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { HomeBridge } from "./client";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

const server = new McpServer({
  name: "homebridge",
  version: "0.1.0",
});

async function main() {
  const client = new HomeBridge();

  server.tool(
    "list_accessories",
    `
List all accessories.

You can then use 'read_accessory_info' and 'write_accessory_value' to read and write from the accessories/services.
`.trim(),
    {},
    async () => {
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
    },
  );

  server.tool(
    "read_accessory_info",
    `
Get information from an accessory.

Also read this before writing to any accessory/service to determine its rules.

Make sure you've listed accessories at least once before using this.
`.trim(),
    {
      accessoryId: z.string(),
    },
    async ({ accessoryId }): Promise<CallToolResult> => {
      try {
        const result = await client.readAccessoryInfo(accessoryId);

        return {
          isError: false,
          content: [result],
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

  server.tool(
    "batch_read_accessories_info",
    `
Get information from many accessories.

Use this to get the current state of all accessories and their services.

Also read this before writing to any accessory to determine its rules.

Make sure you've listed accessories at least once before using this.
`.trim(),
    {
      accessoryIds: z.array(z.string()),
    },
    async ({ accessoryIds }): Promise<CallToolResult> => {
      const accessories = await client.fetchAccessories();

      try {
        const content = await Promise.all(
          accessoryIds.map((id) => client.readAccessoryInfo(id, accessories)),
        );

        return {
          content,
        };
      } catch (err) {
        return {
          isError: false,
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

  server.tool(
    "write_accessory_value",
    `
Write a value to an accessory or service by its unique id.
Make sure to send number values unquoted.
`,
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
        await client.writeAccessoryValue(accessoryId, serviceType, value);

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

  server.tool(
    "batch_write_accessory_values",
    `
Write multiple values to accessories or services by their unique ids.

Make sure to send number values unquoted.
`,
    {
      values: z.array(
        z.object({
          accessoryId: z.string(),
          serviceType: z.string(),
          value: z.string().or(z.number()).or(z.boolean()),
        }),
      ),
    },
    async ({ values }, _extra): Promise<CallToolResult> => {
      try {
        await Promise.all(
          values.map(({ accessoryId, serviceType, value }) =>
            client.writeAccessoryValue(accessoryId, serviceType, value),
          ),
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

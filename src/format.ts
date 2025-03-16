import { z, type ZodType } from "zod";

export function formatToZod(format: string): ZodType {
  switch (format) {
    case "string":
      return z.string();
    case "int":
    case "uint8":
    case "uint16":
    case "uint32":
      return z.number().int().positive();
    case "float":
      return z.number();
    case "bool":
      return z.boolean();
    default:
      throw new Error(`Unknown format: ${format}`);
  }
}


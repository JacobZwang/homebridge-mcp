import { z } from "zod";

export function formatToZod(format: string) {
    if (format === "string") {
        return z.string();
    }

    if (format === "unint8") {
        return z.number().int().positive().lte(255);
    }

    if (format === "uint32") {
        return z.number().int().positive().lte(4294967295);
    }

    if (format === "bool") {
        return z.enum(["0", "1"])
    }

    if (format === "float") {
        return z.number();
    }

    if (format === "int") {
        return z.number().int();
    }
}
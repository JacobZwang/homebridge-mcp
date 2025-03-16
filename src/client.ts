import ky from "ky";
import { BASE_URL, HEADERS } from "./config";
import type { z } from "zod";
import { formatToZod } from "./format";

export enum ServiceType {
  ProtocolInformation = "ProtocolInformation",
  // some others idk
}

export type ServiceCharacteristicValue = string | number | boolean;

export interface ServiceCharacteristic {
  aid: number;
  iid: number;
  uuid: string;
  type: string;
  serviceType: ServiceType;
  serviceName: string;
  description: string;

  format: string;

  perms: string[];

  value: ServiceCharacteristicValue;

  canRead: boolean;
  canWrite: boolean;

  minValue?: number;
  maxValue?: number;
  minStep?: number;

  ev: boolean;
}

export interface AccessoryInfo {
  Manufacturer: string;
  Model: string;
  Name: string;
  "Serial Number": string;
  "Firmware Revision": string;
}

export interface AccessoryInstance {
  name: string;
  username: string;
  ipAddress: string;
  port: number;
  services: unknown[];
  connectionFailedCount: number;
  configurationNumber: number;
}

export interface Accessory {
  aid: number;
  iid: number;
  uuid: string;
  type: ServiceType;

  humanType: string;
  serviceName: string;

  serviceCharacteristics: ServiceCharacteristic[];
  accessoryInformation: AccessoryInfo;
  values: Record<string, ServiceCharacteristicValue>;

  instance: AccessoryInstance;

  uniqueId: string;
}

export interface AccessoryTool {
  input: {
    value: z.ZodType<unknown>;
  };
  tool: {
    accessory: {
      type: ServiceType;
      serviceName: string;
      uniqueId: string;
    };

    name: string;
    type: string;
    description: string;

    format: string;

    value: {
      current: ServiceCharacteristicValue;

      rules: {
        canRead: boolean;
        canWrite: boolean;

        minValue?: number;
        maxValue?: number;
        minStep?: number;
      };
    };
  };
}

function accessoryToTools(accessory: Accessory): AccessoryTool[] {
  return accessory.serviceCharacteristics
    .filter((serviceCharacteristic) => serviceCharacteristic.format !== "tlv8")
    .map((serviceCharacteristic) => ({
      input: {
        value: formatToZod(serviceCharacteristic.format),
      },
      tool: {
        accessory: {
          type: accessory.type,
          serviceName: accessory.serviceName,
          uniqueId: accessory.uniqueId,
        },

        name: `set_${accessory.serviceName}_${serviceCharacteristic.type}`
          .replaceAll(/ /g, "_")
          .replaceAll(/[^a-zA-Z0-9_]/g, "")
          .toLowerCase(),
        type: serviceCharacteristic.type,
        description: `
Accessory Id: ${accessory.uniqueId}
Accessory Type: ${accessory.humanType}
Accessory Name: ${accessory.serviceName}

Service Name: ${serviceCharacteristic.serviceName}
Description: ${serviceCharacteristic.description}
Format: ${serviceCharacteristic.format}
`,

        format: serviceCharacteristic.format,

        value: {
          current: serviceCharacteristic.value,

          rules: {
            canRead: serviceCharacteristic.canRead,
            canWrite: serviceCharacteristic.canWrite,

            minValue: serviceCharacteristic.minValue,
            maxValue: serviceCharacteristic.maxValue,
            minStep: serviceCharacteristic.minStep,
          },
        },
      },
    }));
}

export class HomeBridge {
  private cachedAccessories: Accessory[] | null = null;

  async fetchAccessories(cached = true): Promise<Accessory[]> {
    if (cached && this.cachedAccessories !== null) {
      return this.cachedAccessories;
    }

    const res: Accessory[] = await ky
      .get(`${BASE_URL}/api/accessories`, {
        headers: HEADERS,
      })
      .json();

    if (cached) {
      this.cachedAccessories = res;
    }

    return res;
  }

  async genTools(): Promise<AccessoryTool[]> {
    const accessories = await this.fetchAccessories();

    return accessories.flatMap(accessoryToTools);
  }

  sendToolCall(
    accessoryCharacteristic: { type: string; uniqueId: string },
    value: unknown,
  ) {
    return ky
      .put(`${BASE_URL}/api/accessories/${accessoryCharacteristic.uniqueId}`, {
        headers: HEADERS,
        json: {
          characteristicType: accessoryCharacteristic.type,
          value: value,
        },
      })
      .json();
  }
}

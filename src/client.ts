import ky from "ky";
import { BASE_URL, HEADERS } from "./config";

export enum AccessoryType {
  ProtocolInformation = "ProtocolInformation",
}

export enum ServiceCharacteristicType {}

export type ServiceCharacteristicValue = string | number | boolean;

export interface ServiceCharacteristic {
  aid: number;
  iid: number;
  uuid: string;
  type: ServiceCharacteristicType;
  serviceType: AccessoryType;
  serviceName: string;
  description: string;
  value: ServiceCharacteristicValue;
  format: string;
  perms: string[];
  canRead: boolean;
  canWrite: boolean;
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
  type: AccessoryType;

  humanType: string;
  serviceName: string;

  serviceCharacteristics: ServiceCharacteristic[];
  accessoryInformation: AccessoryInfo;
  values: Record<string, ServiceCharacteristicValue>;

  instance: AccessoryInstance;

  uniqueId: string;
}

function accessoryToTools(accessory: Accessory) {}

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
}

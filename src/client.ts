import ky from "ky";
import { BASE_URL, HEADERS } from "./config";

import type { AccessoriesResponse } from "hap-nodejs";

class HomeBridge {
  private cachedAccessories: AccessoriesResponse | null = null;

  async fetchAccessories(cached = true): Promise<AccessoriesResponse> {
    if (cached && this.cachedAccessories !== null) {
      return this.cachedAccessories;
    }

    const res: AccessoriesResponse = await ky
      .get(`${BASE_URL}/api/accessories`, {
        headers: HEADERS,
      })
      .json();

    if (cached) {
      this.cachedAccessories = res;
    }

    return res;
  }

  sendToolCall(accessoryCharacteristic: { type: string, uniqueId: string }, value: any) {
    return ky.put(`${BASE_URL}/api/accessories/${accessoryCharacteristic.uniqueId}`, {
      headers: HEADERS,
      json: {
        characteristicType: accessoryCharacteristic.type,
        value: value.toString(),
      },
    });
  }
}

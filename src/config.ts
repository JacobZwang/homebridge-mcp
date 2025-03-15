export const BASE_URL = "http://macbookair.tail4de5e2.ts.net:8581";

export const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphY29iendhbmciLCJuYW1lIjoiamFjb2J6d2FuZyIsImFkbWluIjp0cnVlLCJpbnN0YW5jZUlkIjoiYzVlOTkwYjYyY2M4ZGI0YjMwMmU5ZWViMWMxZGIwNjQ1MDFiZGM3NmZiNDY1Mzk4NmNjNGNmMjM5NjIyZWQ4NyIsImlhdCI6MTc0MjA1OTM2MywiZXhwIjoxNzQyMDg4MTYzfQ.Hepsc4jiuCOBYR7sAbS-kkN7M5Hk4cYe9W6ToN3gwoE";

export const USER_AGENT = "mcp-homebridge/0.1.0";

export const HEADERS = {
  Authorization: `Bearer ${AUTH_TOKEN}`,
  "Content-Type": "application/json",
  "User-Agent": "mcp-homebridge/0.1.0",
};

import fs from "node:fs";
import ky from "ky";

const BASE_URL = "http://macbookair.tail4de5e2.ts.net:8581";
const AUTH_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImphY29iendhbmciLCJuYW1lIjoiamFjb2J6d2FuZyIsImFkbWluIjp0cnVlLCJpbnN0YW5jZUlkIjoiYzVlOTkwYjYyY2M4ZGI0YjMwMmU5ZWViMWMxZGIwNjQ1MDFiZGM3NmZiNDY1Mzk4NmNjNGNmMjM5NjIyZWQ4NyIsImlhdCI6MTc0MjA1OTM2MywiZXhwIjoxNzQyMDg4MTYzfQ.Hepsc4jiuCOBYR7sAbS-kkN7M5Hk4cYe9W6ToN3gwoE";

ky.get(`${BASE_URL}/api/accessories`, {
  headers: {
    Authorization: `Bearer ${AUTH_TOKEN}`,
    "Content-Type": "application/json",
  },
})
  .json()
  .then((data) => {
    fs.writeFileSync("./temp.json", JSON.stringify(data));
    console.log(JSON.stringify(data, null, 2));
  });

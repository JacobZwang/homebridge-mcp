import fs from "node:fs";
import ky from "ky";

import { BASE_URL, HEADERS } from "./config";

ky.get(`${BASE_URL}/api/accessories`, {
  headers: HEADERS,
})
  .json()
  .then((data) => {
    fs.writeFileSync("./temp.json", JSON.stringify(data));
    console.log(JSON.stringify(data, null, 2));
  });

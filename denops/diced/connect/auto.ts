import { findFileUpwards } from "../util/fs.ts";

export async function detectPortFromNreplPortFile(): Promise<number> {
  const filePath = await findFileUpwards(".nrepl-port");
  const port = parseInt(await Deno.readTextFile(filePath));

  if (isNaN(port)) {
    return Promise.reject("Invalid port number");
  }
  return port;
}

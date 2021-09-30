import { fs, path } from "../deps.ts";

export async function findFileUpwards(fileName: string): Promise<string> {
  let dir = path.resolve(".");
  while (await fs.exists(dir)) {
    const filePath = path.join(dir, fileName);
    if (fs.existsSync(filePath)) {
      return filePath;
    }
    const nextDir = path.resolve(dir, "..");
    if (nextDir === dir) break;
    dir = nextDir;
  }

  throw new Deno.errors.NotFound(`${fileName} is not found`);
}

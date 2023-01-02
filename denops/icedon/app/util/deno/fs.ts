import { path } from "../../../deps.ts";

export function doesFileExists(path: string): boolean {
  try {
    return Deno.lstatSync(path).isFile;
  } catch (_) {
    return false;
  }
}

export function doesDirExists(path: string): boolean {
  try {
    return Deno.lstatSync(path).isDirectory;
  } catch (_) {
    return false;
  }
}

export function findFileUpwards(fileName: string): string {
  let dir = path.resolve(".");
  while (doesDirExists(dir)) {
    const filePath = path.join(dir, fileName);
    if (doesFileExists(filePath)) {
      return filePath;
    }
    const nextDir = path.resolve(dir, "..");
    if (nextDir === dir) break;
    dir = nextDir;
  }

  throw new Deno.errors.NotFound(`${fileName} is not found`);
}

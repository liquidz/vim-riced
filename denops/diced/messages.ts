import { dejs, Denops, fns } from "./deps.ts";
import { Diced } from "./types.ts";

export const Message = {
  NotConnected: "not connected",
} as const;

async function render(
  content: string,
  params?: dejs.Params,
): Promise<string> {
  return (params == null) ? content : dejs.renderToString(content, params);
}

// export async function echom(denops: Denops, content: string, param?: dejs.Params) {
//   const s = await render(content, param);
//
//   console.log(s);
// }

export async function echom(
  diced: Diced,
  highlight: string,
  message: string,
): Promise<void> {
  await diced.denops.cmd(`echohl ${highlight}`);
  try {
    for (const m of message.split("\n")) {
      await diced.denops.cmd(`echom '${m}'`);
    }
  } finally {
    await diced.denops.cmd("echohl None");
  }
}

export async function infoStr(diced: Diced, message: string): Promise<void> {
  return echom(diced, "MoreMsg", message);
}

export async function warningStr(diced: Diced, message: string): Promise<void> {
  return echom(diced, "WarningMsg", message);
}

export async function errorStr(diced: Diced, message: string): Promise<void> {
  return echom(diced, "ErrorMsg", message);
}

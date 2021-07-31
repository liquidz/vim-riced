import { dejs, Denops, fns } from "../deps.ts";
import { Diced } from "../types.ts";
import * as en from "./en-US.ts";

type TranslationKey = keyof typeof en.Translation;

function getMessage(key: TranslationKey): string {
  return en.Translation[key];
}

// async function render(
//   content: string,
//   params?: dejs.Params,
// ): Promise<string> {
//   return (params == null) ? content : dejs.renderToString(content, params);
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

export async function info(diced: Diced, key: TranslationKey): Promise<void> {
  return infoStr(diced, getMessage(key));
}

export async function warning(
  diced: Diced,
  key: TranslationKey,
): Promise<void> {
  return warningStr(diced, getMessage(key));
}

export async function error(diced: Diced, key: TranslationKey): Promise<void> {
  return errorStr(diced, getMessage(key));
}

import { dejs } from "../deps.ts";
import { Diced } from "../types.ts";
import * as en from "./en-US.ts";

type TranslationKey = keyof typeof en.Translation;

export async function getMessage(
  key: TranslationKey,
  params?: dejs.Params,
): Promise<string> {
  const msg = en.Translation[key];
  return await dejs.renderToString(msg, params ?? {});
}

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

export function infoStr(diced: Diced, message: string): Promise<void> {
  return echom(diced, "MoreMsg", message);
}

export function warningStr(diced: Diced, message: string): Promise<void> {
  return echom(diced, "WarningMsg", message);
}

export function errorStr(diced: Diced, message: string): Promise<void> {
  return echom(diced, "ErrorMsg", message);
}

export async function info(
  diced: Diced,
  key: TranslationKey,
  params?: dejs.Params,
): Promise<void> {
  return infoStr(diced, await getMessage(key, params));
}

export async function warning(
  diced: Diced,
  key: TranslationKey,
  params?: dejs.Params,
): Promise<void> {
  return warningStr(diced, await getMessage(key, params));
}

export async function error(
  diced: Diced,
  key: TranslationKey,
  params?: dejs.Params,
): Promise<void> {
  return errorStr(diced, await getMessage(key, params));
}

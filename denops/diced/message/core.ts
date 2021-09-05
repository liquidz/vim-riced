import { dejs } from "../deps.ts";
import { Diced } from "../types.ts";
import * as en from "./en-US.ts";

type TranslationKey = keyof typeof en.Translation;

function escape(s: string): string {
  return s.replaceAll(/'/g, "''");
}

export async function getMessage(
  key: TranslationKey,
  params?: dejs.Params,
): Promise<string> {
  const msg = en.Translation[key];
  return await dejs.renderToString(msg, params ?? {});
}

async function echomWithHighlight(
  diced: Diced,
  highlight: string,
  message: string,
): Promise<void> {
  await diced.denops.cmd(`echohl ${highlight}`);
  try {
    for (const m of message.split("\n")) {
      await diced.denops.cmd(`echom '${escape(m)}'`);
    }
  } finally {
    await diced.denops.cmd("echohl None");
  }
}

export async function echoStr(diced: Diced, message: string): Promise<void> {
  for (const m of message.split("\n")) {
    await diced.denops.cmd(`echo '${escape(m)}'`);
  }
}

export function infoStr(diced: Diced, message: string): Promise<void> {
  return echomWithHighlight(diced, "MoreMsg", message);
}

export function warningStr(diced: Diced, message: string): Promise<void> {
  return echomWithHighlight(diced, "WarningMsg", message);
}

export function errorStr(diced: Diced, message: string): Promise<void> {
  return echomWithHighlight(diced, "ErrorMsg", message);
}

export async function echo(
  diced: Diced,
  key: TranslationKey,
  params?: dejs.Params,
): Promise<void> {
  return echoStr(diced, await getMessage(key, params));
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

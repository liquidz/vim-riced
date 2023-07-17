import { App, helper, printf } from "../deps.ts";
import { memoize } from "../util/fn/memoize.ts";
import { MessageName } from "./names.ts";
import { enMessages } from "./en.ts";

const echoInitialize = memoize(
  async (app: App) => {
    const path = new URL(".", import.meta.url);
    path.pathname += "echo.vim";
    await helper.load(app.denops, path);
  },
  (_) => "once",
);

function getMessage(messageName: MessageName, params: string[]): string {
  const msg = enMessages[messageName];
  if (params.length > 0) {
    return printf.sprintf(msg, ...params);
  }
  return msg;
}

async function echoMsg(app: App, hl: string, text: string | undefined) {
  if (text === undefined) {
    return;
  }
  await echoInitialize(app);
  await app.denops.call("GivreEchoMsg", hl, text);
}

export async function raw(app: App, text: string) {
  await echoMsg(app, "Normal", text);
}

export async function echo(
  app: App,
  messageName: MessageName,
  ...params: string[]
) {
  await echoMsg(app, "Normal", getMessage(messageName, params));
}

export async function info(
  app: App,
  messageName: MessageName,
  ...params: string[]
) {
  await echoMsg(app, "MoreMsg", getMessage(messageName, params));
}

export async function warn(
  app: App,
  messageName: MessageName,
  ...params: string[]
) {
  await echoMsg(app, "WarningMsg", getMessage(messageName, params));
}

export async function error(
  app: App,
  messageName: MessageName,
  ...params: string[]
) {
  await echoMsg(app, "ErrorMsg", getMessage(messageName, params));
}

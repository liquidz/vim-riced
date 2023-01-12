import { helper, icedon, printf } from "../deps.ts";
import {
  MessageArg,
  MessageError,
  MessageInfo,
  MessageWarn,
} from "../types.ts";
import { memoize } from "../util/fn/memoize.ts";

type App = icedon.App;

const messages: Record<string, string> = {
  hello: "world",
  foo: "foo %s",
};

const echoInitialize = memoize(async (app: App) => {
  const path = new URL(".", import.meta.url);
  path.pathname += "message/echo.vim";
  await helper.load(app.denops, path);
}, (_) => "once");

function getMessage(name: string, params: unknown[]): string | undefined {
  const msg = messages[name];
  if (msg === undefined) {
    return undefined;
  }

  if (params.length > 0) {
    return printf.sprintf(msg, ...params);
  }
  return msg;
}

async function echoMsg(hl: string, app: App, args: unknown[]) {
  await echoInitialize(app);
  const params = MessageArg.parse(icedon.arg.parse(args).args);
  const msg = getMessage(params[0], params.slice(1));
  await app.denops.call("IcedonEchoMsg", hl, msg);
}

const messageInfo = {
  name: MessageInfo,
  run: async (app: App, args: unknown[]) => {
    await echoMsg("MoreMsg", app, args);
  },
};

const messageWarn = {
  name: MessageWarn,
  run: async (app: App, args: unknown[]) => {
    await echoMsg("WarningMsg", app, args);
  },
};

const messageError = {
  name: MessageError,
  run: async (app: App, args: unknown[]) => {
    await echoMsg("ErrorMsg", app, args);
  },
};

export class Api extends icedon.ApiPlugin {
  readonly name = "icedon builtin message";
  readonly apis = [messageInfo, messageWarn, messageError];
}

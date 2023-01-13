import { helper, icedon, printf, unknownutil } from "../deps.ts";
import * as t from "../types.ts";
import { memoize } from "../util/fn/memoize.ts";
import { MessageName } from "./message/names.ts";
import { enMessages } from "./message/en.ts";

type App = icedon.App;

const echoInitialize = memoize(async (app: App) => {
  const path = new URL(".", import.meta.url);
  path.pathname += "message/echo.vim";
  await helper.load(app.denops, path);
}, (_) => "once");

function getMessage(args: unknown[]): string | undefined {
  const params = t.MessageArg.parse(icedon.arg.parse(args).args);
  // TODO: fix `as`
  const name = params[0] as MessageName;
  const sprintfParams = params.slice(1);

  const msg = enMessages[name];
  if (msg === undefined) {
    return undefined;
  }

  if (sprintfParams.length > 0) {
    return printf.sprintf(msg, ...sprintfParams);
  }
  return msg;
}

async function echoMsg(app: App, hl: string, text: string | undefined) {
  if (text === undefined) {
    return;
  }
  await echoInitialize(app);
  await app.denops.call("IcedonEchoMsg", hl, text);
}

const raw = {
  name: t.MessageRaw,
  run: async (app: App, args: unknown[]) => {
    if (unknownutil.isArray<string>(args)) {
      await echoMsg(app, "Normal", args[0]);
    }
  },
};

const echo = {
  name: t.MessageEcho,
  run: async (app: App, args: unknown[]) => {
    await echoMsg(app, "Normal", getMessage(args));
  },
};

const messageInfo = {
  name: t.MessageInfo,
  run: async (app: App, args: unknown[]) => {
    await echoMsg(app, "MoreMsg", getMessage(args));
  },
};

const messageWarn = {
  name: t.MessageWarn,
  run: async (app: App, args: unknown[]) => {
    await echoMsg(app, "WarningMsg", getMessage(args));
  },
};

const messageError = {
  name: t.MessageError,
  run: async (app: App, args: unknown[]) => {
    await echoMsg(app, "ErrorMsg", getMessage(args));
  },
};

export class Api extends icedon.ApiPlugin {
  readonly apis = [raw, echo, messageInfo, messageWarn, messageError];
}

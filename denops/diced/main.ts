import { Denops, execute, unknownutil, vars } from "./deps.ts";
import {
  BaseInterceptor,
  CompleteCandidate,
  ConnectionManager,
  Diced,
  InterceptorType,
  Params,
} from "./types.ts";
import * as nreplConnect from "./nrepl/connect/core.ts";
import * as interceptor from "./interceptor/core.ts";
import * as bufForm from "./buffer/form.ts";
import {
  BufferInitializationInterceptor,
  ConnectedInterceptor,
  PortDetectionInterceptor,
} from "./interceptor/connect.ts";
import { NormalizeCodeInterceptor } from "./interceptor/eval/normalize.ts";
import { NormalizeNsPathInterceptor } from "./interceptor/ns_path.ts";
import * as msg from "./message/core.ts";
import * as nreplEval from "./nrepl/eval.ts";
import * as nreplComplete from "./nrepl/complete.ts";
import * as nreplTest from "./nrepl/test.ts";
import * as vimBufInfo from "./vim/buffer/info.ts";
import * as cmd from "./command/core.ts";

const initialInterceptors: BaseInterceptor[] = [
  new PortDetectionInterceptor(),
  new ConnectedInterceptor(),
  new NormalizeCodeInterceptor(),
  new BufferInitializationInterceptor(),
  new NormalizeNsPathInterceptor(),
];

export class DicedImpl implements Diced {
  readonly denops: Denops;
  readonly interceptors: { [key in InterceptorType]+?: BaseInterceptor[] };
  readonly connectionManager: ConnectionManager;

  constructor(denops: Denops) {
    this.denops = denops;
    this.interceptors = {};
    this.connectionManager = new nreplConnect.ConnectionManagerImpl();

    for (const i of initialInterceptors) {
      interceptor.addInterceptor(this, i);
    }
  }
}

async function initializeGlobalVariable(
  denops: Denops,
  name: string,
  defaultValue: unknown,
) {
  const value = await vars.g.get(denops, name, defaultValue);
  await vars.g.set(denops, name, value);
}

async function initializeGlobalVariables(
  denops: Denops,
  m: Record<string, unknown>,
) {
  for (const name in m) {
    await initializeGlobalVariable(denops, name, m[name]);
  }
}

export async function main(denops: Denops) {
  const diced = new DicedImpl(denops);

  denops.dispatcher = {
    async setup(): Promise<void> {
      await cmd.registerInitialCommands(diced);
      await execute(
        denops,
        `
        command! -nargs=? DicedConnect    call denops#notify("${denops.name}", "connect", [<q-args>])
        command!          DicedDisconnect call denops#notify("${denops.name}", "disconnect", [])
        command! -range   DicedTestUnderCursor call denops#notify("${denops.name}", "testUnderCursor", [])

        command! -range   DicedTest call denops#notify("${denops.name}", "test", [])

        command!          DicedOpenInfoBuffer call denops#notify("${denops.name}", "openInfoBuffer", [])
        `,
      );

      await initializeGlobalVariables(
        denops,
        { diced_does_eval_inside_comment: true },
      );
    },

    async test(): Promise<void> {
      await Promise.resolve(true);
    },

    async connect(portStr: unknown): Promise<void> {
      unknownutil.ensureString(portStr);
      const port: number = (portStr === "") ? NaN : parseInt(portStr);
      const params: Params = {
        "host": "127.0.0.1",
        "port": port,
      };
      await interceptor.execute(diced, "connect", params, async (ctx) => {
        const result = await nreplConnect.connect(
          ctx.diced,
          ctx.params["host"] || "127.0.0.1",
          ctx.params["port"] || port,
        );
        ctx.params["result"] = result;
        return ctx;
      });
    },

    async diced(fn: unknown): Promise<void> {
      if (!unknownutil.isFunction(fn)) return Promise.resolve();
      fn(diced);
    },

    async command(commandName: unknown, ...args: unknown[]): Promise<void> {
      if (!unknownutil.isString(commandName)) return;
      const c = cmd.commandMap[commandName];
      if (c == null) return;
      await c.run(diced, args);
    },

    disconnect(): Promise<void> {
      return Promise.resolve(nreplConnect.disconnect(diced));
    },

    async complete(keyword: unknown): Promise<Array<CompleteCandidate>> {
      unknownutil.ensureString(keyword);
      return await nreplComplete.candidates(diced, keyword);
    },

    async openInfoBuffer(): Promise<void> {
      await vimBufInfo.open(denops);
    },

    async testUnderCursor(): Promise<void> {
      try {
        await nreplTest.runTestUnderCursor(diced);
      } catch (err) {
        if (
          err instanceof Deno.errors.InvalidData ||
          err instanceof Deno.errors.NotFound
        ) {
          await msg.warning(diced, "NotFound");
        } else {
          throw err;
        }
      }
    },
  };

  console.log(`${denops.name}: Ready`);
  await vars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}

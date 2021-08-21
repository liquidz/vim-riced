import { Denops, execute, unknownutil, vars } from "./deps.ts";
import {
  BaseInterceptor,
  CompleteCandidate,
  ConnectionManager,
  Diced,
  InterceptorType,
  Params,
} from "./types.ts";
import * as connect from "./connect/core.ts";
import * as interceptor from "./interceptor/core.ts";
import * as paredit from "./paredit/core.ts";
import {
  ConnectedInterceptor,
  PortDetectionInterceptor,
} from "./interceptor/connect.ts";
import { NormalizeCodeInterceptor } from "./interceptor/eval/normalize.ts";
import { DebuggingEvaluationInterceptor } from "./interceptor/eval/debug.ts";
import * as msg from "./message/core.ts";
import * as nreplEval from "./nrepl/eval.ts";
import * as nreplComplete from "./nrepl/complete.ts";

const initialInterceptors: BaseInterceptor[] = [
  new PortDetectionInterceptor(),
  new ConnectedInterceptor(),
  new NormalizeCodeInterceptor(),
];

export class DicedImpl implements Diced {
  readonly denops: Denops;
  readonly interceptors: { [key in InterceptorType]+?: BaseInterceptor[] };
  readonly connectionManager: ConnectionManager;

  constructor(denops: Denops) {
    this.denops = denops;
    this.interceptors = {};
    this.connectionManager = new connect.ConnectionManagerImpl();

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
      await execute(
        denops,
        `
        command! -nargs=? DicedConnect    call denops#notify("${denops.name}", "connect", [<q-args>])
        command!          DicedDisconnect call denops#notify("${denops.name}", "disconnect", [])
        command! -nargs=1 DicedEval       call denops#notify("${denops.name}", "evalCode", [<q-args>])
        command!          DicedEvalOuterTopList      call denops#notify("${denops.name}", "evalOuterTopList", [])
        command! -range   DicedTest call denops#notify("${denops.name}", "test", [])

        command!          DicedToggleDebug call denops#notify("${denops.name}", "toggleDebug", [])
        `,
      );

      await initializeGlobalVariables(
        denops,
        { diced_does_eval_inside_comment: true },
      );
    },

    async test(): Promise<void> {
    },

    async connect(portStr: unknown): Promise<void> {
      unknownutil.ensureString(portStr);
      const port: number = (portStr === "") ? NaN : parseInt(portStr);
      const params: Params = {
        "host": "127.0.0.1",
        "port": port,
      };
      await interceptor.execute(diced, "connect", params, async (ctx) => {
        const result = await connect.connect(
          ctx.diced,
          ctx.params["host"] || "127.0.0.1",
          ctx.params["port"] || port,
        );
        ctx.params["result"] = result;
        return ctx;
      });
    },

    disconnect(): Promise<void> {
      return Promise.resolve(connect.disconnect(diced));
    },

    async evalCode(code: unknown): Promise<void> {
      unknownutil.ensureString(code);
      await nreplEval.evalCode(diced, code);
    },
    async evalOuterTopList(): Promise<void> {
      try {
        const code = await paredit.getCurrentTopForm(denops);
        await nreplEval.evalCode(diced, code);
      } catch (_err) {
        await msg.warning(diced, "NotFound");
      }
    },

    toggleDebug(): Promise<void> {
      const debug = new DebuggingEvaluationInterceptor();
      if (interceptor.hasInterceptor(diced, debug)) {
        interceptor.removeInterceptor(diced, debug);
        msg.info(diced, "Disabled", { name: "debug" });
      } else {
        interceptor.addInterceptor(diced, debug);
        msg.info(diced, "Enabled", { name: "debug" });
      }

      return Promise.resolve();
    },

    async complete(keyword: unknown): Promise<Array<CompleteCandidate>> {
      console.log(`kiteru?? ${keyword}`);
      unknownutil.ensureString(keyword);
      return await nreplComplete.candidates(diced, keyword);
    },
  };

  console.log(`${denops.name}: Ready`);
  await vars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}

import { Denops, execute, unknownutil, vars } from "./deps.ts";
import {
  BaseInterceptor,
  ConnectionManager,
  Diced,
  InterceptorType,
  Params,
} from "./types.ts";
import * as connect from "./connect/core.ts";
import * as ops from "./nrepl/operation/core.ts";
import * as interceptor from "./interceptor/core.ts";
import * as paredit from "./paredit/core.ts";
import {
  ConnectedInterceptor,
  PortDetectionInterceptor,
} from "./interceptor/connect.ts";
import { NormalizeCodeInterceptor } from "./interceptor/eval/normalize.ts";
import { DebuggingEvaluationInterceptor } from "./interceptor/eval/debug.ts";
import * as msg from "./message/core.ts";

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

async function evalCode(diced: Diced, code: string) {
  const res = await ops.evalOp(diced, code);
  for (const v of res.getAll("value")) {
    console.log(v);
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
      // const res = await paredit.getCurrentTopForm(denops).catch(() => "");
      // //const res = await denops.batch(["getpos", "'<"], ["getpos", "'>"]);
      // console.log(res);
    },

    async connect(portStr: unknown): Promise<void> {
      unknownutil.ensureString(portStr);
      const port: number = (portStr === "") ? NaN : parseInt(portStr);
      const params: Params = {
        "host": "127.0.0.1",
        "port": port,
      };
      await interceptor.execute(diced, "connect", params, async (ctx) => {
        const conn = await connect.connect(
          ctx.diced,
          ctx.params["host"] || "127.0.0.1",
          ctx.params["port"] || port,
        );
        ctx.params["connection"] = conn;
        return ctx;
      });
    },

    disconnect(): Promise<void> {
      return Promise.resolve(connect.disconnect(diced));
    },

    async evalCode(code: unknown): Promise<void> {
      unknownutil.ensureString(code);
      await evalCode(diced, code);
    },
    async evalOuterTopList(): Promise<void> {
      try {
        const code = await paredit.getCurrentTopForm(denops);
        await evalCode(diced, code);
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
    // async get_variables(): Promise<void> {
    //   // Access global variable
    //   console.log(
    //     "g:denops_helloworld",
    //     await vars.g.get(denops, "denops_helloworld"),
    //   );
    //   // Access buffer-local variable
    //   console.log(
    //     "b:denops_helloworld",
    //     await vars.b.get(denops, "denops_helloworld"),
    //   );
    //   // Access window-local variable
    //   console.log(
    //     "w:denops_helloworld",
    //     await vars.w.get(denops, "denops_helloworld"),
    //   );
    //   // Access tabpage-local variable
    //   console.log(
    //     "t:denops_helloworld",
    //     await vars.t.get(denops, "denops_helloworld"),
    //   );
    //   // Access Vim's variable
    //   console.log("v:errmsg", await vars.v.get(denops, "errmsg"));
    // },
    //
    // async set_variables(): Promise<void> {
    //   // Replace global variable
    //   await vars.g.set(denops, "denops_helloworld", "Global HOGEHOGE");
    //   // Replace buffer-local variable
    //   await vars.b.set(denops, "denops_helloworld", "Buffer HOGEHOGE");
    //   // Replace window-local variable
    //   await vars.w.set(denops, "denops_helloworld", "Window HOGEHOGE");
    //   // Replace tabpage-local variable
    //   await vars.t.set(denops, "denops_helloworld", "Tabpage HOGEHOGE");
    //   // Replace Vim's variable
    //   await vars.v.set(denops, "errmsg", "Vim HOGEHOGE");
    // },
    //
    // async remove_variables(): Promise<void> {
    //   // Remove global variable
    //   await vars.g.remove(denops, "denops_helloworld");
    //   // Remove buffer-local variable
    //   await vars.b.remove(denops, "denops_helloworld");
    //   // Remove window-local variable
    //   await vars.w.remove(denops, "denops_helloworld");
    //   // Remove tabpage-local variable
    //   await vars.t.remove(denops, "denops_helloworld");
    // },
    //
    // async register_autocmd(): Promise<void> {
    //   await denops.cmd("new");
    //   // Register autocmd
    //   await autocmd.group(denops, "denops_helloworld", (helper) => {
    //     // Use 'helper.remove()' to remove autocmd
    //     helper.remove("*", "<buffer>");
    //     // Use 'helper.define()' to define autocmd
    //     helper.define(
    //       "CursorHold",
    //       "<buffer>",
    //       "echomsg 'Hello Denops CursorHold'",
    //     );
    //     helper.define(
    //       ["BufEnter", "BufLeave"],
    //       "<buffer>",
    //       "echomsg 'Hello Denops BufEnter/BufLeave'",
    //     );
    //   });
    // },
  };

  console.log(`${denops.name}: Ready`);
  await vars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}

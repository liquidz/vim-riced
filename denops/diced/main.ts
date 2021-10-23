import { core, denops, dpsAutocmd, dpsVars } from "./deps.ts";
import { intercept } from "./intercept.ts";

function defineAutocmdNotifications(
  denops: denops.Denops,
  events: Array<dpsAutocmd.AutocmdEvent>,
) {
  dpsAutocmd.group(denops, "diced autocmd notifications", (helper) => {
    for (const event of events) {
      helper.define(
        event,
        ["*.clj", "*.cljs", "*.cljc"],
        `call denops#notify('${denops.name}', 'autocmd', [${event}])`,
      );
    }
  });
}

export async function main(denops: denops.Denops) {
  const diced = core.newDiced();

  denops.dispatcher = {
    async setup(): Promise<void> {
      defineAutocmdNotifications(denops, [
        "BufEnter",
        "BufNewFile",
        "BufRead",
        "BufWritePost",
        "VimLeave",
      ]);
    },

    async connect(hostname: unknown, port: unknown): Promise<void> {
      if (typeof hostname !== "string" || typeof port !== "number") return;

      console.log(`connecting to ${hostname}:${port}`);

      const conn = await core.connect(diced, hostname, port);
      console.log(conn);
    },

    autocmd(event: unknown): Promise<void> {
      if (typeof event !== "string") return Promise.resolve();
      intercept(
        diced,
        denops,
        `vim${event}`,
        {},
        (ctx) => Promise.resolve(ctx),
      );
      return Promise.resolve();
    },
  };

  await dpsVars.g.set(denops, "diced#initialized", true);
  await denops.cmd("doautocmd <nomodeline> User DicedReady");
}

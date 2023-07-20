import { App, BaseInterceptor, core, z } from "../deps.ts";

const CONNECT_GROUP = "connect";
const OUTPUT_GROUP = "output";
const DEFAULT_HOSTNAME = "127.0.0.1";

export const ArgSchema = z.object({
  // input
  hostname: z.string().optional(),
  port: z.number(),
  baseDirectory: z.string().optional(),
  // output
  doesConnected: z.boolean().optional(),
});
export type Arg = z.infer<typeof ArgSchema>;

export class BaseConnectInterceptor extends BaseInterceptor<Arg> {
  readonly group = CONNECT_GROUP;
}

export class BaseOutputInterceptor
  extends BaseInterceptor<core.nrepl.NreplOutput> {
  readonly group = OUTPUT_GROUP;
}

export async function connect(app: App, arg: Arg): Promise<boolean> {
  const res = await app.intercept<Arg>(CONNECT_GROUP, arg, async (ctx) => {
    ctx.params.hostname ??= DEFAULT_HOSTNAME;
    ctx.params.doesConnected = await ctx.app.core.connect(ctx.params);

    if (ctx.params.doesConnected && ctx.app.core.current != null) {
      const client = ctx.app.core.current.client;
      // Fetch standard outputs/errors from stream
      Promise.race([
        (async () => {
          for await (const output of client.output) {
            app.intercept(OUTPUT_GROUP, output, (ctx) => Promise.resolve(ctx));
          }
        })(),
        client.closed,
      ]);
    }

    return ctx;
  });

  return res.doesConnected ?? false;
}

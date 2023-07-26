import { App, BaseInterceptor, z } from "../deps.ts";

const DISCONNECT_GROUP = "disconnect";
const DISCONNECT_ALL_GROUP = "disconnectAll";

export const ArgSchema = z.object({
  isDisconnected: z.boolean().optional(),
});
export type Arg = z.infer<typeof ArgSchema>;

export class BaseDisconnectInterceptor extends BaseInterceptor<Arg> {
  readonly group = DISCONNECT_GROUP;
}

export class BaseDisconnectAllInterceptor extends BaseInterceptor<Arg> {
  readonly group = DISCONNECT_ALL_GROUP;
}

export async function disconnect(app: App): Promise<boolean> {
  const res = await app.intercept<Arg>(DISCONNECT_GROUP, {}, async (ctx) => {
    ctx.params.isDisconnected = await ctx.app.core.disconnect();
    return ctx;
  });
  return res.isDisconnected ?? false;
}

export async function disconnectAll(app: App): Promise<boolean> {
  const res = await app.intercept<Arg>(
    DISCONNECT_ALL_GROUP,
    {},
    async (ctx) => {
      ctx.params.isDisconnected = await ctx.app.core.disconnectAll();
      return ctx;
    },
  );
  return res.isDisconnected ?? false;
}

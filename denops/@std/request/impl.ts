import { App, BencodeObjectSchema, core, z } from "../deps.ts";

export const interceptGroup = "request";

const ContextSchema = z.record(z.unknown());
export const ArgSchema = z.object({
  // input
  message: BencodeObjectSchema,
  option: z
    .object({
      context: ContextSchema.optional(),
      doesWaitResponse: z.boolean().optional(),
    })
    .optional(),
  // output
  response: z.instanceof(core.NreplResponseImpl).optional(),
});
export type Arg = z.infer<typeof ArgSchema>;

export async function request(
  app: App,
  arg: Arg,
): Promise<core.NreplResponseImpl> {
  const res = await app.intercept<Arg>(interceptGroup, arg, async (ctx) => {
    ctx.params.response = await ctx.app.core.request(
      ctx.params.message,
      ctx.params.option,
    );

    return ctx;
  });

  if (res.response == null) {
    return Promise.reject(new Deno.errors.InvalidData("no response"));
  }

  return res.response;
}

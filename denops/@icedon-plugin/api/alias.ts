import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;
type Position = icedon.Position;

/**
 * cf ../builtin/info_buffer.ts
 */
export function appendLinesToInfoBuffer(app: App, lines: string[]) {
  return app.requestApi("icedon_append_to_info_buffer", lines);
}

/**
 * cf ../builtin/nrepl_op.ts
 */
export async function isSupportedOp(
  app: App,
  op: string,
  force?: boolean,
): Promise<boolean> {
  const res = await app.requestApi(
    t.NreplDescribeApi,
    { force: force } as t.NreplDescribeArg,
  ) as icedon.NreplResponse;

  const ops = res.getOne("ops");
  if (!unknownutil.isObject(ops)) {
    return false;
  }
  return (ops[op] !== undefined);
}

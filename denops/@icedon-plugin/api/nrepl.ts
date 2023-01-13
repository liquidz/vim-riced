import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";
import * as api from "../api.ts";

type App = icedon.App;

const describeCacheKey = "__icedon_nrepl_op_describe__";
const describeCacheTtl = 60 * 60 * 24 * 1000;

/**
 * cf ../builtin/nrepl_op.ts
 */
export async function isSupportedOp(
  app: App,
  op: string,
  disableCache?: boolean,
): Promise<boolean> {
  let resp: unknown = undefined;

  if (!disableCache) {
    resp = await api.cache.get(app, describeCacheKey);
  }

  if (resp === undefined) {
    resp = await app.requestApi(t.NreplDescribeApi, []);
    if ((resp as icedon.NreplResponse).getOne("ops") != null) {
      await api.cache.set(app, describeCacheKey, resp, describeCacheTtl);
    }
  }

  const ops = (resp as icedon.NreplResponse).getOne("ops");
  if (!unknownutil.isObject(ops)) {
    return false;
  }
  return (ops[op] !== undefined);
}

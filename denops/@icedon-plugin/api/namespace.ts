import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;

/**
 * cf ../builtin/namespace.ts
 */

export async function getName(app: App): Promise<string> {
  const res = await app.requestApi(t.GetNsNameApi, []);
  unknownutil.assertString(res);
  return res;
}

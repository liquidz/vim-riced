import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;
type Position = icedon.Position;

/**
 * cf ../builtin/cursor.ts
 */

export async function getPosition(app: App): Promise<Position> {
  const res = await app.requestApi(t.GetCursorPositionApi, []);
  unknownutil.assertArray<number>(res);
  return [res[0], res[1]];
}

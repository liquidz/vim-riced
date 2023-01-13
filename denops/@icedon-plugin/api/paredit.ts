import { icedon, unknownutil } from "../deps.ts";
import * as t from "../types.ts";

type App = icedon.App;
type Position = icedon.Position;

/**
 * cf ../builtin/paredit.ts
 */

export async function getCurrentTopForm(app: App): Promise<[string, Position]> {
  const res = await app.requestApi(t.GetCurrentTopFormApi, []);
  unknownutil.assertArray(res);
  unknownutil.assertString(res[0]);
  unknownutil.assertNumber(res[1]);
  unknownutil.assertNumber(res[2]);
  return [res[0], [res[1], res[2]]];
}

export async function getCurrentForm(app: App): Promise<[string, Position]> {
  const res = await app.requestApi(t.GetCurrentFormApi, []);
  unknownutil.assertArray(res);
  unknownutil.assertString(res[0]);
  unknownutil.assertNumber(res[1]);
  unknownutil.assertNumber(res[2]);
  return [res[0], [res[1], res[2]]];
}

export async function getNsForm(app: App): Promise<[string, Position]> {
  const res = await app.requestApi(t.GetNsFormApi, []);
  unknownutil.assertArray(res);
  unknownutil.assertString(res[0]);
  unknownutil.assertNumber(res[1]);
  unknownutil.assertNumber(res[2]);
  return [res[0], [res[1], res[2]]];
}

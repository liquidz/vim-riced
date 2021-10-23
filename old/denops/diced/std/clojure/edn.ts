import { edn, unknownutil } from "../../deps.ts";

export function parse(s: string): unknown {
  return edn.parseEDNString(s.replaceAll(/(^"+|"+$)/g, ""), {
    mapAs: "object",
    listAs: "array",
    keywordAs: "string",
  });
}

export function getString(
  parsedObject: unknown,
  keys: Array<string>,
): string | undefined {
  let res = parsedObject;

  for (const k of keys) {
    if (unknownutil.isObject(res) && res[k] != null) {
      res = res[k];
    } else {
      return;
    }
  }

  if (unknownutil.isString(res)) return res;
}

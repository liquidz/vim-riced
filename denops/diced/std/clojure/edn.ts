import { edn } from "../../deps.ts";

export function parse(s: string): unknown {
  return edn.parseEDNString(s.replaceAll(/(^"+|"+$)/g, ""), {
    mapAs: "object",
    listAs: "array",
    keywordAs: "string",
  });
}

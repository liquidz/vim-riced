import { CompleteCandidate, Diced } from "../types.ts";
import { nrepl, unknownutil } from "../deps.ts";
import * as opsCider from "./operation/cider.ts";
import * as nreplNs from "./namespace.ts";
import * as core from "../core/mod.ts";

const typeToKind: Record<string, string> = {
  "class": "c",
  "field": "i",
  "function": "f",
  "keyword": "k",
  "local": "l",
  "macro": "m",
  "method": "f",
  "namespace": "n",
  "resource": "r",
  "special-form": "s",
  "static-field": "i",
  "static-method": "f",
  "var": "v",
} as const;

function getArgList(arglist: nrepl.bencode.Bencode): Array<string> {
  const args = arglist ?? [];
  unknownutil.ensureArray<string>(args);

  return args.map((arg) => {
    if (arg.indexOf("(quote ") !== -1) {
      return arg.substr(7, arg.length - 8);
    }
    return arg;
  });
}

function candidate(c: nrepl.bencode.Bencode): CompleteCandidate | null {
  if (!nrepl.bencode.isObject(c)) {
    return null;
  }

  const word = c["candidate"];
  if (word == null) return null;
  unknownutil.ensureString(word);

  const type = c["type"] ?? "var";
  unknownutil.ensureString(type);

  const doc = c["doc"] ?? "";
  unknownutil.ensureString(doc);

  return {
    word: word,
    kind: typeToKind[type] ?? "v",
    menu: getArgList(c["arglists"]).join(" "),
    info: doc,
    icase: 1,
  };
}

export async function candidates(
  diced: Diced,
  base: string,
  option?: { ns?: string },
): Promise<Array<CompleteCandidate>> {
  if (!core.isConnected(diced)) {
    return [];
  }
  const _option = option || {};

  // TODO checking support for `complete` op
  const resp = await opsCider.completeOp(diced, {
    ns: _option.ns ?? await nreplNs.name(diced),
    prefix: base,
  });

  const completions = resp.getFirst("completions") ?? [];
  unknownutil.ensureArray(completions);

  return completions
    .map((c) => candidate(c))
    .filter((x) => x != null) as Array<CompleteCandidate>;
}

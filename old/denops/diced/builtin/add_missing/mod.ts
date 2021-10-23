import {
  BaseInterceptor,
  BasePlugin,
  Command,
  Diced,
  InterceptorContext,
} from "../../types.ts";

import { unknownutil } from "../../deps.ts";

import * as bufForm from "../../std/buffer/form.ts";
import * as opsRefactor from "../../std/nrepl/operation/refactor.ts";
import * as cljEdn from "../../std/clojure/edn.ts";
import * as msg from "../../std/message/core.ts";

export const AddMissing: Command = {
  name: "AddMissing",
  run: async (diced, _) => {
    console.log("start");
    const symbol = await bufForm.cword(diced);
    const resp = await opsRefactor.resolveMissing(diced, symbol);

    const candidateEdn = resp.getFirst("candidates");
    if (!unknownutil.isString(candidateEdn)) {
      await msg.error(diced, "NotFound");
      return;
    }

    const res = cljEdn.parse(candidateEdn);
    if (!unknownutil.isArray(res)) {
      return;
    }
    const candidates = res.map((v) => {
      const nameStr = cljEdn.getString(v, ["name", "sym"]);
      const typeStr = cljEdn.getString(v, ["type"]);
      return (nameStr != null && typeStr === "ns") ? nameStr : "";
    }).filter((v) => v !== "");
    console.log(candidates);
  },
};

// { name: { sym: "clojure.set" }, type: "ns" },

// if c >= 65 && c <= 90
//   return iced#promise#call('iced#nrepl#op#iced#java_class_candidates', [symbol, g:iced#ns#class_map])
//         \.then(funcref('s:__add_missing_java_class_select_candidates'))
// elseif kondo.is_analyzed()
//   return s:__add_missing_by_clj_kondo_analysis(symbol)
// elseif iced#nrepl#is_supported_op('resolve-missing')
//   call iced#nrepl#op#refactor#add_missing(symbol, {resp ->
//        \ s:__add_missing_ns_resolve_missing(symbol, resp)})
// else
//   return iced#message#error('not_supported')
// endif

export class Plugin extends BasePlugin {
  readonly interceptors = [];

  readonly commands = [
    AddMissing,
  ];
}

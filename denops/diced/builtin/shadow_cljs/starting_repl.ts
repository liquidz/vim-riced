import { BaseInterceptor, Diced, InterceptorContext } from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import * as extSelector from "../../std/external/selector.ts";
import * as nreplEval from "../../std/nrepl/eval.ts";
import * as cljEdn from "../../std/clojure/edn.ts";

import { CandidateName } from "./constant.ts";

async function getBuildIds(diced: Diced): Promise<Array<string>> {
  const res = await nreplEval.evalCode(
    diced,
    `(do (require 'shadow.cljs.devtools.api)
         (->> (shadow.cljs.devtools.api/get-build-ids)
              (filter shadow.cljs.devtools.api/worker-running?)
              (pr-str)))`,
  );
  const parsed = cljEdn.parse(res.join(""));
  if (!unknownutil.isArray<string>(parsed)) return [];

  return parsed;
}

async function getTargetBuildId(diced: Diced): Promise<string> {
  const buildIds = await getBuildIds(diced);
  const l = buildIds.length;
  if (l === 0) return "";
  if (l === 1) return buildIds[0];

  const selected = await extSelector.start(diced, buildIds);
  return selected.text;
}

export class StartingReplInterceptor extends BaseInterceptor {
  readonly type = "connect";
  readonly name = "diced shadow-cljs starting REPL";
  readonly requires = ["diced shadow-cljs port detection"];

  async leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const diced = ctx.request.diced;
    if (ctx.response == null) return ctx;
    if (ctx.response.params["name"] !== CandidateName) return ctx;

    const buildId = await getTargetBuildId(diced);
    if (buildId === "") {
      // TODO: error log
      return ctx;
    }
    console.log(buildId);
    await nreplEval.evalCode(
      diced,
      `(do (shadow.cljs.devtools.api/watch :${buildId})
           (shadow.cljs.devtools.api/nrepl-select :${buildId}))`,
    );

    ctx.response.params["type"] = "cljs";
    return ctx;
  }
}

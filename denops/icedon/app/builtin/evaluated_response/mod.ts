import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorPlugin,
} from "../../../types.ts";
import { NreplResponse } from "../../../core/types.ts";

class EvaluatedResponseInterceptor extends BaseInterceptor {
  readonly name: string = "icedon_evaluated_response";
  readonly type: string = "evaluate";

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.arg.params["response"] === undefined) {
      return Promise.resolve(ctx);
    }
    const resp = ctx.arg.params["response"] as NreplResponse;
    for (const v of resp.get("value")) {
      if (v === null) continue;
      console.log(v);
    }
    return Promise.resolve(ctx);
  }
}

export class Interceptor extends InterceptorPlugin {
  readonly name = "icedon builtin evaluated response";
  readonly interceptors = [
    new EvaluatedResponseInterceptor(),
  ];
}

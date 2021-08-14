import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorType,
} from "../../types.ts";
import { nrepl } from "../../deps.ts";

export class DebuggingEvaluationInterceptor extends BaseInterceptor {
  readonly type: InterceptorType = "eval";
  readonly name: string = "debugging evaluation";

  enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    console.log(">>>>> REQUEST");
    console.log(ctx.request.params["message"]);
    return Promise.resolve(ctx);
  }

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    if (ctx.response != null) {
      const done = ctx.response.params["response"] as nrepl.NreplDoneResponse;
      console.log("<<<<< RESPONSE");
      for (const res of done.responses) {
        console.log(res.response);
      }
    }
    return Promise.resolve(ctx);
  }
}

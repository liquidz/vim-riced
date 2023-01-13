import {
  InterceptorContext,
  InterceptorHandler,
  InterceptorPlugin,
} from "../types.ts";

export class HandlerInterceptor extends InterceptorPlugin {
  readonly type = "__handler__";

  private fn: InterceptorHandler;

  constructor(fn: InterceptorHandler) {
    super("__handler__");
    this.fn = fn;
  }

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const res = await this.fn(ctx.arg);
    if (res instanceof Error) throw res;
    ctx.arg = res;
    return ctx;
  }
}

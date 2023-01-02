import {
  BaseInterceptor,
  InterceptorContext,
  InterceptorHandler,
} from "../types.ts";

export class HandlerInterceptor extends BaseInterceptor {
  readonly type: string = "__handler__";
  readonly name: string = "__handler__";

  private fn: InterceptorHandler;

  constructor(fn: InterceptorHandler) {
    super();
    this.fn = fn;
  }

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const res = await this.fn(ctx.arg);
    if (res instanceof Error) throw res;
    ctx.arg = res;
    return ctx;
  }
}

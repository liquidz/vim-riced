import {
  Interceptor,
  InterceptorContext,
  InterceptorHandler,
} from "../types.ts";

export class HandlerInterceptor<T> implements Interceptor<T> {
  readonly name: string;
  readonly #handler: InterceptorHandler<T>;

  constructor(fn: InterceptorHandler<T>) {
    this.name = "__handler__";
    this.#handler = fn;
  }

  async enter(ctx: InterceptorContext<T>): Promise<InterceptorContext<T>> {
    const res = await this.#handler(ctx.arg);
    if (res instanceof Error) throw res;
    ctx.arg = res;
    return ctx;
  }
}

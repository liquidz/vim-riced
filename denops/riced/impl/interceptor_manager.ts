import {
  App,
  BaseInterceptor,
  Interceptor,
  InterceptorContext,
  InterceptorHandler,
  InterceptorManager,
  InterceptorParams,
} from "../types.ts";
import { interceptor } from "../deps.ts";

class HandlerInterceptor<T> implements Interceptor<T> {
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

export class InterceptorManagerImpl implements InterceptorManager {
  #interceptorRecord: Record<string, Interceptor<unknown>[]> = {};

  registerInterceptor(newInterceptor: BaseInterceptor<unknown>): boolean {
    const group = newInterceptor.group;
    const interceptors = this.#interceptorRecord[group] ?? [];
    if (interceptors.find((i) => i.name === newInterceptor.name) != null) {
      return false;
    }
    this.#interceptorRecord[group] = [...interceptors, newInterceptor];

    return true;
  }

  sortInterceptors() {
    for (const group of Object.keys(this.#interceptorRecord)) {
      const interceptors = this.#interceptorRecord[group] ?? [];
      if (interceptors.length === 0) {
        continue;
      }

      this.#interceptorRecord[group] = interceptor.reorder<
        Interceptor<unknown>
      >(interceptors);
    }
  }

  async execute<T>(
    app: App,
    group: string,
    arg: T,
    handler: InterceptorHandler<T>,
  ): Promise<T> {
    const interceptors = [
      ...((this.#interceptorRecord[group] ?? []) as Interceptor<T>[]),
      ...((this.#interceptorRecord["*"] ?? []) as Interceptor<T>[]),
      new HandlerInterceptor<T>(handler),
    ];

    const res = await interceptor.execute<InterceptorParams<T>>(interceptors, {
      app,
      group,
      params: arg,
    });
    return res.params;
  }
}

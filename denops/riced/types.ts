import { core, Denops, interceptor } from "./deps.ts";

export type App = {
  readonly denops: Denops;
  readonly core: core.Core;
  readonly interceptorManager: InterceptorManager;

  intercept<T>(
    group: string,
    arg: T,
    handler: InterceptorHandler<T>,
  ): Promise<T>;
};

// ===== FUNCTION =====

export type Function = {
  readonly name: string;
  readonly exec: (app: App, args: unknown) => Promise<unknown>;
};

export abstract class BaseFunction {
  readonly name: string;
  readonly functions: Function[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

// ===== INTERCEPTOR =====

export type InterceptorParams<T> = {
  app: App;
  group: string;
  params: T;
};
export type Interceptor<T> = interceptor.Interceptor<InterceptorParams<T>>;
export type InterceptorContext<T> = interceptor.Context<InterceptorParams<T>>;
export type InterceptorHandler<T> = (
  param: InterceptorParams<T>,
) => Promise<InterceptorParams<T> | Error>;
export type InterceptorExecutionError<T> = interceptor.ExecutionError<
  InterceptorParams<T>
>;

export abstract class BaseInterceptor<T> implements Interceptor<T> {
  readonly name: string;
  readonly group: string = "default";

  constructor(name: string) {
    this.name = name;
  }

  enter(ctx: InterceptorContext<T>): Promise<InterceptorContext<T>> {
    return Promise.resolve(ctx);
  }

  leave(ctx: InterceptorContext<T>): Promise<InterceptorContext<T>> {
    return Promise.resolve(ctx);
  }

  error(
    ctx: InterceptorContext<T>,
    _: InterceptorExecutionError<T>,
  ): Promise<InterceptorContext<T>> {
    return Promise.resolve(ctx);
  }
}

export type InterceptorManager = {
  registerInterceptor(newInterceptor: BaseInterceptor<unknown>): boolean;

  sortInterceptors(): void;

  execute<T>(
    app: App,
    group: string,
    arg: T,
    handler: InterceptorHandler<T>,
  ): Promise<T>;
};

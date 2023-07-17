import { core, Denops } from "../deps.ts";
import { App, InterceptorHandler, InterceptorManager } from "../types.ts";
import { InterceptorManagerImpl } from "./interceptor_manager.ts";

export class AppImpl implements App {
  readonly denops: Denops;
  readonly core: core.Core;
  readonly interceptorManager: InterceptorManager;

  constructor({ denops, core }: { denops: Denops; core: core.Core }) {
    this.denops = denops;
    this.core = core;
    this.interceptorManager = new InterceptorManagerImpl();
  }

  run(name: string, args: unknown): Promise<unknown> {
    return this.denops.dispatch(
      this.denops.name,
      "run",
      name,
      JSON.stringify(args),
    );
  }

  intercept<T>(
    group: string,
    arg: T,
    handler: InterceptorHandler<T>,
  ): Promise<T> {
    return this.interceptorManager.execute<T>(this, group, arg, handler);
  }
}

import { Denops, interceptor } from "./deps.ts";
import { Icedon } from "../@icedon-core/mod.ts";

// Re-export
export * from "../@icedon-core/types.ts";

export type Position = [number, number];

export type App = {
  readonly denops: Denops;
  readonly icedon: Icedon;
  readonly plugin: Plugin;

  requestApi(name: string, args: unknown[]): Promise<unknown>;
  requestApi(name: string, args: Record<string, unknown>): Promise<unknown>;

  intercept(
    type: string,
    params: UnknownParams,
    handler: InterceptorHandler,
  ): Promise<UnknownParams>;
};

export type Command = {
  name?: string;
  nargs?: string;
  range?: boolean;
  complete?: string;
  args?: string;
  plug?: string;
};

export type Plugin = {
  apiMap: Record<string, Api>;
  interceptorsMap: Record<string, InterceptorPlugin[]>;

  registerApiPlugin(app: App, plugin: ApiPlugin): Promise<void>;
  removeApiPlugin(app: App, plugin: ApiPlugin): Promise<void>;
  replaceApiPlugin(app: App, plugin: ApiPlugin): Promise<void>;

  registerInterceptorPlugin(app: App, plugin: InterceptorPlugin): Promise<void>;
  removeInterceptorPlugin(app: App, plugin: InterceptorPlugin): Promise<void>;
  replaceInterceptorPlugin(app: App, plugin: InterceptorPlugin): Promise<void>;

  loadPlugin(app: App, filePath: string): Promise<void>;
  sortInterceptors(): void;
};

// ===== Interceptor
export type UnknownParams = Record<string, unknown>;
export type InterceptorParams = {
  app: App;
  params: UnknownParams;
};
export type Interceptor = interceptor.Interceptor<InterceptorParams>;
export type InterceptorContext = interceptor.Context<InterceptorParams>;
export type InterceptorHandler = (
  param: InterceptorParams,
) => Promise<InterceptorParams | Error>;

export abstract class InterceptorPlugin implements Interceptor {
  readonly name: string = "none";
  readonly type: string = "none";
  readonly requires: string[] = [];
  readonly requireOthers: boolean = false;

  enter(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    return Promise.resolve(ctx);
  }

  leave(
    ctx: InterceptorContext,
  ): Promise<InterceptorContext> {
    return Promise.resolve(ctx);
  }

  onInit(_app: App): Promise<void> {
    return Promise.resolve();
  }
}

// ===== Api
export type Api = {
  name: string;
  run: (app: App, args: unknown[]) => Promise<unknown>;
};

export abstract class ApiPlugin {
  readonly name: string = "";
  readonly apis: Api[] = [];

  onInit(_app: App): Promise<void> {
    return Promise.resolve();
  }
}

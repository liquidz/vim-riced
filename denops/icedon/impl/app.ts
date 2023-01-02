import { Denops, interceptor } from "../deps.ts";
import * as core from "../core/mod.ts";
import { App, InterceptorHandler, Plugin, UnknownParams } from "../types.ts";
import { PluginImpl } from "./plugin.ts";
import { HandlerInterceptor } from "./interceptor.ts";

export class AppImpl implements App {
  readonly denops: Denops;
  readonly icedon: core.Icedon;
  readonly plugin: Plugin;

  constructor({ denops, icedon }: { denops: Denops; icedon: core.Icedon }) {
    this.denops = denops;
    this.icedon = icedon;
    this.plugin = new PluginImpl();
  }

  async requestApi(name: string, args: unknown[]): Promise<unknown> {
    const api = this.plugin.apiMap[name];
    if (api === undefined) {
      return;
    }
    return await api.run(this, args);
  }

  async intercept(
    interceptorType: string,
    params: UnknownParams,
    handler: InterceptorHandler,
  ): Promise<UnknownParams> {
    const interceptors = [
      ...(this.plugin.interceptorsMap[interceptorType] || []),
      new HandlerInterceptor(handler),
    ];
    const res = await interceptor.execute(interceptors, {
      app: this,
      params: params,
    });
    return res.params;
  }
}

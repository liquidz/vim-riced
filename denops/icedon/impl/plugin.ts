import { interceptor, path } from "../deps.ts";
import {
  Api,
  ApiPlugin,
  App,
  BaseInterceptor,
  InterceptorPlugin,
  Plugin,
} from "../types.ts";

export class PluginImpl implements Plugin {
  apiMap: Record<string, Api> = {};
  interceptorsMap: Record<string, BaseInterceptor[]> = {};

  loadedPluginNames: string[] = [];

  registerApiPlugin(app: App, plugin: ApiPlugin): void {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      this.loadedPluginNames.push(plugin.name);

      for (const api of plugin.apis) {
        if (this.apiMap[api.name] !== undefined) {
          continue;
        }
        this.apiMap[api.name] = api;
      }

      plugin.onInit(app);
    }
  }

  registerInterceptorPlugin(app: App, plugin: InterceptorPlugin): void {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      this.loadedPluginNames.push(plugin.name);

      for (const interceptor of plugin.interceptors) {
        const tmp = (this.interceptorsMap[interceptor.type] || []);
        if (tmp.find((v) => v.name === interceptor.name) === undefined) {
          this.interceptorsMap[interceptor.type] = tmp.concat([interceptor]);
        }
      }

      plugin.onInit(app);
    }
  }

  async loadPlugin(app: App, filePath: string): Promise<void> {
    const mod = await import(path.toFileUrl(filePath).href);

    if (mod.Api !== undefined) {
      this.registerApiPlugin(app, new mod.Api());
    }

    if (mod.Interceptor !== undefined) {
      this.registerInterceptorPlugin(app, new mod.Interceptor());
    }
  }

  sortInterceptors() {
    for (const interceptorType of Object.keys(this.interceptorsMap)) {
      const interceptors = this.interceptorsMap[interceptorType];
      if (interceptors === undefined) {
        continue;
      }

      this.interceptorsMap[interceptorType] = interceptor.reorder<
        BaseInterceptor
      >(interceptors);
    }
  }
}

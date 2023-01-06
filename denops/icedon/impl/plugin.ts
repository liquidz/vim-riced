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

  async registerApiPlugin(app: App, plugin: ApiPlugin): Promise<void> {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      this.loadedPluginNames.push(plugin.name);

      for (const api of plugin.apis) {
        if (this.apiMap[api.name] !== undefined) {
          continue;
        }
        this.apiMap[api.name] = api;
      }

      await plugin.onInit(app);
    }
  }

  removeApiPlugin(_app: App, plugin: ApiPlugin): Promise<void> {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      return Promise.resolve();
    }

    for (const api of plugin.apis) {
      delete this.apiMap[api.name];
    }

    this.loadedPluginNames = this.loadedPluginNames.filter((v) =>
      v !== plugin.name
    );

    return Promise.resolve();
  }

  async replaceApiPlugin(app: App, plugin: ApiPlugin): Promise<void> {
    this.removeApiPlugin(app, plugin);
    await this.registerApiPlugin(app, plugin);
  }

  async registerInterceptorPlugin(
    app: App,
    plugin: InterceptorPlugin,
  ): Promise<void> {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      this.loadedPluginNames.push(plugin.name);

      for (const interceptor of plugin.interceptors) {
        const tmp = this.interceptorsMap[interceptor.type] || [];
        if (tmp.find((v) => v.name === interceptor.name) === undefined) {
          this.interceptorsMap[interceptor.type] = tmp.concat([interceptor]);
        }
      }

      await plugin.onInit(app);
    }
  }

  removeInterceptorPlugin(_app: App, plugin: InterceptorPlugin): Promise<void> {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      return Promise.resolve();
    }
    const targetInterceptorNames = plugin.interceptors.map((v) => v.name);

    for (const interceptorKey of Object.keys(this.interceptorsMap)) {
      this.interceptorsMap[interceptorKey] = this
        .interceptorsMap[interceptorKey].filter((v) =>
          targetInterceptorNames.indexOf(v.name) === -1
        );
    }

    this.loadedPluginNames = this.loadedPluginNames.filter((v) =>
      v !== plugin.name
    );
    return Promise.resolve();
  }

  async replaceInterceptorPlugin(
    app: App,
    plugin: InterceptorPlugin,
  ): Promise<void> {
    this.removeInterceptorPlugin(app, plugin);
    await this.registerInterceptorPlugin(app, plugin);
  }

  async loadPlugin(app: App, filePath: string): Promise<void> {
    const mod = await import(path.toFileUrl(filePath).href);
    if (mod.Api !== undefined) {
      await this.registerApiPlugin(app, new mod.Api());
    }

    if (mod.Interceptor !== undefined) {
      await this.registerInterceptorPlugin(app, new mod.Interceptor());
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

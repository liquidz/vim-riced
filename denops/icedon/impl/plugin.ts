import { interceptor, path } from "../deps.ts";
import { Api, ApiPlugin, App, InterceptorPlugin, Plugin } from "../types.ts";

export class PluginImpl implements Plugin {
  apiMap: Record<string, Api> = {};
  interceptorsMap: Record<string, InterceptorPlugin[]> = {};

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

      const tmp = this.interceptorsMap[plugin.type] || [];
      this.interceptorsMap[plugin.type] = tmp.concat([plugin]);

      await plugin.onInit(app);
    }
  }

  removeInterceptorPlugin(_app: App, plugin: InterceptorPlugin): Promise<void> {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      return Promise.resolve();
    }

    const tmp = this.interceptorsMap[plugin.type] || [];
    this.interceptorsMap[plugin.type] = tmp.filter((v) =>
      v.name !== plugin.name
    );

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
      if (interceptors === undefined || interceptors.length === 0) {
        continue;
      }

      this.interceptorsMap[interceptorType] = interceptor.reorder<
        InterceptorPlugin
      >(interceptors);
    }
  }
}

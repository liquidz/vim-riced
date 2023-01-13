import { interceptor, path } from "../deps.ts";
import { Api, ApiPlugin, App, InterceptorPlugin, Plugin } from "../types.ts";

export class PluginImpl implements Plugin {
  apiMap: Record<string, Api> = {};
  interceptorsMap: Record<string, InterceptorPlugin[]> = {};

  private loadedPluginNames: string[] = [];
  private pluginRequirements: Record<string, string[]> = {};

  async registerApiPlugin(app: App, plugin: ApiPlugin): Promise<void> {
    if (this.loadedPluginNames.indexOf(plugin.name) === -1) {
      this.loadedPluginNames.push(plugin.name);
      // Do not check at this point. Will be check on `checkPlugins`.
      this.pluginRequirements[plugin.name] = plugin.pluginRequires;

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
    if (!this.loadedPluginNames.includes(plugin.name)) {
      return Promise.resolve();
    }

    for (const api of plugin.apis) {
      delete this.apiMap[api.name];
    }

    this.loadedPluginNames = this.loadedPluginNames.filter((v) =>
      v !== plugin.name
    );
    delete this.pluginRequirements[plugin.name];

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
      // Do not check at this point. Will be check on `checkPlugins`.
      this.pluginRequirements[plugin.name] = plugin.pluginRequires;

      const tmp = this.interceptorsMap[plugin.type] || [];
      this.interceptorsMap[plugin.type] = tmp.concat([plugin]);

      await plugin.onInit(app);
    }
  }

  removeInterceptorPlugin(_app: App, plugin: InterceptorPlugin): Promise<void> {
    if (!this.loadedPluginNames.includes(plugin.name)) {
      return Promise.resolve();
    }

    const tmp = this.interceptorsMap[plugin.type] || [];
    this.interceptorsMap[plugin.type] = tmp.filter((v) =>
      v.name !== plugin.name
    );

    this.loadedPluginNames = this.loadedPluginNames.filter((v) =>
      v !== plugin.name
    );
    delete this.pluginRequirements[plugin.name];

    return Promise.resolve();
  }

  async replaceInterceptorPlugin(
    app: App,
    plugin: InterceptorPlugin,
  ): Promise<void> {
    this.removeInterceptorPlugin(app, plugin);
    await this.registerInterceptorPlugin(app, plugin);
  }

  async loadPlugin(app: App, name: string, filePath: string): Promise<void> {
    const mod = await import(path.toFileUrl(filePath).href);
    if (mod.Api !== undefined) {
      await this.registerApiPlugin(app, new mod.Api(name));
    }

    if (mod.Interceptor !== undefined) {
      await this.registerInterceptorPlugin(app, new mod.Interceptor(name));
    }
  }

  checkPlugins() {
    for (const pluginName of Object.keys(this.pluginRequirements)) {
      const requires = this.pluginRequirements[pluginName];
      const missings = requires.filter((v) =>
        !this.loadedPluginNames.includes(v)
      );
      if (missings.length !== 0) {
        throw new Deno.errors.NotFound(
          `Plugin '${pluginName}' requires following plugins, but these are not loaded: ${
            missings.join(", ")
          }`,
        );
      }
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

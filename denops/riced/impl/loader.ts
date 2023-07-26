import { Denops, option, path, unknownutil, vimFn } from "../deps.ts";
import {
  App,
  BaseFunction,
  BaseInterceptor,
  Function,
  Loader,
} from "../types.ts";

const FUNCTION_DIR = "@riced_functions";
const INTERCEPTOR_DIR = "@riced_interceptors";

const isStringArray = unknownutil.is.ArrayOf(unknownutil.is.String);

async function searchPaths(
  denops: Denops,
  directory: string,
  names: string[],
): Promise<Record<string, string>> {
  const runtimepath = await option.runtimepath.getGlobal(denops);
  const result: Record<string, string> = {};

  for (const name of names) {
    const searched = await vimFn.globpath(
      denops,
      runtimepath,
      `denops/${directory}/${name}.ts`,
      1,
      1,
    );
    if (!isStringArray(searched)) {
      continue;
    }

    if (name in result) {
      continue;
    }

    result[name] = searched[0];
  }

  return result;
}

async function loadBaseFunction(
  functionName: string,
  filePath: string,
): Promise<BaseFunction | undefined> {
  const mod = await import(path.toFileUrl(filePath).href);

  if (mod.Function == null) {
    return;
  }

  return new mod.Function(functionName);
}

async function loadBaseInterceptor(
  interceptorName: string,
  filePath: string,
): Promise<BaseInterceptor<unknown> | undefined> {
  const mod = await import(path.toFileUrl(filePath).href);

  if (mod.Interceptor == null) {
    return;
  }

  return new mod.Interceptor(interceptorName);
}

export class LoaderImpl implements Loader {
  #loadedFunctionNames: Set<string> = new Set();
  #loadedFunctions: Function[] = [];

  #loadedInterceptorNames: Set<string> = new Set();
  #loadedBaseInterceptors: BaseInterceptor<unknown>[] = [];

  async loadFunctions(app: App, names: string[]): Promise<void> {
    const functionRecord = await searchPaths(app.denops, FUNCTION_DIR, names);
    const functionNames = Object.keys(functionRecord).filter((name) =>
      !this.#loadedFunctionNames.has(name)
    );

    for (const functionName of functionNames) {
      const filePath = functionRecord[functionName];
      if (filePath == null) {
        console.error(`function not found: ${functionName}`);
        continue;
      }

      const baseFn = await loadBaseFunction(functionName, filePath);
      if (baseFn == null) {
        continue;
      }

      this.#loadedFunctionNames.add(functionName);

      this.#loadedFunctions = this.#loadedFunctions.concat(baseFn.functions);
    }
  }

  async loadBaseInterceptors(app: App, names: string[]): Promise<void> {
    const interceptorRecord = await searchPaths(
      app.denops,
      INTERCEPTOR_DIR,
      names,
    );
    const interceptorNames = Object.keys(interceptorRecord).filter((name) =>
      !this.#loadedInterceptorNames.has(name)
    );

    for (const interceptorName of interceptorNames) {
      const filePath = interceptorRecord[interceptorName];
      if (filePath == null) {
        console.error(`interceptor not found: ${interceptorName}`);
        continue;
      }

      const baseInterceptor = await loadBaseInterceptor(
        interceptorName,
        filePath,
      );
      if (baseInterceptor == null) {
        continue;
      }

      this.#loadedInterceptorNames.add(interceptorName);
      this.#loadedBaseInterceptors.push(baseInterceptor);
    }
  }

  loadedFunctions(): Function[] {
    return this.#loadedFunctions;
  }

  loadedBaseInterceptors(): BaseInterceptor<unknown>[] {
    return this.#loadedBaseInterceptors;
  }
}

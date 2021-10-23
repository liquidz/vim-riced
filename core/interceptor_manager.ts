import { Diced, Interceptor, InterceptorManager } from "./types.ts";

export class InterceptorManagerImpl implements InterceptorManager {
  interceptors = {};
}

export function hasInterceptor(
  diced: Diced,
  interceptorType: string,
  interceptor: Interceptor,
): boolean {
  const interceptors = diced.interceptorManager.interceptors[interceptorType] ??
    [];
  return (interceptors.findIndex((i) => i.name === interceptor.name) !== -1);
}

export function addInterceptor(
  diced: Diced,
  interceptorType: string,
  interceptor: Interceptor,
): boolean {
  if (hasInterceptor(diced, interceptorType, interceptor)) return false;
  diced.interceptorManager.interceptors[interceptorType] ??= [];
  diced.interceptorManager.interceptors[interceptorType].push(interceptor);
  return true;
}

export function removeInterceptor(
  diced: Diced,
  interceptorType: string,
  interceptor: Interceptor,
): boolean {
  const interceptors = diced.interceptorManager.interceptors[interceptorType];
  if (interceptors == null) return false;

  diced.interceptorManager.interceptors[interceptorType] = interceptors.filter(
    (i) => {
      return (i.name !== interceptor.name);
    },
  );
  return true;
}

export function getInterceptors(
  diced: Diced,
  interceptorType: string,
): Array<Interceptor> {
  return diced.interceptorManager.interceptors[interceptorType] ?? [];
}

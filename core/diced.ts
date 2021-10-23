import { ConnectionManager, Diced, InterceptorManager } from "./types.ts";
import * as coreConnectionManager from "./connection_manager.ts";
import * as coreInterceptorManager from "./interceptor_manager.ts";

export class DicedImpl implements Diced {
  connectionManager: ConnectionManager = new coreConnectionManager
    .ConnectionManagerImpl();
  interceptorManager: InterceptorManager = new coreInterceptorManager
    .InterceptorManagerImpl();
}

export function newDiced(): Diced {
  return new DicedImpl();
}

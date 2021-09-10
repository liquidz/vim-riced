import { Denops } from "../deps.ts";
import { BaseInterceptor, ConnectionManager, Diced } from "../types.ts";
import { ConnectionManagerImpl } from "./connection/manager.ts";

export class DicedImpl implements Diced {
  readonly denops: Denops;
  connection: ConnectionManager;
  interceptors: Record<string, Array<BaseInterceptor>>;

  constructor(denops: Denops) {
    this.denops = denops;
    this.connection = new ConnectionManagerImpl();
    this.interceptors = {};
  }
}

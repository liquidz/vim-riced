import { Denops } from "../deps.ts";
import { BaseInterceptor, Connection, Diced } from "../types.ts";

export class DicedImpl implements Diced {
  readonly denops: Denops;
  connection: Connection | undefined;
  interceptors: Record<string, Array<BaseInterceptor>>;

  constructor(denops: Denops) {
    this.denops = denops;
    this.connection = undefined;
    this.interceptors = {};
  }
}

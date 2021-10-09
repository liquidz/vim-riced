import { interceptor } from "../deps.ts";
import {
  AnyParams,
  BaseInterceptor,
  Diced,
  InterceptorContext,
  InterceptorParams,
} from "../types.ts";

type Handler = (param: InterceptorParams) => Promise<InterceptorParams | Error>;

class HandlerInterceptor extends BaseInterceptor {
  readonly type: string = "__handler__";
  readonly name: string = "__handler__";
  readonly fn: Handler;

  constructor(fn: Handler) {
    super();
    this.fn = fn;
  }

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const res = await this.fn(ctx.arg);
    if (res instanceof Error) throw res;
    ctx.arg = res;
    return ctx;
  }
}

/// Execute registered interceptors for specified interceptor type
export async function intercept(
  diced: Diced,
  interceptorType: string,
  params: AnyParams,
  handler: Handler,
): Promise<AnyParams> {
  const interceptors = [
    ...(diced.interceptors[interceptorType] || []),
    new HandlerInterceptor(handler),
  ];
  const context: InterceptorParams = { diced: diced, params: params };
  const res = await interceptor.execute(interceptors, context);
  return res.params;
}

export function hasInterceptor(
  diced: Diced,
  interceptor: BaseInterceptor,
): boolean {
  const res = (diced.interceptors[interceptor.type] ?? []).find((i) => {
    return i.name === interceptor.name;
  });
  return res != null;
}

export function addInterceptor(diced: Diced, interceptor: BaseInterceptor) {
  if (diced.interceptors[interceptor.type] == null) {
    diced.interceptors[interceptor.type] = [interceptor];
  } else {
    if (!hasInterceptor(diced, interceptor)) {
      (diced.interceptors[interceptor.type] || []).push(interceptor);
    }
  }
}

export function removeInterceptor(diced: Diced, interceptor: BaseInterceptor) {
  const interceptors = diced.interceptors[interceptor.type];
  if (interceptors == null) {
    return;
  }

  diced.interceptors[interceptor.type] = interceptors.filter((i) => {
    return i.name !== interceptor.name;
  });
}

export function sortInterceptors(diced: Diced, interceptorType: string) {
  const q = diced.interceptors[interceptorType];
  if (q == null) return;

  diced.interceptors[interceptorType] = interceptor.reorder<BaseInterceptor>(q);
}

export function sortAllInterceptors(diced: Diced) {
  for (const interceptorType of Object.keys(diced.interceptors)) {
    sortInterceptors(diced, interceptorType);
  }
}

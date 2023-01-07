import { App, InterceptorPlugin, UnknownParams } from "../../types.ts";
import { interceptor } from "../../test_deps.ts";

type Tester = (app: App, params: UnknownParams) => Promise<UnknownParams>;

export function buildInterceptorTester(
  interceptors: InterceptorPlugin[],
): Tester {
  return async (app: App, params: UnknownParams) => {
    const tmp = Object.assign([], interceptors);
    const res = await interceptor.execute(tmp, {
      app: app,
      params: params,
    });
    return res.params;
  };
}

import { icedon } from "../../deps.ts";
import { interceptor } from "../../test_deps.ts";

type Tester = (
  app: icedon.App,
  params: icedon.UnknownParams,
) => Promise<icedon.UnknownParams>;

export function buildInterceptorTester(
  interceptors: icedon.InterceptorPlugin[],
): Tester {
  return async (app: icedon.App, params: icedon.UnknownParams) => {
    const tmp = Object.assign([], interceptors);
    const res = await interceptor.execute(tmp, {
      app: app,
      params: params,
    });
    return res.params;
  };
}

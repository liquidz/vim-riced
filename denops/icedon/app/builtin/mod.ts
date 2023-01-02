import { ApiPlugin, InterceptorPlugin } from "../../types.ts";

import * as apiConnection from "./connection/mod.ts";
import * as apiEvaluation from "./evaluation/mod.ts";
import * as interceptorNreplOutput from "./nrepl_output/mod.ts";

export const apiPlugins: ApiPlugin[] = [
  new apiConnection.Api(),
  new apiEvaluation.Api(),
];
export const interceptorPlugins: InterceptorPlugin[] = [
  new interceptorNreplOutput.Interceptor(),
];

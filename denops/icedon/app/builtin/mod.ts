import { ApiPlugin, InterceptorPlugin } from "../../types.ts";

import * as apiConnection from "./connection/mod.ts";
import * as apiParedit from "./paredit/mod.ts";
import * as apiEvaluation from "./evaluation/mod.ts";
import * as apiInfoBuffer from "./info_buffer/mod.ts";

import * as interceptorNreplOutput from "./nrepl_output/mod.ts";
import * as interceptorPortDetection from "./port_detection/mod.ts";
import * as interceptorEvaluatedResponse from "./evaluated_response/mod.ts";

export const apiPlugins: ApiPlugin[] = [
  new apiConnection.Api(),
  new apiParedit.Api(),
  new apiEvaluation.Api(),
  new apiInfoBuffer.Api(),
];
export const interceptorPlugins: InterceptorPlugin[] = [
  new interceptorNreplOutput.Interceptor(),
  new interceptorPortDetection.Interceptor(),
  new interceptorEvaluatedResponse.Interceptor(),
];

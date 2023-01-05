import { ApiPlugin, InterceptorPlugin } from "../types.ts";

import * as apiConnection from "./connection.ts";
import * as apiParedit from "./paredit.ts";
import * as apiEvaluation from "./evaluation.ts";
import * as apiInfoBuffer from "./info_buffer.ts";
import * as apiNamespace from "./namespace.ts";

import * as interceptorNreplOutput from "./nrepl_output.ts";
import * as interceptorPortDetection from "./port_detection.ts";
import * as interceptorEvaluatedResponse from "./evaluated_response.ts";

export const apiPlugins: ApiPlugin[] = [
  new apiConnection.Api(),
  new apiParedit.Api(),
  new apiNamespace.Api(),
  new apiEvaluation.Api(),
  new apiInfoBuffer.Api(),
];
export const interceptorPlugins: InterceptorPlugin[] = [
  new interceptorNreplOutput.Interceptor(),
  new interceptorPortDetection.Interceptor(),
  new interceptorEvaluatedResponse.Interceptor(),
];

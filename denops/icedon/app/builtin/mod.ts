import { ApiPlugin, InterceptorPlugin } from "../../types.ts";

import * as apiConnection from "./connection/mod.ts";
import * as apiEvaluation from "./evaluation/mod.ts";
import * as apiInfoBuffer from "./info_buffer/mod.ts";

import * as interceptorNreplOutput from "./nrepl_output/mod.ts";
import * as interceptorPortDetection from "./port_detection/mod.ts";

export const apiPlugins: ApiPlugin[] = [
  new apiConnection.Api(),
  new apiEvaluation.Api(),
  new apiInfoBuffer.Api(),
];
export const interceptorPlugins: InterceptorPlugin[] = [
  new interceptorNreplOutput.Interceptor(),
  new interceptorPortDetection.Interceptor(),
];

import * as connected from "./connected/mod.ts";
import * as autoPortDetection from "./auto_port_detection/mod.ts";
import * as formEvaluation from "./form_evaluation/mod.ts";
import * as complete from "./complete/mod.ts";
import * as clojureTest from "./clojure_test/mod.ts";
import * as dicedDebug from "./diced_debug/mod.ts";
import * as documentReference from "./document_reference/mod.ts";
import * as infoBuffer from "./info_buffer/mod.ts";
import * as normalizeNsPath from "./normalize_ns_path/mod.ts";
import * as standardOutput from "./standard_output/mod.ts";
import * as codeEvaluated from "./code_evaluated/mod.ts";
import * as normalizeCode from "./normalize_code/mod.ts";
import * as shadowCljs from "./shadow_cljs/mod.ts";
import * as portSelector from "./port_selector/mod.ts";

export const plugins = [
  new connected.Plugin(),
  new autoPortDetection.Plugin(),
  new formEvaluation.Plugin(),
  new complete.Plugin(),
  new clojureTest.Plugin(),
  new dicedDebug.Plugin(),
  new documentReference.Plugin(),
  new infoBuffer.Plugin(),
  new normalizeNsPath.Plugin(),
  new standardOutput.Plugin(),
  new codeEvaluated.Plugin(),
  new normalizeCode.Plugin(),
  new shadowCljs.Plugin(),
  new portSelector.Plugin(),
];

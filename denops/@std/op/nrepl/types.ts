import { BaseInterceptor, z } from "../../deps.ts";

export const EVALUATE_GROUP = "evaluate";
export const DEFAULT_PRINTER = "cider.nrepl.pprint/pprint";

export const EvalArgSchema = z.object({
  // input
  code: z.string(),
  session: z.string().optional(),
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  namespace: z.string().optional(),
  silent: z.boolean().optional(),
  usePrinter: z.boolean().optional(),
  printer: z.string().optional(),
  // output
  response: z.unknown().optional(), // core.nrepl.NreplResponse
});
export type EvalArg = z.infer<typeof EvalArgSchema>;

export const EvalContextSchema = z.object({
  silent: z.boolean(),
});
export type EvalContext = z.infer<typeof EvalContextSchema>;

export class BaseEvaluateInterceptor extends BaseInterceptor<EvalArg> {
  readonly group = EVALUATE_GROUP;
}

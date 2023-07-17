import { App, BaseInterceptor, Command, core, vimFn, z } from "../deps.ts";

export const ArgSchema = z.object({
  // input
  code: z.string(),
  session: z.string().optional(),
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  silent: z.boolean().optional(),
  usePrinter: z.boolean().optional(),
  // output
  result: z.string().optional(),
});
export type Arg = z.infer<typeof ArgSchema>;

const EvaluationOptionSchema = ArgSchema.omit({ code: true });
export type EvaluationOption = z.infer<typeof EvaluationOptionSchema>;

export const EvaluationContextSchema = z.object({
  silent: z.boolean(),
});

//type EvaluationContext = z.infer<typeof EvaluationContextSchema>;

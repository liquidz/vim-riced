import { App, core, z } from "../deps.ts";
import * as sexp from "../sexp/impl.ts";
import * as op from "../op/impl.ts";
import * as namespace from "../namespace/impl.ts";

const EvalOptionSchema = op.nrepl.EvalArgSchema.omit({ code: true });
type EvalOption = z.infer<typeof EvalOptionSchema>;

async function currentEvalOption(app: App): Promise<EvalOption> {
  const nsName = await namespace.name(app);
  const resp = await app.denops.batch(
    ["getcurpos"],
    ["expand", "%:p"],
  );
  const [_, row, col] = z.array(z.number()).parse(resp[0]);
  const file = (typeof resp[1] === "string") ? resp[1] : undefined;

  return {
    file,
    namespace: nsName,
    line: row,
    column: col,
  };
}

export async function evaluateCurrentForm(
  app: App,
  option?: EvalOption,
): Promise<core.nrepl.NreplResponse> {
  const evalOption = await currentEvalOption(app);
  if (evalOption.line == null || evalOption.column == null) {
    throw new Deno.errors.NotFound("cursor position not found");
  }

  const code = await sexp.getForm(app, evalOption.line, evalOption.column);
  return op.nrepl.evaluate(app, {
    ...option,
    ...evalOption,
    code,
  });
}

export async function evaluateCurrentList(
  app: App,
  option?: EvalOption,
): Promise<core.nrepl.NreplResponse> {
  const evalOption = await currentEvalOption(app);
  if (evalOption.line == null || evalOption.column == null) {
    throw new Deno.errors.NotFound("cursor position not found");
  }

  const code = await sexp.getList(app, evalOption.line, evalOption.column);
  return op.nrepl.evaluate(app, {
    ...option,
    ...evalOption,
    code,
  });
}

export async function evaluateCurrentTopList(
  app: App,
  option?: EvalOption,
): Promise<core.nrepl.NreplResponse> {
  const evalOption = await currentEvalOption(app);
  if (evalOption.line == null || evalOption.column == null) {
    throw new Deno.errors.NotFound("cursor position not found");
  }

  const code = await sexp.getTopList(app, evalOption.line, evalOption.column);
  return op.nrepl.evaluate(app, {
    ...option,
    ...evalOption,
    code,
  });
}

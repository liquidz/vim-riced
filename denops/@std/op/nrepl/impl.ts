import { App, core } from "../../deps.ts";
import {
  DEFAULT_PRINTER,
  EvalArg,
  EvalContext,
  EVALUATE_GROUP,
} from "./types.ts";
import * as request from "../../request/impl.ts";

// Re-export
export {
  BaseEvaluateInterceptor,
  EvalArgSchema,
  EvalContextSchema,
} from "./types.ts";
export type { EvalArg } from "./types.ts";

// add-middleware
// clone
// close
// completions
// describe

export async function evaluate(
  app: App,
  arg: EvalArg,
): Promise<core.nrepl.NreplResponse> {
  const res = await app.intercept<EvalArg>(EVALUATE_GROUP, arg, async (ctx) => {
    const context: EvalContext = {
      silent: ctx.params.silent ?? false,
    };

    const message: core.nrepl.bencode.BencodeObject = {
      op: "eval",
      code: ctx.params.code,
      "nrepl.middleware.print/stream?": 1,
    };

    if (arg.line && arg.column) {
      message["line"] = arg.line;
      message["column"] = arg.column;
    }

    if (arg.file) {
      message["file"] = arg.file;
    }

    if (arg.namespace) {
      message["ns"] = arg.namespace;
    }

    if (arg.usePrinter) {
      message["nrepl.middleware.print/print"] = arg.printer ?? DEFAULT_PRINTER;
    }

    ctx.params.response = await request.request(ctx.app, {
      message,
      option: { context },
    });

    return ctx;
  });

  return res.response as core.nrepl.NreplResponse;
}

// interrupt

export async function loadFile(
  app: App,
  { contents, fileName, filePath }: {
    contents: string;
    fileName: string;
    filePath: string;
  },
) {
  await request.request(app, {
    message: {
      op: "load-file",
      file: contents,
      "file-name": fileName,
      "file-path": filePath,
    },
  });
}

// lookup
// ls-middleware
// ls-sessions
// sideloader-provide
// sideloader-start
// stdin
// swap-middleware

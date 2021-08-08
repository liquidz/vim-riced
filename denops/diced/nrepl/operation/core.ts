// https://nrepl.org/nrepl/0.8/ops.html
import { nrepl } from "../../deps.ts";
import { Diced, Params } from "../../types.ts";
import { request } from "../common.ts";
import { execute } from "../../interceptor/core.ts";

export function closeOp(
  diced: Diced,
  option?: { session?: string },
): Promise<nrepl.NreplDoneResponse> {
  return request(diced, {
    op: "close",
    session: (option || {}).session ||
      diced.connectionManager.currentConnection.session,
  });
}

// completions(prefix)

export function describeOp(diced: Diced): Promise<nrepl.NreplDoneResponse> {
  return request(diced, { op: "describe" });
}

export async function evalOp(
  diced: Diced,
  code: string,
  option?: {
    context?: nrepl.Context;
    session?: string;
    column?: number;
    filePath?: string;
    line?: number;
    namespace?: string;
  },
): Promise<nrepl.NreplDoneResponse> {
  const params: Params = {
    ...(option || {}),
    code: code,
  };

  const res = await execute(diced, "eval", params, async (ctx) => {
    const req: nrepl.NreplRequest = {
      op: "eval",
      code: ctx.params["code"] || code,
    };

    if (ctx.params["session"] != null) req["session"] = ctx.params["session"];
    if (ctx.params["column"] != null) req["column"] = ctx.params["column"];
    if (ctx.params["line"] != null) req["line"] = ctx.params["line"];
    if (ctx.params["filePath"] != null) req["file"] = ctx.params["filePath"];
    if (ctx.params["namespace"] != null) req["ns"] = ctx.params["namespace"];

    ctx.params["response"] = await request(
      ctx.diced,
      req,
      ctx.params["context"] || {},
    );
    return ctx;
  });

  return res["response"];
}

export function interruptOp(
  diced: Diced,
  option?: { session?: string; id?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "interrupt",
    session: _option.session ||
      diced.connectionManager.currentConnection.session,
  };

  if (_option.id != null) req["interrupt-id"] = _option.id;

  return request(diced, req);
}

export function loadFileOp(
  diced: Diced,
  content: string,
  option?: { fileName?: string; filePath?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "load-file",
    file: content,
  };

  if (_option.fileName != null) req["file-name"] = _option.fileName;
  if (_option.filePath != null) req["file-path"] = _option.filePath;

  return request(diced, req);
}

// TODO: lookup
// TODO: ls-middleware
// TODO: ls-sessions
// TODO: sideloader-provide
// TODO: sideloader-start
// TODO: stdin
// TODO: swap-middleware

// https://nrepl.org/nrepl/0.8/ops.html
import { nrepl } from "../../deps.ts";
import { Diced, NreplEvalOption } from "../../types.ts";

import * as core from "../../core/mod.ts";

export function closeOp(
  diced: Diced,
  option?: { session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const session = _option.session ?? core.session(diced);
  return core.request(diced, { op: "close", session: session });
}

// completions(prefix)

export function describeOp(diced: Diced): Promise<nrepl.NreplDoneResponse> {
  return core.request(diced, { op: "describe" });
}

export function evalOp(
  diced: Diced,
  code: string,
  option?: NreplEvalOption,
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "eval",
    code: code,
    session: _option.session ?? core.session(diced),
    "nrepl.middleware.print/stream?": 1,
  };

  if (_option.column != null) req["column"] = _option.column;
  if (_option.line != null) req["line"] = _option.line;
  if (_option.filePath != null) req["file"] = _option.filePath;
  if (_option.namespace != null) req["ns"] = _option.namespace;

  return core.request(diced, req, _option.context || {});
}

export function interruptOp(
  diced: Diced,
  option?: { session?: string; id?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "interrupt",
    session: _option.session ?? core.session(diced),
  };

  if (_option.id != null) req["interrupt-id"] = _option.id;

  return core.request(diced, req);
}

export function loadFileOp(
  diced: Diced,
  content: string,
  option?: {
    fileName?: string;
    filePath?: string;
    context?: nrepl.Context;
    session?: string;
  },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "load-file",
    session: _option.session ?? core.session(diced),
    file: content,
  };

  if (_option.fileName != null) req["file-name"] = _option.fileName;
  if (_option.filePath != null) req["file-path"] = _option.filePath;

  return core.request(diced, req, _option.context ?? {});
}

// TODO: lookup
// TODO: ls-middleware
// TODO: ls-sessions
// TODO: sideloader-provide
// TODO: sideloader-start
// TODO: stdin
// TODO: swap-middleware

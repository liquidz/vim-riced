// https://nrepl.org/nrepl/0.8/ops.html
import { nrepl } from "../../deps.ts";
import { Diced } from "../../types.ts";
import { request } from "../common.ts";

export function closeOp(
  diced: Diced,
  option?: { session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const session = (option || {}).session ||
    diced.connectionManager.currentConnection.session;
  return request(diced, "close", { session: session });
}

// completions(prefix)

export function describeOp(diced: Diced): Promise<nrepl.NreplDoneResponse> {
  return request(diced, "describe", {});
}

export function evalOp(
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
  const req: nrepl.NreplRequest = {
    code: code,
  };
  const _option = option || {};

  if (_option.session != null) req["session"] = _option.session;
  if (_option.column != null) req["column"] = _option.column;
  if (_option.line != null) req["line"] = _option.line;
  if (_option.filePath != null) req["file"] = _option.filePath;
  if (_option.namespace != null) req["ns"] = _option.namespace;

  return request(diced, "eval", req, _option.context || {});
}

export function interruptOp(
  diced: Diced,
  option?: { session?: string; id?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    session: _option.session ||
      diced.connectionManager.currentConnection.session,
  };

  if (_option.id != null) req["interrupt-id"] = _option.id;

  return request(diced, "interrupt", req);
}

export function loadFileOp(
  diced: Diced,
  content: string,
  option?: { fileName?: string; filePath?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    file: content,
  };

  if (_option.fileName != null) req["file-name"] = _option.fileName;
  if (_option.filePath != null) req["file-path"] = _option.filePath;

  return request(diced, "load-file", req);
}

// TODO: lookup
// TODO: ls-middleware
// TODO: ls-sessions
// TODO: sideloader-provide
// TODO: sideloader-start
// TODO: stdin
// TODO: swap-middleware

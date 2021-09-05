import { nrepl } from "../../deps.ts";
import { Diced } from "../../types.ts";
import { request } from "../common.ts";
import * as nreplNs from "../namespace.ts";

export function completeOp(
  diced: Diced,
  args: { ns: string; prefix: string },
  option?: {
    context?: nrepl.Context;
    session?: string;
    completeContext?: string;
    enableEnhancedCljsCompletion?: boolean;
  },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    session: _option.session ??
      diced.connectionManager.currentConnection.session,
    ns: args.ns,
    prefix: args.prefix,
    "extra-metadata": ["arglists", "doc"],
  };

  if (_option.completeContext != null) {
    req["context"] = _option.completeContext;
  }
  if (_option.enableEnhancedCljsCompletion) {
    req["enhanced-cljs-completion?"] = "t";
  }
  return request(diced, "complete", req, _option.context ?? {});
}

export function nsVarsWithMetaOp(
  diced: Diced,
  nsName: string,
  option?: { context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    session: _option.session ??
      diced.connectionManager.currentConnection.session,
    ns: nsName,
  };

  return request(diced, "ns-vars-with-meta", req, _option.context ?? {});
}

// var_query examples)
// * testing var
//   {'ns-query': {'exactly': ['foo.core']}, 'exactly': ['foo.core/bar-test']}
// * testing ns
//   {'ns-query': {'exactly': ['foo.core']}}
// * testing all
//   {'ns-query': {'project?': 'true', 'load-project-ns?': 'true'}}
export function testVarQueryOp(
  diced: Diced,
  varQuery: nrepl.bencode.BencodeObject,
  option?: { context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    session: _option.session ??
      diced.connectionManager.currentConnection.session,
    "var-query": varQuery,
  };
  return request(diced, "test-var-query", req, _option.context ?? {});
}

export function nsPathOp(
  diced: Diced,
  nsName: string,
  option?: { context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    session: _option.session ??
      diced.connectionManager.currentConnection.session,
    "ns": nsName,
  };
  return request(diced, "ns-path", req, _option.context ?? {});
}

export async function info(
  diced: Diced,
  symbol: string,
  option?: { nsName?: string; context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    session: _option.session ??
      diced.connectionManager.currentConnection.session,
    "ns": _option.nsName ?? await nreplNs.name(diced),
    "sym": symbol,
  };
  return await request(diced, "info", req, _option.context ?? {});
}

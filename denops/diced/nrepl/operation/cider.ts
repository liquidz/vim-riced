import { nrepl } from "../../deps.ts";
import { Diced } from "../../types.ts";

import * as core from "../../@core/mod.ts";
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
    op: "complete",
    session: _option.session ?? core.session(diced),
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
  return core.request(diced, req, _option.context ?? {});
}

export function nsVarsWithMetaOp(
  diced: Diced,
  nsName: string,
  option?: { context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "ns-vars-with-meta",
    session: _option.session ?? core.session(diced),
    ns: nsName,
  };

  return core.request(diced, req, _option.context ?? {});
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
    op: "test-var-query",
    session: _option.session ?? core.session(diced),
    "var-query": varQuery,
  };
  return core.request(diced, req, _option.context ?? {});
}

export function nsPathOp(
  diced: Diced,
  nsName: string,
  option?: { context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "ns-path",
    session: _option.session ?? core.session(diced),
    "ns": nsName,
  };
  return core.request(diced, req, _option.context ?? {});
}

export async function info(
  diced: Diced,
  symbol: string,
  option?: { nsName?: string; context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "info",
    session: _option.session ?? core.session(diced),
    "ns": _option.nsName ?? await nreplNs.name(diced),
    "sym": symbol,
  };
  return await core.request(diced, req, _option.context ?? {});
}

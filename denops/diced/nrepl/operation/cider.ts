import { nrepl } from "../../deps.ts";
import { Diced } from "../../types.ts";
import { request } from "../common.ts";

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

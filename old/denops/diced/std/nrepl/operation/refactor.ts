import { nrepl } from "../../../deps.ts";
import { Diced } from "../../../types.ts";

import * as core from "../../../core/mod.ts";

export async function resolveMissing(
  diced: Diced,
  symbol: string,
  option?: { context?: nrepl.Context; session?: string },
): Promise<nrepl.NreplDoneResponse> {
  const _option = option || {};
  const req: nrepl.NreplRequest = {
    op: "resolve-missing",
    session: _option.session ?? core.session(diced),
    "symbol": symbol,
  };
  return await core.request(diced, req, _option.context ?? {});
}

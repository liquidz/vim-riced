import { API, BasePlugin } from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import { CompleteCandidate } from "./types.ts";
import { candidates } from "./nrepl.ts";

const complete: API = {
  name: "diced_builtin_completion",
  run: (diced, args): Promise<Array<CompleteCandidate>> => {
    if (args.length === 0 || !unknownutil.isString(args[0])) {
      return Promise.resolve([]);
    }
    return candidates(diced, args[0]);
  },
};

export class Plugin extends BasePlugin {
  readonly apis = [complete];
}

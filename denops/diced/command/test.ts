import { Command } from "../types.ts";

import * as msg from "../message/core.ts";
import * as nreplTest from "../nrepl/test.ts";

export const TestUnderCursor: Command = {
  name: "TestUnderCursor",
  run: async (diced, _) => {
    try {
      await nreplTest.runTestUnderCursor(diced);
    } catch (err) {
      if (
        err instanceof Deno.errors.InvalidData ||
        err instanceof Deno.errors.NotFound
      ) {
        await msg.warning(diced, "NotFound");
      } else {
        throw err;
      }
    }
  },
};

export const TestNs: Command = {
  name: "TestNs",
  run: async (diced, _) => {
    try {
      await nreplTest.runTestNs(diced);
    } catch (err) {
      if (
        err instanceof Deno.errors.InvalidData ||
        err instanceof Deno.errors.NotFound
      ) {
        await msg.warning(diced, "NotFound");
      } else {
        throw err;
      }
    }
  },
};

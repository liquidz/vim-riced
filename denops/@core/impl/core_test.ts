import { nrepl } from "../deps.ts";
import { asserts, mock } from "../test_deps.ts";
import * as connection from "./connection.ts";
import * as sut from "./core.ts";
import * as helper from "./test_helper.ts";

// Deno.test("connect", () => {
//   const nreplConnectStub = mock.stub(
//     connection._internals,
//     "nreplConnect",
//     () => Promise.resolve(helper.dummyClient()),
//   );
// });

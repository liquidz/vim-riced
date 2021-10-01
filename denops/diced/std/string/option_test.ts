import { asserts } from "../../test_deps.ts";
import * as sut from "./option.ts";

Deno.test("parseOptions", () => {
  asserts.assertEquals(sut.parseOptions([]), { option: {}, args: [] });
  asserts.assertEquals(sut.parseOptions(["++foo=bar"]), {
    option: { foo: "bar" },
    args: [],
  });
  asserts.assertEquals(sut.parseOptions(["++foo"]), {
    option: { foo: "true" },
    args: [],
  });
  asserts.assertEquals(sut.parseOptions(["foo"]), {
    option: {},
    args: ["foo"],
  });
  asserts.assertEquals(sut.parseOptions(["++foo=bar", "baz"]), {
    option: { foo: "bar" },
    args: ["baz"],
  });
});

import { asserts } from "../test_deps.ts";
import * as sut from "./argument.ts";

Deno.test("parse", () => {
  // only arguments
  asserts.assertEquals(sut.parse(["foo", "bar"]), {
    args: ["foo", "bar"],
    opts: {},
  });

  // only options
  asserts.assertEquals(sut.parse([":foo", "bar", ":baz", 123]), {
    args: [],
    opts: { foo: "bar", baz: 123 },
  });

  // arguments and options
  asserts.assertEquals(sut.parse(["foo", "bar", ":hello", "world"]), {
    args: ["foo", "bar"],
    opts: { hello: "world" },
  });

  // invalid options
  asserts.assertThrows(() => {
    sut.parse(["foo", ":bar"]);
  });
});

Deno.test("unparse", () => {
  // only arguments
  asserts.assertEquals(
    sut.unparse({ args: ["foo", "bar"], opts: {} }),
    ["foo", "bar"],
  );

  // only options
  asserts.assertEquals(
    sut.unparse({ args: [], opts: { foo: "bar", baz: 123 } }),
    [":foo", "bar", ":baz", 123],
  );

  // arguments and options
  asserts.assertEquals(
    sut.unparse({ args: ["foo", "bar"], opts: { hello: "world" } }),
    ["foo", "bar", ":hello", "world"],
  );
});

import { asserts } from "../test_deps.ts";
import * as sut from "./path.ts";

Deno.test("normalize", () => {
  asserts.assertEquals(sut.normalize("foo.ts"), "foo.ts");
  asserts.assertEquals(sut.normalize("file:/foo/bar.ts"), "/foo/bar.ts");
  asserts.assertEquals(
    sut.normalize("jar:file:/path/to/jarfile.jar!/path/to/file.clj"),
    "zipfile:/path/to/jarfile.jar::path/to/file.clj",
  );
});

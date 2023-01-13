import { AppMock, asserts, withDenops } from "../test_deps.ts";
import { icedon, unknownutil } from "../deps.ts";
import { GetNsNameApi } from "../types.ts";
import { PareditApiMock } from "../test/helper/builtin/paredit.ts";

type App = icedon.App;

async function mockGetNsFormAndRequest(
  app: App,
  form: string,
): Promise<string> {
  await app.plugin.replaceApiPlugin(
    app,
    new PareditApiMock({ icedon_get_ns_form: form }),
  );

  const resp = await app.requestApi(GetNsNameApi, []);
  unknownutil.assertString(resp);
  return resp;
}

Deno.test("icedon_ns_name", async () => {
  await withDenops("vim", async (denops) => {
    const app = await AppMock.build({ denops: denops });

    asserts.assertEquals(
      await mockGetNsFormAndRequest(app, "(ns foo.core\n)"),
      "foo.core",
    );
    asserts.assertEquals(
      await mockGetNsFormAndRequest(app, "(ns ^{:foo :bar} foo.core)"),
      "foo.core",
    );
    asserts.assertEquals(
      await mockGetNsFormAndRequest(app, "(ns foo.core (:require))"),
      "foo.core",
    );
    asserts.assertEquals(
      await mockGetNsFormAndRequest(
        app,
        "(ns ^{:foo :bar} foo.core (:require))",
      ),
      "foo.core",
    );
  });
});

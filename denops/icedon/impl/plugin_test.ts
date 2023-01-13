import { asserts, denops_test } from "../test_deps.ts";
import { ApiPlugin, App, InterceptorPlugin } from "../types.ts";
import * as sut from "./plugin.ts";
import { AppMock } from "../test/mock.ts";

const dummyRun = (_app: App, _args: unknown[]) => {
  return Promise.resolve(true);
};

class DummyApiPlugin1 extends ApiPlugin {
  readonly apis = [{ name: "icedon_plugin_test_dummy1", run: dummyRun }];
  constructor() {
    super("dummy/api1");
  }
}

class DummyApiPlugin2 extends ApiPlugin {
  readonly apis = [
    { name: "icedon_plugin_test_dummy2", run: dummyRun },
    { name: "icedon_plugin_test_dummy3", run: dummyRun },
  ];
  constructor() {
    super("dummy/api2");
  }
}

class DummyInterceptorPlugin1 extends InterceptorPlugin {
  readonly group = "plugin_test";
  constructor() {
    super("dummy/interceptor1");
  }
}
class DummyInterceptorPlugin2 extends InterceptorPlugin {
  readonly group = "plugin_test";
  constructor() {
    super("dummy/interceptor2");
  }
}

Deno.test("PluginImpl", async () => {
  await denops_test.withDenops("vim", (denops) => {
    const app = new AppMock(denops);
    const plg = new sut.PluginImpl();

    // registerApiPlugin
    asserts.assertEquals(Object.keys(plg.apiMap).length, 0);
    plg.registerApiPlugin(app, new DummyApiPlugin1());
    plg.registerApiPlugin(app, new DummyApiPlugin2());
    asserts.assertEquals(Object.keys(plg.apiMap).length, 3);

    // removeApiPlugin
    plg.removeApiPlugin(app, new DummyApiPlugin2());
    asserts.assertEquals(Object.keys(plg.apiMap).length, 1);
    asserts.assertEquals(
      Object.values(plg.apiMap)[0].name,
      "icedon_plugin_test_dummy1",
    );

    // registerInterceptorPlugin
    asserts.assertEquals(plg.interceptorsMap["plugin_test"], undefined);
    plg.registerInterceptorPlugin(app, new DummyInterceptorPlugin1());
    plg.registerInterceptorPlugin(app, new DummyInterceptorPlugin2());
    asserts.assertEquals(plg.interceptorsMap["plugin_test"].length, 2);

    // removeInterceptorPlugin
    plg.removeInterceptorPlugin(app, new DummyInterceptorPlugin2());
    asserts.assertEquals(plg.interceptorsMap["plugin_test"].length, 1);
    asserts.assertEquals(
      plg.interceptorsMap["plugin_test"][0].name,
      "dummy/interceptor1",
    );
  });
});

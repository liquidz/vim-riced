import { asserts, denops_test } from "../test_deps.ts";
import {
  ApiPlugin,
  App,
  BaseInterceptor,
  InterceptorPlugin,
} from "../types.ts";
import * as sut from "./plugin.ts";
import { AppMock } from "../test/mock.ts";

const dummyRun = (_app: App, _args: unknown[]) => {
  return Promise.resolve(true);
};

class DummyApiPlugin1 extends ApiPlugin {
  readonly name = "icedon plugin test dummy api1";
  readonly apis = [{ name: "icedon_plugin_test_dummy1", run: dummyRun }];
}

class DummyApiPlugin2 extends ApiPlugin {
  readonly name = "icedon plugin test dummy api2";
  readonly apis = [
    { name: "icedon_plugin_test_dummy2", run: dummyRun },
    { name: "icedon_plugin_test_dummy3", run: dummyRun },
  ];
}

class DummyInterceptor1 extends BaseInterceptor {
  readonly name: string = "icedon_plugin_test_dummy_interceptor1";
  readonly type: string = "plugin_test";
}
class DummyInterceptor2 extends BaseInterceptor {
  readonly name: string = "icedon_plugin_test_dummy_interceptor2";
  readonly type: string = "plugin_test";
}
class DummyInterceptor3 extends BaseInterceptor {
  readonly name: string = "icedon_plugin_test_dummy_interceptor3";
  readonly type: string = "plugin_test";
}

class DummyInterceptorPlugin1 extends InterceptorPlugin {
  readonly name = "icedon plugin test dummy interceptor1";
  readonly interceptors = [new DummyInterceptor1()];
}
class DummyInterceptorPlugin2 extends InterceptorPlugin {
  readonly name = "icedon plugin test dummy interceptor2";
  readonly interceptors = [new DummyInterceptor2(), new DummyInterceptor3()];
}

Deno.test("PluginImpl", async () => {
  await denops_test.withDenops("vim", (denops) => {
    const app = new AppMock({ denops: denops });
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
    asserts.assertEquals(plg.interceptorsMap["plugin_test"].length, 3);

    // removeInterceptorPlugin
    plg.removeInterceptorPlugin(app, new DummyInterceptorPlugin2());
    asserts.assertEquals(plg.interceptorsMap["plugin_test"].length, 1);
    asserts.assertEquals(
      plg.interceptorsMap["plugin_test"][0].name,
      "icedon_plugin_test_dummy_interceptor1",
    );
  });
});

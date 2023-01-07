import { asserts, denops_test, nrepl_mock } from "../test_deps.ts";
import { unknownutil } from "../deps.ts";
import { IcedonMock } from "../../@icedon-core/test/mock.ts";
import {
  ApiPlugin,
  App,
  InterceptorContext,
  InterceptorPlugin,
  NreplMessage,
} from "../types.ts";
import * as sut from "./app.ts";

const relay: nrepl_mock.RelayFunction = (_msg, _opt?): NreplMessage => {
  return {};
};

class DummyApiPlugin extends ApiPlugin {
  readonly name = "icedon app test dummy api";
  readonly apis = [
    {
      name: "icedon_app_test_dummy",
      run: (_app: App, _args: unknown[]) => {
        return Promise.resolve("this is test");
      },
    },
  ];
}

class DummyInterceptorPlugin extends InterceptorPlugin {
  readonly name = "icedon app test dummy interceptor";
  readonly type = "app_test";

  enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const i = ctx.arg.params["num"];
    unknownutil.assertNumber(i);
    ctx.arg.params["num"] = i + 10;
    return Promise.resolve(ctx);
  }

  leave(ctx: InterceptorContext): Promise<InterceptorContext> {
    const i = ctx.arg.params["num"];
    unknownutil.assertNumber(i);
    ctx.arg.params["num"] = i * 2;
    return Promise.resolve(ctx);
  }
}

Deno.test("app", async () => {
  await denops_test.withDenops("vim", async (denops) => {
    const app = new sut.AppImpl({
      denops: denops,
      icedon: new IcedonMock(relay),
    });
    app.plugin.registerApiPlugin(app, new DummyApiPlugin());
    app.plugin.registerInterceptorPlugin(app, new DummyInterceptorPlugin());

    // requestApi
    asserts.assertEquals(await app.requestApi("unknown", []), undefined);
    const apiResp = await app.requestApi("icedon_app_test_dummy", []);
    unknownutil.assertString(apiResp);
    asserts.assertEquals(apiResp, "this is test");

    // intercept
    const unknownInterceptResp = await app.intercept(
      "unkown",
      { num: 1 },
      (ctx) => {
        const i = ctx.params["num"];
        unknownutil.assertNumber(i);
        ctx.params["num"] = i + 1;
        return Promise.resolve(ctx);
      },
    );
    unknownutil.assertNumber(unknownInterceptResp["num"]);
    asserts.assertEquals(unknownInterceptResp["num"], 2);

    const dummyInterceptResp = await app.intercept(
      "app_test",
      { num: 1 },
      (ctx) => {
        const i = ctx.params["num"];
        unknownutil.assertNumber(i);
        ctx.params["num"] = i + 1;
        return Promise.resolve(ctx);
      },
    );
    unknownutil.assertNumber(dummyInterceptResp["num"]);
    asserts.assertEquals(dummyInterceptResp["num"], 24);
  });
});

import { asserts, denops_test, nrepl_mock } from "../test_deps.ts";
import { unknownutil } from "../deps.ts";
import { IcedonMock } from "../../@icedon-core/test/mock.ts";
import { parse } from "../util/argument.ts";
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
      run: (_app: App, args: unknown[]) => {
        const parsed = parse(args);
        return Promise.resolve(`this is ${parsed.opts["name"]}`);
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

    // requestApi with array
    asserts.assertEquals(await app.requestApi("unknown", []), undefined);
    const apiArrResp = await app.requestApi("icedon_app_test_dummy", [
      ":name",
      "array",
    ]);
    unknownutil.assertString(apiArrResp);
    asserts.assertEquals(apiArrResp, "this is array");

    // requestApi with record
    const apiRecResp = await app.requestApi("icedon_app_test_dummy", {
      name: "record",
    });
    unknownutil.assertString(apiRecResp);
    asserts.assertEquals(apiRecResp, "this is record");

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

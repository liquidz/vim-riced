import { icedon } from "../../../deps.ts";
import * as org from "../../../builtin/paredit.ts";

export class PareditApiMock extends org.Api {
  constructor(form: Record<string, string>) {
    super("builtin/paredit");

    for (let i = 0; i < this.apis.length; i++) {
      this.apis[i].run = (_app: icedon.App, _args: unknown[]) => {
        return Promise.resolve([
          form[this.apis[i].name] || "",
          0,
          0,
        ]);
      };
    }
  }
}

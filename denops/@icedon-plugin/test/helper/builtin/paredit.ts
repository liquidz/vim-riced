import { App } from "../../../types.ts";
import * as org from "../../../builtin/paredit.ts";

export class PareditApiMock extends org.Api {
  constructor(form: Record<string, string>) {
    super();

    for (let i = 0; i < this.apis.length; i++) {
      this.apis[i].run = (_app: App, _args: unknown[]) => {
        return Promise.resolve([
          form[this.apis[i].name] || "",
          0,
          0,
        ]);
      };
    }
  }
}
import { icedon, unknownutil } from "../deps.ts";
import * as paredit from "../util/string/paredit.ts";

type InterceptorContext = icedon.InterceptorContext;

export class Interceptor extends icedon.InterceptorPlugin {
  readonly type = "evaluate";

  enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const code = ctx.arg.params["code"];
    unknownutil.assertString(code);
    if (!code.match(/^\(comment[ \r\n]/)) {
      return Promise.resolve(ctx);
    }

    // NOTE: Each line and column are 1-based
    const codeLine = ctx.arg.params["line"];
    const cursorLine = ctx.arg.params["cursorLine"];
    const cursorColumn = ctx.arg.params["cursorColumn"];
    if (
      !unknownutil.isNumber(codeLine) ||
      !unknownutil.isNumber(cursorLine) ||
      !unknownutil.isNumber(cursorColumn)
    ) {
      ctx.arg.params["code"] = code.replace(/^\(comment/, "(do");
      return Promise.resolve(ctx);
    }

    // 0-based
    const line = cursorLine - codeLine;
    const column = cursorColumn - 1;
    const idx = paredit.positionToIndex(code, [line, column]);
    const ast = paredit.parse(code);

    let range = paredit.sexpRange(ast, idx);
    if (code.substring(...range).match(/\(?comment/)) {
      ctx.arg.params["code"] = code.replace(/^\(comment/, "(do");
      return Promise.resolve(ctx);
    }

    while (true) {
      const expandedRange = paredit.sexpRangeExpansion(ast, ...range);
      if (code.substring(...expandedRange).match(/^comment[ \r\n]/)) {
        break;
      }
      range = expandedRange;
    }
    ctx.arg.params["code"] = code.substring(...range);
    return Promise.resolve(ctx);
  }
}

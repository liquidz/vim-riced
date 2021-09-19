import {
  BaseInterceptor,
  BasePlugin,
  InterceptorContext,
} from "../../types.ts";
import { unknownutil } from "../../deps.ts";

import * as extSelector from "../../std/external/selector.ts";

interface PortCandidate {
  name: string;
  port: number;
}

class PortSelectionInterceptor extends BaseInterceptor {
  readonly type = "connect";
  readonly name = "diced port selector";
  readonly requireOthers = true;

  async enter(ctx: InterceptorContext): Promise<InterceptorContext> {
    const portCandidates = ctx.request.params["portCandidates"] || [];

    if (
      !unknownutil.isArray<PortCandidate>(portCandidates) ||
      portCandidates.length === 0
    ) {
      return ctx;
    }

    const selected = await extSelector.start(
      ctx.request.diced,
      portCandidates.map((pc) => pc.name),
    );

    const candidate = portCandidates.find((pc) => pc.name === selected.text);
    if (candidate == null) return ctx;

    ctx.request.params["port"] = candidate.port;
    ctx.request.params["name"] = candidate.name;

    return ctx;
  }
}

export class Plugin extends BasePlugin {
  readonly interceptors = [
    new PortSelectionInterceptor(),
  ];
}

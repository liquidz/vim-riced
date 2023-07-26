import { paredit } from "../deps.ts";

type Loc = {
  code: string;
  node: paredit.TopLevelNode;
  idx: number;
};

export function parse(code: string): Loc {
  const node = paredit.parse(code);
  if (node.errors.length > 0) {
    throw new Deno.errors.InvalidData(node.errors[0].error);
  }
  return { code, node, idx: 0 };
}

export function down(loc: Loc): Loc {
  return {
    code: loc.code,
    node: loc.node,
    idx: paredit.navigator.forwardDownSexp(loc.node, loc.idx),
  };
}

export function right(loc: Loc): Loc {
  return {
    code: loc.code,
    node: loc.node,
    idx: paredit.navigator.forwardSexp(loc.node, loc.idx),
  };
}

export function skipMetas(loc: Loc): Loc {
  if (node(loc).trim() === "^") {
    return right(right(loc));
  }
  return loc;
}

export function node(loc: Loc): string {
  return loc.code.substring(loc.idx, right(loc).idx);
}

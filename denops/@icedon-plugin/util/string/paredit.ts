import { paredit } from "../../deps.ts";

type AST = Record<string, unknown>;
type Source = string | AST;

export function parse(src: string): AST {
  return paredit.parse(src);
}

export function forwardSexp(src: Source, idx: number): number {
  const ast = (typeof src === "object") ? src : paredit.parse(src);
  return paredit.navigator.forwardSexp(ast, idx) + 1;
}

export function backwardSexp(src: Source, idx: number): number {
  const ast = (typeof src === "object") ? src : paredit.parse(src);
  return paredit.navigator.backwardSexp(ast, idx) + 1;
}

export function sexpRange(src: Source, idx: number): [number, number] {
  const ast = (typeof src === "object") ? src : paredit.parse(src);
  return paredit.navigator.sexpRange(ast, idx);
}

export function rangeForDefun(src: Source, idx: number): [number, number] {
  const ast = (typeof src === "object") ? src : paredit.parse(src);
  return paredit.navigator.rangeForDefun(ast, idx);
}

export function sexpRangeExpansion(
  src: Source,
  startIdx: number,
  endIdx: number,
): [number, number] {
  const ast = (typeof src === "object") ? src : paredit.parse(src);
  return paredit.navigator.sexpRangeExpansion(ast, startIdx, endIdx);
}

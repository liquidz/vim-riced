import { paredit } from "../../deps.ts";
import { Position } from "../../types.ts";

type AST = Record<string, unknown>;
type Source = string | AST;

export function parse(src: string): AST {
  return paredit.parse(src);
}

/**
 * Position should be 0-based index
 */
export function positionToIndex(s: string, pos: Position): number {
  return s.split(/\n/).slice(0, pos[0]).join("\n").length +
    pos[1] + (pos[0] > 0 ? 1 : 0);
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

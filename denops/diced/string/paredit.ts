import { paredit } from "../deps.ts";

export function forwardSexp(src: string, idx: number): number {
  const ast = paredit.parse(src);
  return paredit.navigator.forwardSexp(ast, idx) + 1;
}

export function forwardDownSexp(src: string, idx: number): number {
  const ast = paredit.parse(src);
  return paredit.navigator.forwardDownSexp(ast, idx) + 1;
}

export function backwardSexp(src: string, idx: number): number {
  const ast = paredit.parse(src);
  return paredit.navigator.backwardSexp(ast, idx) + 1;
}

export function backwardUpSexp(src: string, idx: number): number {
  const ast = paredit.parse(src);
  return paredit.navigator.backwardUpSexp(ast, idx) + 1;
}

export function sexpRange(src: string, idx: number): [number, number] {
  const ast = paredit.parse(src);
  return paredit.navigator.sexpRange(ast, idx);
}

export function sexpRangeExpansion(
  src: string,
  startIdx: number,
  endIdx: number,
): [number, number] {
  const ast = paredit.parse(src);
  return paredit.navigator.sexpRangeExpansion(ast, startIdx, endIdx + 1);
}

export function rangeForDefun(src: string, idx: number): [number, number] {
  const ast = paredit.parse(src);
  return paredit.navigator.rangeForDefun(ast, idx);
}

export function parentFormRange(src: string, idx: number): [number, number] {
  const ast = paredit.parse(src);
  const [lnum, cnum] = sexpRange(ast, idx);
  return sexpRangeExpansion(ast, lnum, cnum);
}

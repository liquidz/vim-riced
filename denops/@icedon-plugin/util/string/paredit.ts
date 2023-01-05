import { paredit } from "../../deps.ts";

export function forwardSexp(src: string, idx: number): number {
  const ast = paredit.parse(src);
  return paredit.navigator.forwardSexp(ast, idx) + 1;
}

export function backwardSexp(src: string, idx: number): number {
  const ast = paredit.parse(src);
  return paredit.navigator.backwardSexp(ast, idx) + 1;
}

export function sexpRange(src: string, idx: number): [number, number] {
  const ast = paredit.parse(src);
  return paredit.navigator.sexpRange(ast, idx);
}

export function rangeForDefun(src: string, idx: number): [number, number] {
  const ast = paredit.parse(src);
  return paredit.navigator.rangeForDefun(ast, idx);
}

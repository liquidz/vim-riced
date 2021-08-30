export function addIndent(n: number, s: string): string {
  if (n === 0) return s;
  const indent = " ".repeat(n);
  return s.replaceAll(/\r?\n/g, "\n" + indent);
}

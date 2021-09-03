export function addIndent(n: number, s: string): string {
  if (n === 0) return s;
  const indent = " ".repeat(n);
  return s.replaceAll(/\r?\n/g, "\n" + indent);
}

export function deleteColorCode(s: string): string {
  return s.replaceAll(/\[[0-9;]*m/g, "");
}

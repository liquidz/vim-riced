export function parseOptions(
  args: Array<string>,
): { option: Record<string, string>; args: Array<string> } {
  const res: Record<string, string> = {};
  const restArgs = args.filter((x) => !x.startsWith("++"));
  const options = args.filter((x) => x.startsWith("++"));

  for (const opt of options) {
    const kvMatch = opt.match(/\+\+(.+?)=(.+?)$/);
    if (kvMatch == null) {
      const kMatch = opt.match(/\+\+(.+?)$/);
      if (kMatch == null) continue;
      res[kMatch[1]] = "true";
    } else {
      res[kvMatch[1]] = kvMatch[2];
    }
  }

  return { option: res, args: restArgs };
}

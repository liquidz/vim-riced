import { unknownutil } from "../deps.ts";

type ParsedArguments = {
  args: unknown[];
  opts: Record<string, unknown>;
};

export function parse(args: unknown[]): ParsedArguments {
  const optIdx = args.findIndex((v) => typeof v === "string" && v[0] === ":");
  if (optIdx === -1) {
    return { args: args, opts: {} };
  }

  const opts: Record<string, unknown> = {};
  const optArray = args.slice(optIdx);
  if (optArray.length % 2 !== 0) {
    throw new Deno.errors.InvalidData(
      "options should be pairs of key and value",
    );
  }

  while (true) {
    const k = optArray.shift();
    const v = optArray.shift();

    if (!unknownutil.isString(k) || v === undefined) {
      break;
    }

    opts[k.replace(/^:/, "")] = v;
  }

  return { args: args.slice(0, optIdx), opts: opts };
}

export function unparse(parsed: ParsedArguments): unknown[] {
  const res: unknown[] = [...parsed.args];
  for (const key of Object.keys(parsed.opts)) {
    res.push(`:${key}`);
    res.push(parsed.opts[key]);
  }
  return res;
}

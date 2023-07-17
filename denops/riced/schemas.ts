import { core, z } from "./deps.ts";

const BencodeLiteralSchema = z.union([z.string(), z.number(), z.null()]);
export const bencodeSchema: z.ZodType<core.nrepl.bencode.Bencode> = z.lazy(() =>
  z.union([
    BencodeLiteralSchema,
    z.array(BencodeLiteralSchema),
    z.record(BencodeLiteralSchema),
  ])
);
export const BencodeObjectSchema = z.record(bencodeSchema);

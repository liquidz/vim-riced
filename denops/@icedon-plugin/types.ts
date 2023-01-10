import { z } from "./deps.ts";

// ===== cache
export const CacheSetItemApi = "icedon_cache_set";
export const CacheGetItemApi = "icedon_cache_get";
export const CacheDeleteItemApi = "icedon_cache_delete";
export const CacheHasItemApi = "icedon_cache_has_item";
export const CacheClearItemsApi = "icedon_cache_clear";

export const CacheSetItemArg = z.object({
  key: z.string(),
  value: z.unknown(),
  ttl: z.coerce.number().optional(),
});
export type CacheSetItemArg = z.infer<typeof CacheSetItemArg>;

export const CacheGetItemArg = z.object({ key: z.string() });
export type CacheGetItemArg = z.infer<typeof CacheGetItemArg>;

export const CacheDeleteItemArg = z.object({ key: z.string() });
export type CacheDeleteItemArg = z.infer<typeof CacheDeleteItemArg>;

export const CacheHasItemArg = z.object({ key: z.string() });
export type CacheHasItemArg = z.infer<typeof CacheHasItemArg>;

// ===== cursor
export const GetCursorPositionApi = "icedon_get_cursor_position";

// ===== info_buffer
export const OpenInfoBufferApi = "icedon_open_info_buffer";
export const ClearInfoBufferApi = "icedon_clear_info_buffer";
export const CloseInfoBufferApi = "icedon_close_info_buffer";
export const AppendToInfoBufferApi = "icedon_append_to_info_buffer";

// ===== namespace
export const GetNsNameApi = "icedon_ns_name";

// ===== nrepl_op
export const NreplDescribeApi = "icedon_nrepl_op_describe";
export const NreplEvalApi = "icedon_nrepl_op_eval";

export const NreplDescribeArg = z.object({
  force: z.coerce.boolean().optional(),
});
export type NreplDescribeArg = z.infer<typeof NreplDescribeArg>;

export const NreplEvalArg = z.object({
  code: z.string(),
  session: z.string().optional(),
  file: z.string().optional(),
  ns: z.string().optional(),
  line: z.coerce.number().optional(),
  column: z.coerce.number().optional(),
  cursorLine: z.coerce.number().optional(),
  cursorColumn: z.coerce.number().optional(),
  pprint: z.coerce.boolean().optional(),
  verbose: z.coerce.boolean().optional(),
  wait: z.coerce.boolean().optional(),
});
export type NreplEvalArg = z.infer<typeof NreplEvalArg>;

// ===== paredit
export const GetCurrentTopFormApi = "icedon_get_current_top_form";
export const GetCurrentFormApi = "icedon_get_current_form";
export const GetNsFormApi = "icedon_get_ns_form";

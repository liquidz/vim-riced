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

// ===== message
export const MessageInfo = "icedon_message_info";
export const MessageWarn = "icedon_message_warn";
export const MessageError = "icedon_message_error";

export const MessageArg = z.array(z.string());
export type MessageArg = z.infer<typeof MessageArg>;

// ===== namespace
export const GetNsNameApi = "icedon_ns_name";

// ===== nrepl_op
export const NreplAddMiddlewareApi = "icedon_nrepl_op_add_middleware";
export const NreplCloneApi = "icedon_nrepl_op_clone";
export const NreplCloseApi = "icedon_nrepl_op_close";
export const NreplCompletionsApi = "icedon_nrepl_op_completions";
export const NreplDescribeApi = "icedon_nrepl_op_describe";
export const NreplEvalApi = "icedon_nrepl_op_eval";
export const NreplInterruptApi = "icedon_nrepl_op_interrupt";
export const NreplLoadFileApi = "icedon_nrepl_op_load_file";
export const NreplLookupApi = "icedon_nrepl_op_lookup";
export const NreplLsMiddlewareApi = "icedon_nrepl_op_ls_middleware";
export const NreplLsSessionsApi = "icedon_nrepl_op_ls_sessions";
export const NreplSideloaderProvideApi = "icedon_nrepl_op_sideloader_provide";
export const NreplSideloaderStartApi = "icedon_nrepl_op_sideloader_start";
export const NreplStdinApi = "icedon_nrepl_op_stdin";
export const NreplSwapMiddlewareApi = "icedon_nrepl_op_swap_middleware";

export const NreplCloneArg = z.object({
  // sesion is required but core will complete automatically
  session: z.string().optional(),
});
export type NreplCloneArg = z.infer<typeof NreplCloneArg>;

export const NreplCloseArg = z.object({
  // sesion is required but core will complete automatically
  session: z.string().optional(),
});
export type NreplCloseArg = z.infer<typeof NreplCloseArg>;

export const NreplCompletionsArg = z.object({
  prefix: z.string(),
  completeFn: z.string().optional(),
  ns: z.string().optional(),
  options: z.object({
    extraMetaData: z.array(z.string()),
  }).optional(),
});
export type NreplCompletionsArg = z.infer<typeof NreplCompletionsArg>;

export const NreplDescribeArg = z.object({
  verbose: z.coerce.boolean().optional(),
  force: z.coerce.boolean().optional(),
});
export type NreplDescribeArg = z.infer<typeof NreplDescribeArg>;

export const NreplEvalArg = z.object({
  code: z.string(),
  // sesion is required but core will complete automatically
  session: z.string().optional(),
  file: z.string().optional(),
  ns: z.string().optional(),
  line: z.coerce.number().optional(),
  column: z.coerce.number().optional(),
  pprint: z.coerce.boolean().optional(),
  // project specific
  cursorLine: z.coerce.number().optional(),
  cursorColumn: z.coerce.number().optional(),
  verbose: z.coerce.boolean().optional(),
  wait: z.coerce.boolean().optional(),
});
export type NreplEvalArg = z.infer<typeof NreplEvalArg>;

export const NreplInterruptArg = z.object({
  // sesion is required but core will complete automatically
  session: z.string().optional(),
  interruptId: z.string().optional(),
});
export type NreplInterruptArg = z.infer<typeof NreplInterruptArg>;

export const NreplLoadFileArg = z.object({
  file: z.string(),
  fileName: z.string().optional(),
  filePath: z.string().optional(),
});
export type NreplLoadFileArg = z.infer<typeof NreplLoadFileArg>;

export const NreplLookupArg = z.object({
  sym: z.string(),
  ns: z.string().optional(),
  lookupFn: z.string().optional(),
});
export type NreplLookupArg = z.infer<typeof NreplLookupArg>;

export const NreplSideloaderProvideArg = z.object({
  content: z.string(),
  name: z.string(),
  // sesion is required but core will complete automatically
  session: z.string().optional(),
  type: z.enum(["class", "resource"]),
});
export type NreplSideloaderProvideArg = z.infer<
  typeof NreplSideloaderProvideArg
>;

export const NreplSideloaderStartArg = z.object({
  // sesion is required but core will complete automatically
  session: z.string().optional(),
});
export type NreplSideloaderStartArg = z.infer<typeof NreplSideloaderStartArg>;

export const NreplStdinArg = z.object({
  stdin: z.string(),
});
export type NreplStdinArg = z.infer<typeof NreplStdinArg>;

export const NreplSwapMiddlewareArg = z.object({
  middleware: z.array(z.string()),
  extraNamespaces: z.array(z.string()).optional(),
});
export type NreplSwapMiddlewareArg = z.infer<typeof NreplSwapMiddlewareArg>;

// ===== paredit
export const GetCurrentTopFormApi = "icedon_get_current_top_form";
export const GetCurrentFormApi = "icedon_get_current_form";
export const GetNsFormApi = "icedon_get_ns_form";

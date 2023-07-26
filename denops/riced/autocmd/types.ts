import { autocmd } from "../deps.ts";
import { BaseInterceptor } from "../types.ts";

export const EVENTS: autocmd.AutocmdEvent[] = [
  "BufRead",
  "BufNewFile",
  "BufEnter",
  "BufWritePost",
  "VimLeave",
];

export class BaseBufReadInterceptor extends BaseInterceptor<unknown> {
  readonly group = "autocmd_BufRead";
}

export class BaseBufNewFileInterceptor extends BaseInterceptor<unknown> {
  readonly group = "autocmd_BufNewFile";
}

export class BaseBufEnterInterceptor extends BaseInterceptor<unknown> {
  readonly group = "autocmd_BufEnter";
}

export class BaseBufWritePostInterceptor extends BaseInterceptor<unknown> {
  readonly group = "autocmd_BufWritePost";
}

export class BaseVimLeaveInterceptor extends BaseInterceptor<unknown> {
  readonly group = "autocmd_VimLeave";
}

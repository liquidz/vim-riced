import { App, BaseInterceptor, Command, core, vimFn, z } from "../deps.ts";
import * as sexp from "../sexp/impl.ts";

const EVALUATE_GROUP = "evaluate";

export const ArgSchema = z.object({
  // input
  code: z.string(),
  session: z.string().optional(),
  file: z.string().optional(),
  line: z.number().optional(),
  column: z.number().optional(),
  silent: z.boolean().optional(),
  usePrinter: z.boolean().optional(),
  // output
  response: z.unknown().optional(), // core.nrepl.NreplResponse
});

export type Arg = z.infer<typeof ArgSchema>;

const EvaluationOptionSchema = ArgSchema.omit({ code: true });
type EvaluationOption = z.infer<typeof EvaluationOptionSchema>;

export const EvaluationContextSchema = z.object({
  silent: z.boolean(),
});

type EvaluationContext = z.infer<typeof EvaluationContextSchema>;

export class BaseEvaluateInterceptor extends BaseInterceptor<Arg> {
  readonly group = EVALUATE_GROUP;
}

export async function evaluateCode(
  app: App,
  arg: Arg,
): Promise<core.nrepl.NreplResponse> {
  const res = await app.intercept<Arg>(EVALUATE_GROUP, arg, async (ctx) => {
    const context: EvaluationContext = {
      silent: ctx.params.silent ?? false,
    };

    ctx.params.response = await ctx.app.core.request({
      op: "eval",
      code: ctx.params.code,
    }, { context: context });

    return ctx;
  });

  return res.response as core.nrepl.NreplResponse;
}

export async function evaluateCurrentForm(
  app: App,
  option?: EvaluationOption,
): Promise<core.nrepl.NreplResponse> {
  const [_, row, col] = await vimFn.getcurpos(app.denops);
  const code = await sexp.getForm(app, row, col);
  return evaluateCode(app, { code, ...option });
}

export const EvaluateCodeCommand: Command = {
  name: "evaluate",
  exec: (app, arg) => {
    return evaluateCode(app, ArgSchema.parse(arg));
  },
};

export const EvaluateCurrentFormCommand: Command = {
  name: "evaluateCurrentForm",
  exec: (app, _arg) => {
    return evaluateCurrentForm(app);
  },
};

// function! iced#nrepl#eval(code, ...) abort
//   if !iced#nrepl#is_connected() && !iced#nrepl#auto_connect()
//     return
//   endif
//
//   let Callback = ''
//   let option = {}
//   if a:0 == 1
//     let Callback = get(a:, 1, '')
//   elseif a:0 == 2
//     let option = get(a:, 1, {})
//     let Callback = get(a:, 2, '')
//   endif
//
//   let session_key  = get(option, 'session', iced#nrepl#current_session_key())
//   let session = get(s:nrepl['sessions'], session_key, iced#nrepl#current_session())
//
//   let pos = getcurpos()
//   let msg = {
//         \ 'id': get(option, 'id', iced#nrepl#id()),
//         \ 'op': 'eval',
//         \ 'code': a:code,
//         \ 'session': session,
//         \ 'file': get(option, 'file', expand('%:p')),
//         \ 'line': get(option, 'line', pos[1]),
//         \ 'column': get(option, 'column', pos[2]),
//         \ 'nrepl.middleware.print/stream?': 1,
//         \ 'verbose': get(option, 'verbose', v:true),
//         \ 'callback': Callback,
//         \ }
//
//   if get(option, 'no_session', v:false)
//     unlet msg['session']
//   endif
//
//   let ns_name = get(option, 'ns', '')
//   if !empty(ns_name)
//     let msg['ns'] = ns_name
//   endif
//
//   if has_key(option, 'use-printer?')
//     let msg['nrepl.middleware.print/print'] = get(s:printer_dict, g:iced#nrepl#printer, s:printer_dict['default'])
//   endif
//
//   call iced#hook#run('eval_prepared', {'code': a:code, 'option': option})
//   call iced#nrepl#send(msg)
// endfunction

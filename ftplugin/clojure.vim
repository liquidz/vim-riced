if exists('g:loaded_vim_diced')
  finish
endif
let g:loaded_vim_diced = 1
let g:vim_diced_home = expand('<sfile>:p:h:h')

let s:save_cpo = &cpoptions
set cpoptions&vim

let g:diced_plugin_name = 'diced'

if !exists('g:diced#initialized')
  execute 'autocmd User DicedReady call denops#request_async("diced", "setup", [], {-> v:null}, {-> v:null})'
else
  call denops#request_async(
        \ "diced",
        \ "setup",
        \ [],
        \ {-> v:null},
        \ {-> v:null})
endif

let &cpoptions = s:save_cpo
unlet s:save_cpo

if exists('g:loaded_vim_diced')
  finish
endif
let g:loaded_vim_diced = 1

let s:save_cpo = &cpoptions
set cpoptions&vim

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

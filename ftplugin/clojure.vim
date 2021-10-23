if exists('g:loaded_vim_diced')
  finish
endif
let g:loaded_vim_diced = 1

function! s:denops_call(fn, args) abort
  if !exists('g:diced#initialized')
    echo 'Wait a minute for initializing Diced...'
    execute printf('autcmd User DicedReady call denops#notify("diced", "%s", %s)', a:fn, string(a:args))
  else
    call denops#notify('diced', a:fn, a:args)
  endif
endfunction

function! s:connect(...) abort
  let host = '127.0.0.1'
  let port = -1

  if a:0 == 1
    let port = str2nr(a:1)
  elseif a:0 == 2
    let host = a:1
    let port = str2nr(a:2)
  else
    throw 'diced: Too many arguments'
  endif

  return s:denops_call('connect', [host, port])
endfunction

command! -nargs=* DicedConnect call s:connect(<f-args>)

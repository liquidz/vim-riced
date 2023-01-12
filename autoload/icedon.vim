function! s:nop(...) abort
  return v:null
endfunction

function! icedon#request(name, args, ...) abort
  if !exists('g:icedon_plugin_name')
    echoerr "icedon is not initialized."
    return
  endif

  let Success = get(a:, 1, v:null)
  let Failure = get(a:, 2, v:null)
  if type(Success) == v:t_func
    let Failure = (type(Failure) == v:t_func) ? Failure : funcref('s:nop')
    return denops#request_async(g:icedon_plugin_name, 'dispatchApi', [a:name, a:args], Success, Failure)
  else
    return denops#notify(g:icedon_plugin_name, 'dispatchApi', [a:name, a:args])
  endif
endfunction

function! icedon#debug(...) abort
  echom printf('FIXME %s', a:000)
endfunction

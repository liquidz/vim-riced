function! s:nop(...) abort
  return v:null
endfunction

function! riced#request(name, args, ...) abort
  if !exists('g:riced_plugin_name')
    echoerr "not initialized."
    return
  endif

  let Success = get(a:, 1, v:null)
  let Failure = get(a:, 2, v:null)
  let json_args = json_encode(a:args)

  if type(Success) == v:t_func
    let Failure = (type(Failure) == v:t_func) ? Failure : funcref('s:nop')
    return denops#request_async(g:riced_plugin_name, 'request', [a:name, json_args], Success, Failure)
  else
    return denops#notify(g:riced_plugin_name, 'request', [a:name, json_args])
  endif
endfunction

function! riced#autocmd_intercept(group) abort
  if !exists('g:riced_plugin_name')
    return
  endif

  let json_arg = json_encode({
        \ 'cwd': getcwd(),
        \ 'file': expand('%:p'),
        \ 'bufnr': bufnr('%'),
        \ 'winid': win_getid(),
        \ })

  if a:group ==# 'VimLeave'
    " Wait
    return denops#request(g:riced_plugin_name, 'intercept', [a:group, json_arg])
  else
    return denops#notify(g:riced_plugin_name, 'intercept', [a:group, json_arg])
  endif
endfunction

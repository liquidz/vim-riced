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

function! riced#intercept(group, json_args) abort
  let x = get(g:, 'riced_interceptors', {})

  get(x, a:group, [])
endfunction

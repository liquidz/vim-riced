function! diced#complete#candidates(base, callback) abort
  call denops#request_async(
        \ g:diced_plugin_name,
        \ 'complete',
        \ [a:base],
        \ a:callback,
        \ {_ -> a:callback([])})
endfunction

function! diced#complete#omni(findstart, base) abort
  if a:findstart
    let line = getline('.')
    let ncol = col('.')
    let s = line[0:ncol-2]
    return ncol - strlen(matchstr(s, '\k\+$')) - 1
  else
    return diced#util#wait('diced#complete#candidates', [a:base], 10000)
  endif
endfunction

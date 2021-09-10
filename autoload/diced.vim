function! diced#registerPlugin(path) abort
  if !exists('g:diced#initialized')
    execute printf(
          \ 'autocmd User DicedReady call denops#notify("%s", "registerPlugin", [%s])',
          \ g:diced_plugin_name,
          \ a:path,
          \ )
  else
    call denops#notify(g:diced_plugin_name, 'registerPlugin', [a:path])
  endif
endfunction


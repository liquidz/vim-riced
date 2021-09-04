function! diced#buffer#info#ready(buf_name) abort
  silent execute printf(':split %s', a:buf_name)
  silent execute ':q'

  call setbufvar(a:buf_name, '&bufhidden', 'hide')
  call setbufvar(a:buf_name, '&buflisted', 0)
  call setbufvar(a:buf_name, '&buftype', 'nofile')
  call setbufvar(a:buf_name, '&filetype', 'clojure')
  call setbufvar(a:buf_name, '&swapfile', 0)
  call setbufvar(a:buf_name, '&wrap', 0)
endfunction

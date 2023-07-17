function! GivreEchoMsg(hl, message) abort
  execute 'echohl' a:hl
  try
    for line in split(a:message, '\r\?\n')
      echomsg line
    endfor
  finally
    echohl None
  endtry
endfunction

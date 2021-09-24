function! DicedBufferCword() abort
  let isk = &iskeyword
  try
    let &iskeyword = '@,48-57,_,192-255,?,-,*,!,+,/,=,<,>,.,:,$,#,%,&,39'
    return expand('<cword>')
  finally
    let &iskeyword = isk
  endtry
endfunction

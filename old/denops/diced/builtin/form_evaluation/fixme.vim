function! DicedFixme(mark) abort
  let view = winsaveview()
  try
    " Move cursor at mark
    silent execute printf('normal! `%s', a:mark)
  finally
    call winrestview(view)
  endtry
endfunction

  "
  " let context = iced#util#save_context()
  " " To show virtual text at current line
  " let opt = {'virtual_text': {
  "      \ 'line': has('nvim') ? winline()-1 : winline(),
  "      \ 'col': col('$') + 3,
  "      \ 'buffer': bufnr('%'),
  "      \ }}
  "
  " try
  "   " Move cursor at mark
  "   silent execute printf('normal! `%s', a:mark)
  "
  "   let code = iced#paredit#get_outer_list_raw()
  "   let code = iced#nrepl#eval#normalize_code(code)
  "
  "   let p = iced#repl#execute('eval_code', code, opt)
  "   if iced#promise#is_promise(p)
  "     call iced#promise#wait(p)
  "   endif
  " finally
  "   call iced#util#restore_context(context)
  " endtry
  "

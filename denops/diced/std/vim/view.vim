function! s:__save_local_marks() abort
  let res = {}
  "" a-z
  let mark_exprs = map(range(0, 25), {_, v -> printf("'%s", nr2char(v + 97))})
  "" last selected range
  let mark_exprs += ["'<", "'>"]

  for mark_expr in mark_exprs
    let pos = getpos(mark_expr)
    if pos == [0, 0, 0, 0] | continue | endif
    let res[mark_expr] = pos
  endfor
  return res
endfunction

function! s:__restore_local_marks(saved_result) abort
  for mark_expr in keys(a:saved_result)
    call setpos(mark_expr, a:saved_result[mark_expr])
  endfor
endfunction

function! DicedSaveView() abort
  return {
        \ 'reg': @@,
        \ 'bufnr': bufnr('%'),
        \ 'view': winsaveview(),
        \ 'marks': s:__save_local_marks(),
        \ }
endfunction

function! DicedRestView(saved_view) abort
  silent exe printf('b %d', a:saved_view.bufnr)
  silent call winrestview(a:saved_view.view)
  call s:__restore_local_marks(a:saved_view.marks)
  let @@ = a:saved_view.reg
endfunction


function! DicedTagstackAdd(winid, bufnr, lnum, cnum, tagname) abort
  let stack = gettagstack(a:winid)
  let items = stack['items']
  let new_item = {
        \ 'bufnr': a:bufnr,
        \ 'from': [a:bufnr, a:lnum, a:cnum, 0],
        \ 'tagname': a:tagname,
        \ }

  let tailidx = stack['curidx'] - 2
  let items = (tailidx < 0) ? [] : stack['items'][0:tailidx]
  let items = items + [new_item]

  let stack['curidx'] += 1
  let stack['items'] = items
  return settagstack(a:winid, stack, 'r')
endfunction

function! DicedTagstackAddHere(name) abort
  return DicedTagstackAdd(win_getid(), bufnr('%'), line('.'), col('.'), a:name)
endfunction

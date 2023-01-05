let s:default_skip = "synIDattr(synID(line('.'),col('.'),1),'name') =~? 'comment\\|string\\|regex\\|character'"

function! IcedonGetTopFormRange() abort
  let view = winsaveview()
  try
    let start = searchpos('^\S', "bcW", 0, 0, s:default_skip)
    if start == [0, 0]
      return [0, 0, 0, 0]
    endif

    call search('(', 'cW', 0, 0, s:default_skip)
    let end = searchpairpos('(', '', ')', 'nW', s:default_skip)
    if end == [0, 0]
      return [0, 0, 0, 0]
    endif
    return [start[0], start[1], end[0], end[1]]
  finally
    call winrestview(view)
  endtry
endfunction

function! IcedonGetCurrentFormRange() abort
  let view = winsaveview()
  try
    let start = searchpos('(', "bcW", 0, 0, s:default_skip)
    if start == [0, 0]
      return [0, 0, 0, 0]
    endif

    let end = searchpairpos('(', '', ')', 'nW', s:default_skip)
    if end == [0, 0]
      return [0, 0, 0, 0]
    endif
    return [start[0], start[1], end[0], end[1]]
  finally
    call winrestview(view)
  endtry
endfunction

function! IcedonGetNsFormRange() abort
  let view = winsaveview()
  try
    let start = searchpos('(ns[ \\r\\n ]', "bcW", 0, 0, s:default_skip)
    if start == [0, 0]
      let start = searchpos('(in-ns[ \\r\\n ]', "bcW", 0, 0, s:default_skip)
    endif
    if start == [0, 0]
      return [0, 0, 0, 0]
    endif

    let end = searchpairpos('(', '', ')', 'nW', s:default_skip)
    if end == [0, 0]
      return [0, 0, 0, 0]
    endif
    return [start[0], start[1], end[0], end[1]]
  finally
    call winrestview(view)
  endtry
endfunction

let s:popup_manager = {}
let s:default_popup_group = 'default'

function! s:is_overflowed_lnum(texts) abort
  return (len(a:texts) + 5) - (&lines - &cmdheight) >= 0
endfunction

function! DicedPopupOpen(text_list, option) abort
  let opts = get(a:, 1, {})

  if s:is_overflowed_lnum(a:text_list)
    throw 'vim-diced: too long texts to show in popup'
  endif

  " Close popups which has same group name
  let group = get(a:option, 'group', s:default_popup_group)
  call s:close_popup_by_group(group)

  " Show popup
  let winnr = s:open_popup(a:text_list, a:option)
  if !empty(winnr)
    let s:popup_manager[winnr] = copy(a:option)
  endif
endfunction

function! s:on_close(winnr) abort
  try
    let option = get(s:popup_manager, a:winnr, {})
    let Callback = get(option, 'callback')
    if type(Callback) == v:t_func
      call Callback()
    endif
  finally
    try
      call remove(s:popup_manager, a:winnr)
    catch
      " do nothing
    endtry
  endtry
endfunction

function! s:close_popup(winnr) abort
  if has('nvim')
    call nvim_win_close(a:winnr, v:true)
  else
    call popup_close(a:winnr)
  endif

  call s:on_close(a:winnr)
endfunction

function! s:close_popup_by_group(group) abort
  for winnr_str in keys(s:popup_manager)
    let winnr = str2nr(winnr_str)
    let group = get(s:popup_manager[winnr], 'group', s:default_popup_group)
    if group ==# a:group
      call s:close_popup(winnr)
    endif
  endfor
endfunction

function! s:text_width(text_list) abort
  return map(copy(a:text_list), {_, v -> len(v)})
endfunction

function! s:calc_popup_max_width(wininfo) abort
  return float2nr(a:wininfo['width'] * 0.95)
endfunction

function! s:calc_popup_width(text_list, wininfo, max_width) abort
  let width = max(map(copy(a:text_list), {_, v -> len(v)}))
  return (width > a:max_width) ? a:max_width : width
endfunction

function s:calc_popup_row(text_list, wininfo, height, border, row) abort
  let t = type(a:row)
  if t == v:t_number
    return a:wininfo['winrow'] + a:row - 1
  elseif t == v:t_string
    if a:row ==# '.'
      return a:wininfo['winrow'] + winline() - 1
    elseif a:row ==# 'nearCursor'
      " NOTE: `+ 5` make the popup window not too low
      if winline() + a:height + 5 > &lines
        return winline() - a:height + ((a:border) ? -1 : 1)
      else
        return winline() + a:wininfo['winrow']
      endif
    elseif a:row ==# 'top'
      return a:wininfo['winrow']
    elseif a:row ==# 'bottom'
      return a:wininfo['winrow'] + a:wininfo['height'] - a:height
    endif
  else
    throw 'vim-diced Unexpected value type'
  endif
endfunction

function! s:calc_popup_col(text_list, wininfo, width, col) abort
  let t = type(a:col)
  if t == v:t_number
    return a:wininfo['wincol'] + a:col
  elseif t == v:t_string
    if a:col ==# '.'
      return a:wininfo['wincol'] + wincol() - 1
    elseif a:col ==# 'nearCursor'
      return a:wininfo['wincol'] + wincol() - 1
    elseif a:col ==# 'tail'
      return a:wininfo['wincol'] + len(getline('.')) + 3
    elseif a:col ==# 'right'
      return a:wininfo['wincol'] + a:wininfo['width'] - a:width
    endif
  else
    throw 'vim-diced Unexpected value type'
  endif
endfunction

function! s:open_popup(text_list, option) abort
  let wininfo = getwininfo(win_getid())[0]
  if has('nvim')
    return s:open_popup_nvim(a:text_list, wininfo, a:option)
  else
    return s:open_popup_vim(a:text_list, wininfo, a:option)
  endif
endfunction

function!  s:initialize_popup_window(winnr, opts) abort
  call setwinvar(a:winnr, '&breakindent', 1)

  let bufnr = winbufnr(a:winnr)
  if has_key(a:opts, 'fileType')
    call setbufvar(bufnr, '&filetype', a:opts['fileType'])
  endif
endfunction

function! s:open_popup_vim(text_list, wininfo, option) abort
  let border = get(a:option, 'border', v:false)
  let max_width = s:calc_popup_max_width(a:wininfo)
  let width = s:calc_popup_width(a:text_list, a:wininfo, max_width)
  let height = len(a:text_list)
  let win_opts = {
        \ 'line': s:calc_popup_row(a:text_list, a:wininfo, height, border, get(a:option, 'row')),
        \ 'col': s:calc_popup_col(a:text_list, a:wininfo, width, get(a:option, 'col')),
        \ 'minwidth': width,
        \ 'maxwidth': max_width,
        \ 'minheight': height,
        \ 'maxheight': 50,
        \ 'callback': {id, _ -> s:on_close(id)},
        \ }

  let moved = get(a:option, 'moved', 'any')
  let win_opts['moved'] = (type(moved) == v:t_string && moved ==# 'row')
        \ ? [0, &columns]
        \ : moved

  if get(a:option, 'wrap', v:false)
    let win_opts['wrap'] = v:true
  endif

  if get(a:option, 'border', v:false)
    let win_opts['border'] = []
  endif

  let winnr = popup_create(a:text_list, win_opts)
  call s:initialize_popup_window(winnr, a:option)

  return winnr
endfunction

function! s:open_popup_nvim(text_list, wininfo, option) abort
  let bufnr = nvim_create_buf(0, 1)
  if bufnr < 0 | return | endif
  call nvim_buf_set_lines(bufnr, 0, len(a:text_list), 0, a:text_list)

  let border = get(a:option, 'border', v:false)
  let max_width = s:calc_popup_max_width(a:wininfo)
  let width = s:calc_popup_width(a:text_list, a:wininfo, max_width)
  let height = len(a:text_list)
  let win_opts = {
        \ 'relative': 'editor',
        \ 'row': s:calc_popup_row(a:text_list, a:wininfo, height, border, get(a:option, 'row')) - 1,
        \ 'col': s:calc_popup_col(a:text_list, a:wininfo, width, get(a:option, 'col')) - 1,
        \ 'width': width,
        \ 'height': height,
        \ 'style': 'minimal',
        \ }

  return nvim_open_win(bufnr, v:false, win_opts)
endfunction

function! s:emulate_moved_for_nvim() abort
  " TODO
  for winnr_str in keys(s:popup_manager)
    let winnr = str2nr(winnr_str)
    call s:close_popup(winnr)
  endfor
  " let winnr = expand('<afile>')
  " let option = get(s:popup_manager, winnr)
  " if !empty(option)
  "   echom printf('FIXME %s', option)
  "
  " endif
  return v:true
endfunction

" Emulate `moved` option for nvim
if has('nvim') && exists('*nvim_open_win')
  function! s:on_close_nvim() abort
    return s:on_close(expand('<afile>'))
  endfunction

  aug diced_close_document_popup_for_nvim
    au!
    au CursorMoved *.clj,*.cljs,*.cljc call s:emulate_moved_for_nvim()
    au CursorMovedI *.clj,*.cljs,*.cljc call s:emulate_moved_for_nvim()
    au WinClosed * call s:on_close_nvim()
  aug END
endif

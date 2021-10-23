let s:save_cpo = &cpo
set cpo&vim

let s:default_mode = 'e'
let s:mode_dict = {
      \ 'ctrl-t': 't',
      \ 'crtl-v': 'v',
      \ }

function! s:sink(result, config) abort
  if len(a:result) < 2 | return | endif
  let mode = get(s:mode_dict, a:result[0], s:default_mode)
  let text = trim(a:result[1])
  call denops#request(a:config['plugin_name'], a:config['callback_id'], [mode, text])
endfunction

function! fzf#diced#start(config) abort
  call fzf#run(fzf#wrap('diced', {
        \ 'source': a:config['candidates'],
        \ 'options': '--expect=ctrl-t,ctrl-v',
        \ 'sink*': {v -> s:sink(v, a:config)},
        \ }))
endfunction

let &cpo = s:save_cpo
unlet s:save_cpo

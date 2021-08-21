let s:defualt_timeout_msec = 10000
let s:default_wait_interval_msec = 30

function! s:wait_callback(res) abort dict
  let self.result = a:res
  let self.is_done = v:true
endfunction

function! diced#util#wait(fn_name, args, ...) abort
  let timeout = get(a:, 1, s:defualt_timeout_msec)
  let interval = s:default_wait_interval_msec . 'm'
  let result = v:null
  let Fn = (type(a:fn_name) == v:t_func) ? a:fn_name : function(a:fn_name)

  let dict = {'result': v:null, 'is_done': v:false}
  let args = a:args + [funcref('s:wait_callback', [], dict)]
  echom printf('args = %s', args)
  call call(Fn, args)

  let start_time = reltime()
  while(!dict.is_done)
    if (reltimefloat(reltime(start_time)) * 1000 > timeout)
      throw 'Timed out'
    endif

    execute 'sleep' interval
  endwhile

  return dict.result
endfunction

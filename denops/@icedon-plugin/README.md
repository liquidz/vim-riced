# icedon builtin plugins

TODO: Generate this document automatically from codes.

## directory

- builtin
  - API implementations
- api
  - API aliases which allows you to use API more easily

## builtn

### connection.ts

- API
  - `icedon_connect`
    - Could intercept via `connect` type.
      - enter
        - `host`
        - `port`
  - `icedon_disconnect`

### evaluated_response.ts

- Interceptor

### evaluation.ts

- API
  - `icedon_eval`
    - Could intercept via `evaluate` type.
      - enter
        - `code`
        - `session?`
        - `file?`
        - `ns?`
        - `line?`
        - `column?`
        - `pprint?`
        - `verbose?`
        - `wait?`
      - leave
        - `response`
  - `icedon_eval_outer_top_form`
    - Could intercept via `evaluate` type.
      - Parameters on enter and leave are as same as `icedon_eval`.
  - `icedon_eval_outer_form`
    - Could intercept via `evaluate` type.
      - Parameters on enter and leave are as same as `icedon_eval`.
  - `icedon_eval_ns_form`
    - Could intercept via `evaluate` type.
      - Parameters on enter and leave are as same as `icedon_eval`.

### info buffer.ts

- API
  - `icedon_open_info_buffer`
  - `icedon_clear_info_buffer`
  - `icedon_close_info_buffer`
  - `icedon_append_to_info_buffer`

### namespace.ts

- API
  - `icedon_ns_name`

### nrepl_output.ts

- Interceptor

### paredit.ts

- API
  - `icedon_get_current_top_form`
  - `icedon_get_current_form`
  - `icedon_get_ns_form`

### port_detection.ts

- Interceptor

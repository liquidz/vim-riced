.PHONY: test-deno
test-deno:
	cd denops/diced && deno test --unstable

.PHONY: test
test: test-deno

.PHONY: lint-deno
lint-deno:
	cd denops/diced && deno fmt --check *.ts && deno lint --unstable

.PHONY: lint
lint: lint-deno

.PHONY: update
# https://github.com/hayd/deno-udd
# deno install -A -f -n udd https://deno.land/x/udd@0.5.0/main.ts
update:
	udd denops/diced/deps.ts
	udd denops/diced/test_deps.ts


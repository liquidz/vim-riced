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

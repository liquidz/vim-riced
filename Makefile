.PHONY: test
test:
	deno test --coverage=./cov --unstable --allow-all denops

.PHONY: lint
lint:
	deno fmt --check *.ts
	deno lint --unstable

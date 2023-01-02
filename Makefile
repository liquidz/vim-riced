.PHONY: test
test:
	deno test --coverage=./cov --unstable --allow-all denops

.PHONY: lint
lint:
	cd denops && deno fmt --check
	cd denops && deno lint --unstable

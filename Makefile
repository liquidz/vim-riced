.denops.vim:
	git clone https://github.com/vim-denops/denops.vim .denops.vim
.PHONY: test
test: .denops.vim
	@DENOPS_TEST_DENOPS_PATH=./.denops.vim deno test --coverage=./cov --unstable --allow-all denops

.PHONY: lint
lint:
	cd denops && deno fmt --check
	cd denops && deno lint --unstable

.PHONY: install-udd
install-udd:
	deno install -rf --allow-read=. --allow-write=. --allow-net https://deno.land/x/udd/main.ts

.PHONY: outdated
outdated:
	@udd \
		denops/@icedon-core/deps.ts \
		denops/@icedon-core/test_deps.ts \
		denops/@icedon-plugin/deps.ts \
		denops/@icedon-plugin/test_deps.ts \
		denops/icedon/deps.ts \
		denops/icedon/test_deps.ts

.PHONY: clean
clean:
	rm -rf .denops.vim


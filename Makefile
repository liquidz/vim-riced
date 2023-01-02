.denops.vim:
	git clone https://github.com/vim-denops/denops.vim .denops.vim
.PHONY: test
test: .denops.vim
	@DENOPS_TEST_DENOPS_PATH=./.denops.vim deno test --coverage=./cov --unstable --allow-all denops

.PHONY: lint
lint:
	cd denops && deno fmt --check
	cd denops && deno lint --unstable

.PHONY: clean
clean:
	rm -rf .denops.vim


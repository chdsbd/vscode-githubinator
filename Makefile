.PHONY: install, lint, format-ci, test

install:
	@yarn install
lint:
	@yarn lint
format-ci:
	@yarn format:ci
test-ci: lint, format-ci
	@yarn vscode:prepublish
	@yarn test

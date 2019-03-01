.PHONY: install, lint, format, format-ci, test, test-ci

install:
	@yarn install
lint:
	@yarn lint
format:
	@yarn format
format-ci:
	@yarn format:ci
test:
	@yarn vscode:prepublish
	@yarn test
test-ci: lint, format-ci, test

# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `githubinator.enable_context_menu` option to disable/enable access to githubinator in the context menu.
- Gitlab provider with `githubinator.provider.gitlab.hostnames` setting for configuring match.
- Bitbucket provider and configuration.

### Changed

- Github provider hostnames are now configured with `githubinator.provider.github.hostnames` setting instead of `githubinator.provider.github`. This is now an array of hostnames instead of a single hostname. Note, the default for a provider will always be used for matching, so you cannot accidentally remove matching for `github.com` by only adding `mycompany.com` in `githubinator.provider.github.hostnames`.

### Fixed

- Fix regex creation for Github provider so hostname configured in settings is used to match origins.

## 0.1.0 - 2019-02-28

### Added

- Basic extension with github support

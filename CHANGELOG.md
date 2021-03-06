# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## 0.3.0 - 2020-08-15

### Added

- Support calling Githubinator without an open file.

### Changed

- Don't copy URL when using "Open PR".

## 0.2.3 - 2019-04-04

### Fixed

- Fix ordering of ref lookup to check unpacked refs before looking in packed refs.

## 0.2.2 - 2019-03-16

### Fixed

- Fixed failure when running Githubinator with detached HEAD. Githubinator
  would fail because there wasn't a ref to work off when running with a detached
  HEAD.

## 0.2.1 - 2019-03-08

### Fixed

- Remove artifact from logo export

## 0.2.0 - 2019-03-08

### Added

- `Githubinator: History` command to open commit history view for files.
- `Githubinator: Open PR` command to open a PR for current branch.
- `Githubinator: Compare` command to compare current branch.

### Changed

- Url copying for commands behaves as documented in README.

### Fixed

- Use the `branch` argument to `githubinator`. Now the "... on master" commands
  will lookup the master branch instead of using the current branch.

## 0.1.1 - 2019-03-02

### Added

- logo for Visual Studio Marketplace

## 0.1.0 - 2019-03-02

### Added

- `githubinator.enable_context_menu` option to disable/enable access to githubinator in the context menu.
- Gitlab provider with `githubinator.provider.gitlab.hostnames` setting for configuring match.
- Bitbucket provider and configuration.
- VisualStudio provider and configuration.
- Origin configuration for each provider.

### Changed

- Github provider hostnames are now configured with `githubinator.provider.github.hostnames` setting instead of `githubinator.provider.github`. This is now an array of hostnames instead of a single hostname. Note, the default for a provider will always be used for matching, so you cannot accidentally remove matching for `github.com` by only adding `mycompany.com` in `githubinator.provider.github.hostnames`.
- Global default origin is now configured via `githubinator.remote` instead of `githubinator.default_remote`. Note, origins set on a provider override the global remote settings.

### Fixed

- Fix regex creation for Github provider so hostname configured in settings is used to match origins.

## 0.0.1 - 2019-02-28

### Added

- Basic extension with github support

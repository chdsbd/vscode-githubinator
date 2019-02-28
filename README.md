# [githubinator](https://github.com/chdsbd/vscode-githubinator) [![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/chdsbd.githubinator.svg)](https://marketplace.visualstudio.com/items?itemName=chdsbd.githubinator#overview) ![GitHub](https://img.shields.io/github/license/chdsbd/vscode-githubinator.svg)

VSCode plugin that shows selected text on remote GitHub repo

## Install

In vscode, type `CMD`+`P` and enter `ext install chdsbd.githubinator`.

## Features

![feature X](images/githubinator.png)

### Commands

command|copy url|open url|mode|SHA-type
--|--|--|--|--
`Githubinator`|y|y|blob|current branch
`Githubinator: Copy`|n|y|blob|current branch
`Githubinator: Copy Master`|n|y|blob|master branch
`Githubinator: Copy Permalink`|n|y|blob|current SHA
`Githubinator: Copy Master Permalink`|n|y|blob|master SHA
`Githubinator: On Master`|y|y|blob|master branch
`Githubinator: Permalink`|y|y|blob|current SHA
`Githubinator: Blame`|y|y|blame|current branch
`Githubinator: Blame On Master`|y|y|blame|master branch
`Githubinator: Blame Permalink`|y|y|blame|current sha
`Githubinator: Repository`|y|y|open repo|N/A

## Requirements

- Local Git repository. You must have a git repository configured with a remote. (`"origin"` is default but this can be changed in settings).

## Extension Settings

* `githubinator.default_remote`: The default remote branch for a repository. (default: `"origin"`)
* `githubinator.providers.github`: The hostname for identifying a github origin and building a url. (default: `"github.com"`)

## Known Issues

- Only Github is supported as a remote provider at the moment.

## TODO
- [ ] Add Gitlab, Bitbucket, VisualStudio support providers
- [ ] Replace testing setup with Jest
- [ ] Setup CI
- [ ] Document deployment/publishing
- [ ] Improve README

## Release Notes

### 0.0.1

Initial release


## Prior Art
This plugin is based on the [Sublime Plugin by ehamiter](https://github.com/ehamiter/GitHubinator) with the same name.

project|providers|blame|history|permalink|master|copy|open|open-pr|one-step actions| provider autodetection
---|---|---|---|---|--|---|--|--|--|--
this project|github|y|n|y|y|y|y|n|y|y|n
[d4rkr00t/vscode-open-in-github][d4rkr00t-github] ([vscode][d4rkr00t-vscode])|github|y|y|n|y|n|y|n|n|n
[ziyasal/vscode-open-in-github][ziyasal-github] ([vscode][ziyasal-vscode])|github, bitbucket, gitlab, visualstudio|n|n|n*|n|y|y|y|y|n

\* changable in settings between permalink and branch



[d4rkr00t-github]:https://github.com/d4rkr00t/vscode-open-in-github
[d4rkr00t-vscode]:https://marketplace.visualstudio.com/items?itemName=sysoev.vscode-open-in-github
[ziyasal-github]:https://github.com/ziyasal/vscode-open-in-github
[ziyasal-vscode]:https://marketplace.visualstudio.com/items?itemName=ziyasal.vscode-open-in-github

[marketplace]: https://marketplace.visualstudio.com/items?itemName=chdsbd.githubinator

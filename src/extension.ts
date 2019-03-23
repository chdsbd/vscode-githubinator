import * as vscode from "vscode"
import * as git from "./git"
import { providers, IUrlInfo, createSha, createBranch } from "./providers"
import { getRelativeFilePath } from "./utils"

const COMMANDS: [string, IGithubinator][] = [
  [
    "extension.githubinator", //
    { copyToClipboard: true, openUrl: true },
  ],
  [
    "extension.githubinatorCopy", //
    { copyToClipboard: true },
  ],
  [
    "extension.githubinatorCopyMaster", //
    { copyToClipboard: true, branch: "master" },
  ],
  [
    "extension.githubinatorCopyPermalink", //
    { copyToClipboard: true, permalink: true },
  ],
  [
    "extension.githubinatorCopyMasterPermalink", //
    { copyToClipboard: true, branch: "master", permalink: true },
  ],
  [
    "extension.githubinatorOnMaster", //
    { copyToClipboard: true, openUrl: true, branch: "master" },
  ],
  [
    "extension.githubinatorPermalink", //
    { copyToClipboard: true, openUrl: true, permalink: true },
  ],
  [
    "extension.githubinatorBlame", //
    { copyToClipboard: true, openUrl: true, blame: true },
  ],
  [
    "extension.githubinatorBlameOnMaster", //
    { copyToClipboard: true, openUrl: true, blame: true, branch: "master" },
  ],
  [
    "extension.githubinatorBlamePermalink", //
    { copyToClipboard: true, openUrl: true, blame: true, permalink: true },
  ],
  [
    "extension.githubinatorHistory", //
    { copyToClipboard: true, openUrl: true, history: true },
  ],
  [
    "extension.githubinatorRepository", //
    { copyToClipboard: true, openUrl: true, openRepo: true },
  ],
  [
    "extension.githubinatorOpenPR", //
    { copyToClipboard: true, openUrl: true, openPR: true },
  ],
  [
    "extension.githubinatorCompare", //
    { copyToClipboard: true, openUrl: true, compare: true },
  ],
]

const DEFAULT_REMOTE = "origin"

export interface IProviderConfig {
  hostnames?: string[]
  remote?: string
}

export interface IGithubinatorConfig {
  remote: string
  providers: {
    [key: string]: IProviderConfig | undefined
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log("githubinator.active.start")
  COMMANDS.forEach(([cmd, args]) => {
    const disposable = vscode.commands.registerCommand(cmd, () =>
      githubinator(args),
    )
    context.subscriptions.push(disposable)
  })
  console.log("githubinator.active.complete")
}

export function deactivate() {
  console.log("githubinator.deactivate")
}

function err(message: string) {
  console.error(message)
  vscode.window.showErrorMessage(message)
}

interface IGithubinator {
  openUrl?: boolean
  copyToClipboard?: boolean
  blame?: boolean
  branch?: string
  permalink?: boolean
  openRepo?: boolean
  history?: boolean
  openPR?: boolean
  compare?: boolean
}
async function githubinator({
  openUrl,
  copyToClipboard,
  blame,
  branch,
  openRepo,
  permalink,
  history,
  openPR,
  compare,
}: IGithubinator) {
  console.log("githubinator.call")
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return err("There is no active file to look up.")
  }

  const { fileName, isUntitled, uri } = editor.document
  if (isUntitled) {
    return err("Cannot lookup unsaved file.")
  }
  if (uri.scheme !== "file") {
    return err("Only native files can be used.")
  }

  const gitDir = git.dir(uri.fsPath)
  if (gitDir == null) {
    return err("Could not find .git directory.")
  }
  let headBranch: [string, string | null] | null = null
  if (branch) {
    const sha = await git.getSHAForBranch(gitDir, branch)
    if (sha == null) {
      return err(`Could not find SHA for branch name: ${branch}`)
    }
    headBranch = [sha, branch]
  } else {
    headBranch = await git.head(gitDir)
  }
  if (headBranch == null) {
    return err("Could not find HEAD.")
  }
  const [head, branchName] = headBranch
  const globalDefaultRemote = vscode.workspace
    .getConfiguration("githubinator")
    .get<IGithubinatorConfig["remote"]>("remote", DEFAULT_REMOTE)

  const providersConfig = vscode.workspace
    .getConfiguration("githubinator")
    .get<IGithubinatorConfig["providers"]>("providers", {})

  let urls: IUrlInfo | null = null
  for (const provider of providers) {
    const parsedUrl = await new provider(
      providersConfig,
      globalDefaultRemote,
      remote => git.origin(gitDir, remote),
    ).getUrls({
      selection: [editor.selection.start.line, editor.selection.end.line],
      // priority: permalink > branch > branch from HEAD
      // If branchName could not be found (null) then we generate a permalink
      // using the SHA.
      head:
        !!permalink || branchName == null
          ? createSha(head)
          : createBranch(branchName),
      // escape invalid url characters
      // See https://github.com/chdsbd/vscode-githubinator/issues/28
      relativeFilePath: encodeURIComponent(
        getRelativeFilePath(gitDir, fileName),
      ),
    })
    if (parsedUrl != null) {
      console.log("Found provider", provider.name)
      urls = parsedUrl
      break
    }
    console.log("Skipping provider", provider.name)
  }

  if (urls == null) {
    return err("Could not find provider for repo.")
  }

  const url = compare
    ? urls.compareUrl
    : openPR
    ? urls.prUrl
    : openRepo
    ? urls.repoUrl
    : history
    ? urls.historyUrl
    : blame
    ? urls.blameUrl
    : urls.blobUrl

  if (openUrl) {
    vscode.env.openExternal(vscode.Uri.parse(url))
  }
  if (copyToClipboard) {
    vscode.env.clipboard.writeText(url)
    vscode.window.showInformationMessage("URL copied to clipboard.")
  }
}

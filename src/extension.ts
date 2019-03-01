import * as vscode from "vscode"
import * as git from "./git"
import { providers } from "./providers"
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
    { openUrl: true, branch: "master" },
  ],
  [
    "extension.githubinatorPermalink", //
    { openUrl: true, permalink: true },
  ],
  [
    "extension.githubinatorBlame", //
    { openUrl: true, blame: true },
  ],
  [
    "extension.githubinatorBlameOnMaster", //
    { openUrl: true, blame: true, branch: "master" },
  ],
  [
    "extension.githubinatorBlamePermalink", //
    { openUrl: true, blame: true, permalink: true },
  ],
  [
    "extension.githubinatorRepository", //
    { openUrl: true, openRepo: true },
  ],
]

const DEFAULT_REMOTE = "origin"

export interface IGithubinatorConfig {
  remote: string
  providers: {
    [key: string]: string | undefined
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
}
async function githubinator({
  openUrl,
  copyToClipboard,
  blame,
  branch,
  openRepo,
  permalink,
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
  const headBranch = await git.head(gitDir)
  if (headBranch == null) {
    return err("Could not find HEAD.")
  }
  const [head, branchName] = headBranch
  const remoteName = vscode.workspace
    .getConfiguration("githubinator")
    .get<IGithubinatorConfig["remote"]>("default_remote", DEFAULT_REMOTE)
  const origin = await git.origin(gitDir, remoteName)
  if (origin == null) {
    return err("Could not find url for origin.")
  }

  const providersConfig = vscode.workspace
    .getConfiguration("githubinator")
    .get<IGithubinatorConfig["providers"]>("providers", {})

  let url: string | null = null
  let repoUrl: string | null = null
  for (const provider of providers) {
    const parsedUrl = new provider().getUrl({
      selection: [editor.selection.start.line, editor.selection.end.line],
      // permalink > branch > branch from HEAD
      head: !!permalink ? head : !!branch ? branch : branchName,
      mode: blame ? "blame" : "blob",
      origin,
      providersConfig,
      relativeFilePath: getRelativeFilePath(gitDir, fileName),
    })
    if (parsedUrl != null) {
      url = parsedUrl.fileUrl
      repoUrl = parsedUrl.repoUrl
      break
    }
  }
  if (repoUrl != null && openRepo) {
    vscode.env.openExternal(vscode.Uri.parse(repoUrl))
    return
  }

  if (url == null) {
    return err("Could not create URL.")
  }

  if (openUrl) {
    vscode.env.openExternal(vscode.Uri.parse(url))
  }
  if (copyToClipboard) {
    vscode.env.clipboard.writeText(url)
    vscode.window.showInformationMessage("URL copied to clipboard.")
  }
}

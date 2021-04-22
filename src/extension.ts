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
    { copyToClipboard: true, mainBranch: true },
  ],
  [
    "extension.githubinatorCopyPermalink", //
    { copyToClipboard: true, permalink: true },
  ],
  [
    "extension.githubinatorCopyMasterPermalink", //
    { copyToClipboard: true, mainBranch: true, permalink: true },
  ],
  [
    "extension.githubinatorOnMaster", //
    { copyToClipboard: true, openUrl: true, mainBranch: true },
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
    { copyToClipboard: true, openUrl: true, blame: true, mainBranch: true },
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
    { copyToClipboard: false, openUrl: true, openPR: true },
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

function getEditorInfo(): { uri: vscode.Uri | null; fileName: string | null } {
  const workspaceUri =
    vscode.workspace.workspaceFolders != null &&
    vscode.workspace.workspaceFolders.length > 0
      ? vscode.workspace.workspaceFolders[0].uri
      : null
  const editor = vscode.window.activeTextEditor
  // if we cannot find editor information fall back to the workspace path.
  if (!editor) {
    return { uri: workspaceUri, fileName: null }
  }

  const { fileName, isUntitled, uri } = editor.document
  if (isUntitled) {
    return { uri: workspaceUri, fileName: null }
  }
  return { uri, fileName }
}

const BRANCHES = ["main", "master", "trunk", "dev", "develop"]

async function findShaForBranches(
  gitDir: string,
): Promise<[string, string] | null> {
  for (let branch of BRANCHES) {
    const sha = await git.getSHAForBranch(gitDir, branch)
    if (sha == null) {
      continue
    }
    return [sha.trim(), branch]
  }
  return null
}

interface IGithubinator {
  openUrl?: boolean
  copyToClipboard?: boolean
  blame?: boolean
  mainBranch?: boolean
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
  mainBranch,
  openRepo,
  permalink,
  history,
  openPR,
  compare,
}: IGithubinator) {
  console.log("githubinator.call")
  const editorConfig = getEditorInfo()
  if (!editorConfig.uri) {
    return err("could not find file")
  }

  const gitDir = git.dir(editorConfig.uri.fsPath)
  if (gitDir == null) {
    return err("Could not find .git directory.")
  }
  let headBranch: [string, string | null] | null = null
  if (mainBranch) {
    const res = await findShaForBranches(gitDir)
    if (res == null) {
      return err(`Could not find SHA for branch in ${BRANCHES}`)
    }
    headBranch = res
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

  const editor = vscode.window.activeTextEditor
  let urls: IUrlInfo | null = null
  for (const provider of providers) {
    const parsedUrl = await new provider(
      providersConfig,
      globalDefaultRemote,
      remote => git.origin(gitDir, remote),
    ).getUrls({
      selection: [
        editor ? editor.selection.start.line : null,
        editor ? editor.selection.end.line : null,
      ],
      // priority: permalink > branch > branch from HEAD
      // If branchName could not be found (null) then we generate a permalink
      // using the SHA.
      head:
        !!permalink || branchName == null
          ? createSha(head)
          : createBranch(branchName),
      relativeFilePath: editorConfig.fileName
        ? getRelativeFilePath(gitDir, editorConfig.fileName)
        : null,
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

  let url = compare
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

  // file-specific urls will be null when we are using the workspace path. Use
  // the compare url or repo url if available instead.
  const fallbackUrl = [urls.compareUrl, urls.repoUrl].find(x => x != null)
  if (!url && fallbackUrl) {
    url = fallbackUrl
  }

  if (url == null) {
    return err("could not find url")
  }
  if (openUrl) {
    // @ts-ignore This works. Using vscode.Uri.parse double encodes characters which breaks URLs.
    await vscode.env.openExternal(url)
  }
  if (copyToClipboard) {
    await vscode.env.clipboard.writeText(url)
    await vscode.window.showInformationMessage("URL copied to clipboard.")
  }
}

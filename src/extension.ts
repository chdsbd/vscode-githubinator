import * as vscode from "vscode"
import * as git from "./git"
import { providers, IUrlInfo, createSha, createBranch } from "./providers"
import { getRelativeFilePath } from "./utils"
import { openFileFromGitHubUrl } from "./openfromUrl"

const COMMANDS: [string, IGithubinator][] = [
  [
    "githubinator.githubinator", //
    { copyToClipboard: true, openUrl: true },
  ],
  [
    "githubinator.githubinatorCopy", //
    { copyToClipboard: true },
  ],
  [
    "githubinator.githubinatorCopyMaster", //
    { copyToClipboard: true, mainBranch: true },
  ],
  [
    "githubinator.githubinatorCopyPermalink", //
    { copyToClipboard: true, permalink: true },
  ],
  [
    "githubinator.githubinatorCopyMasterPermalink", //
    { copyToClipboard: true, mainBranch: true, permalink: true },
  ],
  [
    "githubinator.githubinatorOnMaster", //
    { copyToClipboard: true, openUrl: true, mainBranch: true },
  ],
  [
    "githubinator.githubinatorPermalink", //
    { copyToClipboard: true, openUrl: true, permalink: true },
  ],
  [
    "githubinator.githubinatorBlame", //
    { copyToClipboard: true, openUrl: true, blame: true },
  ],
  [
    "githubinator.githubinatorBlameOnMaster", //
    { copyToClipboard: true, openUrl: true, blame: true, mainBranch: true },
  ],
  [
    "githubinator.githubinatorBlamePermalink", //
    { copyToClipboard: true, openUrl: true, blame: true, permalink: true },
  ],
  [
    "githubinator.githubinatorHistory", //
    { copyToClipboard: true, openUrl: true, history: true },
  ],
  [
    "githubinator.githubinatorRepository", //
    { copyToClipboard: true, openUrl: true, openRepo: true },
  ],
  [
    "githubinator.githubinatorOpenPR", //
    { copyToClipboard: false, openUrl: true, openPR: true },
  ],
  [
    "githubinator.githubinatorCompare", //
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

export let outputChannel: vscode.LogOutputChannel

export function activate(context: vscode.ExtensionContext) {
  outputChannel = vscode.window.createOutputChannel("GitHubinator", {
    log: true,
  })
  outputChannel.debug("githubinator.active.start")
  context.subscriptions.push(outputChannel)
  COMMANDS.forEach(([cmd, args]) => {
    const disposable = vscode.commands.registerCommand(cmd, () =>
      githubinator(args),
    )
    context.subscriptions.push(disposable)
  })
  const openFromUrlDisposable = vscode.commands.registerCommand(
    "githubinator.githubinatorOpenFromUrl",
    openFileFromGitHubUrl,
  )
  context.subscriptions.push(openFromUrlDisposable)

  outputChannel.debug("githubinator.active.complete")
}

export function deactivate() {
  outputChannel.debug("githubinator.deactivate")
}

function err(message: string) {
  outputChannel.error(message)
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

function mainBranches() {
  return vscode.workspace
    .getConfiguration("githubinator")
    .get<string[]>("mainBranches", ["main"])
}

/**
 * Search default main branch names for the first one that exists.
 */
async function findShaForBranches(
  gitRepository: git.Repo,
  fileUri: vscode.Uri,
): Promise<[string, string] | null> {
  for (let branch of mainBranches()) {
    const sha = await git.getSHAForBranch(gitRepository, branch)
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
async function githubinator(options: IGithubinator) {
  const {
    openUrl,
    copyToClipboard,
    blame,
    mainBranch,
    openRepo,
    permalink,
    history,
    openPR,
    compare,
  } = options
  outputChannel.info(
    "githubinator called with options: " + JSON.stringify(options),
  )
  const editorConfig = getEditorInfo()
  if (!editorConfig.uri) {
    return err("Could not find file for current editor.")
  }
  const fileUri = editorConfig.uri

  const gitRepository = await git.getRepo(fileUri)
  if (!gitRepository) {
    return err("Could not find git repository for file.")
  }

  let headBranch: [string, string | null] | null = null
  if (mainBranch) {
    const res = await findShaForBranches(gitRepository, fileUri)
    if (res == null) {
      return err(`Could not find SHA for branch in ${mainBranches()}`)
    }
    headBranch = res
  } else {
    headBranch = await git.head(gitRepository)
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
    const selection = editor?.selection
    if (selection == null) {
      return err("Could not find editor")
    }
    const parsedUrl = await new provider(
      providersConfig,
      globalDefaultRemote,
      (remote) => git.origin(gitRepository, remote),
    ).getUrls({
      selection,
      // priority: permalink > branch > branch from HEAD
      // If branchName could not be found (null) then we generate a permalink
      // using the SHA.
      head:
        !!permalink || branchName == null
          ? createSha(head)
          : createBranch(branchName),
      relativeFilePath: editorConfig.fileName
        ? getRelativeFilePath(gitRepository.rootUri, editorConfig.fileName)
        : null,
    })
    if (parsedUrl != null) {
      outputChannel.debug("Found provider", provider.name)
      urls = parsedUrl
      break
    }
    outputChannel.debug("Skipping provider", provider.name)
  }

  if (urls == null) {
    return err("Could not find remote for repository.")
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
  const fallbackUrl = [urls.compareUrl, urls.repoUrl].find((x) => x != null)
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

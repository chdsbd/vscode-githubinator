import * as vscode from "vscode"
import { outputChannel } from "./extension"
import { GitExtension, Remote, Repository } from "./vscode-git"

async function getGitAPI() {
  const gitExtension =
    vscode.extensions.getExtension<GitExtension>("vscode.git")
  if (!gitExtension) return null
  const exports = await gitExtension.activate()
  return exports.getAPI(1)
}

export async function getRepo(fileUri: vscode.Uri) {
  const api = await getGitAPI()
  if (!api) {
    vscode.window.showErrorMessage("Git API not available")
    return null
  }
  const existing = api.getRepository(fileUri)
  if (existing) return existing
  outputChannel.appendLine("No repository found, triggering git refresh...")
  await vscode.commands.executeCommand("git.refresh")
  const afterRefresh = api.getRepository(fileUri)
  if (afterRefresh) return afterRefresh
  // Repos are discovered asynchronously after activation; wait for one to open
  return new Promise<ReturnType<typeof api.getRepository>>((resolve) => {
    const timeout = setTimeout(() => {
      disposable.dispose()
      resolve(null)
      outputChannel.appendLine("Hit 5 second timeout for repository to load.")
    }, 5000)
    const disposable = api.onDidOpenRepository(() => {
      const repo = api.getRepository(fileUri)
      if (repo) {
        outputChannel.appendLine("Found repository via onDidOpenRepository.")
        clearTimeout(timeout)
        disposable.dispose()
        resolve(repo)
      }
    })
  })
}

export async function origin(
  repository: Repository,
  remote: string,
): Promise<string | null> {
  const found = repository.state.remotes.find((r: Remote) => r.name === remote)
  return found?.fetchUrl ?? found?.pushUrl ?? null
}

export async function getSHAForBranch(
  repository: Repository,
  branchName: string,
): Promise<string | null> {
  try {
    const branch = await repository.getBranch(branchName)
    return branch.commit ?? null
  } catch {
    return null
  }
}

export async function head(
  repository: Repository,
): Promise<[string, string | null] | null> {
  const repoHead = repository.state.HEAD
  if (!repoHead?.commit) return null
  return [repoHead.commit, repoHead.name ?? null]
}

export async function dir(
  repository: Repository,
): Promise<{ git: string; repository: string } | null> {
  const root = repository.rootUri.fsPath
  return { git: root, repository: root }
}

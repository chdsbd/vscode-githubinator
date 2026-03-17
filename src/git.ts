import * as vscode from "vscode"
import { execFile } from "child_process"
import { promisify } from "util"
import * as path from "path"
import { outputChannel } from "./extension"

const execFileAsync = promisify(execFile)

export interface Repo {
  rootUri: vscode.Uri
}

async function git(cwd: string, ...args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, { cwd })
  return stdout.trim()
}

export async function getRepo(fileUri: vscode.Uri): Promise<Repo | null> {
  try {
    const stat = await vscode.workspace.fs.stat(fileUri)
    const cwd =
      stat.type & vscode.FileType.Directory
        ? fileUri.fsPath
        : path.dirname(fileUri.fsPath)
    const root = await git(cwd, "rev-parse", "--show-toplevel")
    return { rootUri: vscode.Uri.file(root) }
  } catch {
    outputChannel.warn(
      "Could not find git repository for file: " + fileUri.fsPath,
    )
    return null
  }
}

export async function origin(
  repo: Repo,
  remote: string,
): Promise<string | null> {
  try {
    return await git(repo.rootUri.fsPath, "remote", "get-url", remote)
  } catch {
    return null
  }
}

export async function getSHAForBranch(
  repo: Repo,
  branchName: string,
): Promise<string | null> {
  try {
    return await git(repo.rootUri.fsPath, "rev-parse", branchName)
  } catch {
    return null
  }
}

export async function head(
  repo: Repo,
): Promise<[string, string | null] | null> {
  try {
    const sha = await git(repo.rootUri.fsPath, "rev-parse", "HEAD")
    let branchName: string | null = null
    try {
      branchName = await git(
        repo.rootUri.fsPath,
        "symbolic-ref",
        "--short",
        "HEAD",
      )
    } catch {
      // detached HEAD, branchName stays null
    }
    return [sha, branchName]
  } catch {
    return null
  }
}

export async function dir(
  repo: Repo,
): Promise<{ git: string; repository: string } | null> {
  const root = repo.rootUri.fsPath
  return { git: root, repository: root }
}

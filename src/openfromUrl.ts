import * as vscode from "vscode"

function strToLocation(
  x: string | null,
): { line: number; character: number } | null {
  if (!x) {
    return null
  }
  const line = Number(x.split("C")[0].split("L")[1]) - 1 || null
  const character = Number(x.split("C")[1]) - 1 || 0

  if (line == null) {
    return null
  }

  return { line, character }
}

function fragmentToSelection(fragment: string): vscode.Selection | null {
  const [start, end] = fragment.split("-")
  if (!start) {
    return null
  }
  // start: L1C1 or L1
  const startLocation = strToLocation(start)
  if (!startLocation) {
    return null
  }
  const endLocation = strToLocation(end)
  if (!endLocation) {
    return new vscode.Selection(
      startLocation.line,
      startLocation.character,
      startLocation.line,
      startLocation.character,
    )
  }

  return new vscode.Selection(
    startLocation.line,
    startLocation.character,
    endLocation.line,
    endLocation.character,
  )
}

/**
 * We only support GitHub for now.
 */
export async function openFileFromGitHubUrl() {
  const input = await vscode.window.showInputBox({
    title: "Paste URL to open",
    placeHolder:
      "https://github.com/owner/repo/blob/branch/file.js#L1C1-L10C10",
  })
  if (!input) {
    return
  }
  const url = vscode.Uri.parse(input)

  // we only support simple blob/branch/ paths.
  // if a branch name has a / in it, this won't work.
  //
  // /org/repo/blob/branch/my/file.js -> /my/file.js
  const path =
    "/" +
    url.path
      .split("/")
      .slice(5)
      .join("/")
  if (!path) {
    return
  }
  const selection = fragmentToSelection(url.fragment)
  const results = await Promise.allSettled(
    vscode.workspace.workspaceFolders?.map(async folder => {
      const doc = await vscode.workspace.openTextDocument(
        folder.uri.fsPath + path,
      )

      const editor = await vscode.window.showTextDocument(doc)
      if (selection) {
        editor.selections = [selection]
      }
    }) ?? [],
  )

  for (const result of results) {
    // we were able to open the file in at least one workspace.
    if (result.status === "fulfilled") {
      return
    }
  }
  // don't wait for error message so we can trigger command.
  vscode.window.showErrorMessage("Could not open file from URL.")
  await vscode.commands.executeCommand("extension.githubinatorOpenFromUrl")
}

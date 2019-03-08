import * as path from "path"
import * as fs from "mz/fs"
import * as ini from "ini"

interface IRemote {
  fetch: string
  url?: string
}

export async function origin(
  gitDir: string,
  remote: string,
): Promise<string | null> {
  const configPath = path.resolve(gitDir, "config")
  if (!(await fs.exists(configPath))) {
    return null
  }
  const configFileData = await fs.readFile(configPath, { encoding: "utf-8" })
  const parsedConfig = ini.parse(configFileData)
  for (const [key, value] of Object.entries(parsedConfig)) {
    if (key.startsWith('remote "')) {
      const origin = key.replace(/^remote "/, "").replace(/"$/, "")
      if (origin === remote) {
        const url = (value as IRemote).url
        return url || null
      }
    }
  }

  return null
}

/** Get the SHA for a ref */
export async function getSHAForBranch(
  gitDir: string,
  branchName: string,
): Promise<string | null> {
  const refName = `refs/heads/${branchName}`
  // check packed-refs
  const packedRefPath = path.resolve(gitDir, "packed-refs")
  if (await fs.exists(packedRefPath)) {
    const packRefs = await fs.readFile(packedRefPath, {
      encoding: "utf-8",
    })

    for (const x of packRefs.split("\n")) {
      const [sha, refPath] = x.split(" ") as [
        string | undefined,
        string | undefined
      ]
      if (sha && refPath && refPath.trim() === refName.trim()) {
        return sha
      }
    }
  }
  // check for normal ref
  const refPath = path.resolve(gitDir, refName)
  if (await fs.exists(packedRefPath)) {
    return await fs.readFile(refPath, {
      encoding: "utf-8",
    })
  }
  return null
}

/** Get the current SHA and branch from HEAD for a git directory */
export async function head(gitDir: string): Promise<[string, string] | null> {
  const headPath = path.resolve(gitDir, "HEAD")
  if (!(await fs.exists(headPath))) {
    return null
  }
  const headFileData = await fs.readFile(headPath, { encoding: "utf-8" })
  if (!headFileData) {
    return null
  }
  const headInfo = headFileData.split(" ")[1].trim()
  const branchName = headInfo.replace("refs/heads/", "")
  const sha = await getSHAForBranch(gitDir, branchName)
  if (sha == null) {
    return null
  }
  return [sha, branchName]
}

export function dir(filePath: string) {
  return walkUpDirectories(filePath, ".git")
}

function walkUpDirectories(
  file_path: string,
  file_or_folder: string,
): string | null {
  let directory = path.dirname(file_path)
  while (true) {
    const newPath = path.resolve(directory, file_or_folder)
    if (fs.existsSync(newPath)) {
      return newPath
    }
    const newDirectory = path.dirname(directory)
    if (newDirectory === directory) {
      return null
    }
    directory = newDirectory
  }
}

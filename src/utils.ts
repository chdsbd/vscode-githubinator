import * as path from "path"
import * as fs from "fs"
/** Get path of file relative to git root. */
export function getRelativeFilePath(gitDir: string, fileName: string): string {
  const resolvedFileName = fs.realpathSync(fileName)
  const gitProjectRoot = path.dirname(gitDir) + "/"
  return resolvedFileName.replace(gitProjectRoot, "")
}

/** Convert url/hostname to hostname
 * @example
 * "https://github.com/" -> "github.com"
 * "github.com" -> "github.com"
 */
export function cleanHostname(hostname: string): string {
  return hostname.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

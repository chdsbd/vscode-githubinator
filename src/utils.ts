import * as path from "path"
import * as fs from "fs"
/** Get path of file relative to repository root. */
export function getRelativeFilePath(
  repositoryDir: string,
  fileName: string,
): string | null {
  try {
    const resolvedFileName = fs.realpathSync(fileName)
    return resolvedFileName.replace(repositoryDir, "")
  } catch (e) {
    if (
      typeof e === "object" &&
      e != null &&
      "code" in e &&
      e.code === "ENOENT"
    ) {
      return null
    }
    throw e
  }
}

/** Convert url/hostname to hostname
 * @example
 * "https://github.com/" -> "github.com"
 * "github.com" -> "github.com"
 */
export function cleanHostname(hostname: string): string {
  return hostname.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

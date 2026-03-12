import { dir } from "../../git"
import * as assert from "assert"
import * as path from "path"

// suite("git", async () => {
//   test("dir", async () => {
//     const repoPath = path.normalize(path.join(__dirname, "../../.."))

//     // dir() activates vscode.git before querying, so no manual wait needed
//     assert.deepStrictEqual(await dir(__dirname), {
//       git: repoPath,
//       repository: repoPath,
//     })
//     assert.deepStrictEqual(await dir(repoPath), {
//       git: repoPath,
//       repository: repoPath,
//     })
//   })
// })

import { dir } from "../../git"
import * as assert from "assert"
import * as path from "path"
import * as fs from "fs"

suite("git", async () => {
  test("dir", () => {
    const repoPath = path.normalize(path.join(__dirname, "../../.."))
    const gitPath = path.join(repoPath, ".git")

    assert.deepStrictEqual(dir(__dirname), {
      git: gitPath,
      repository: repoPath,
    })
    assert.deepStrictEqual(dir(repoPath), {
      git: gitPath,
      repository: repoPath,
    })

    const contents = "gitdir: ../../../../.git/modules/test_submodule"
    const submodulePath = path.join(__dirname, "test_submodule")
    fs.mkdirSync(submodulePath, { recursive: true })
    fs.writeFileSync(path.join(submodulePath, ".git"), contents)

    assert.deepStrictEqual(dir(submodulePath), {
      git: path.join(repoPath, ".git/modules/test_submodule"),
      repository: submodulePath,
    })
  })
})

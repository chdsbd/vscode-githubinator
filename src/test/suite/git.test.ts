import { dir } from "../../git"
import * as assert from "assert"
import * as path from "path"

suite("git", async () => {
  test("dir", () => {
    const repoPath = path.normalize(path.join(__dirname, "../../.."))

    assert.strictEqual(dir(__dirname), path.join(repoPath, ".git"))
    assert.strictEqual(dir(repoPath), path.join(repoPath, ".git"))

    const submodulePath = path.join(__dirname, "test_submodule")
    assert.strictEqual(
      dir(submodulePath),
      path.join(repoPath, ".git/modules/test_submodule"),
    )
  })
})

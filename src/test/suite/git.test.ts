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
      commonGit: gitPath,
      repository: repoPath,
    })
    assert.deepStrictEqual(dir(repoPath), {
      git: gitPath,
      commonGit: gitPath,
      repository: repoPath,
    })

    const contents = "gitdir: ../../../../.git/modules/test_submodule"
    const submodulePath = path.join(__dirname, "test_submodule")
    fs.mkdirSync(submodulePath, { recursive: true })
    fs.writeFileSync(path.join(submodulePath, ".git"), contents)

    assert.deepStrictEqual(dir(submodulePath), {
      git: path.join(repoPath, ".git/modules/test_submodule"),
      commonGit: path.join(repoPath, ".git/modules/test_submodule"),
      repository: submodulePath,
    })

    // worktree: gitdir redirect with a commondir file
    const worktreeGitDir = path.join(repoPath, ".git/worktrees/my-feature")
    fs.mkdirSync(worktreeGitDir, { recursive: true })
    fs.writeFileSync(path.join(worktreeGitDir, "commondir"), "../..")

    const worktreePath = path.join(__dirname, "test_worktree")
    fs.mkdirSync(worktreePath, { recursive: true })
    fs.writeFileSync(
      path.join(worktreePath, ".git"),
      `gitdir: ${worktreeGitDir}`,
    )

    assert.deepStrictEqual(dir(worktreePath), {
      git: worktreeGitDir,
      commonGit: gitPath,
      repository: worktreePath,
    })

    // cleanup
    fs.rmSync(worktreePath, { recursive: true })
    fs.rmSync(worktreeGitDir, { recursive: true })
  })
})

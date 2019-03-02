import { Github, Gitlab } from "../providers"
import * as assert from "assert"

suite("Github", () => {
  const gh = new Github()
  test("ssh", () => {
    const result = gh.getUrl({
      origin: "git@github.com:recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blob",
      providersConfig: {},
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    assert.strictEqual(
      result && result.fileUrl,
      "https://github.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
    )
    assert.strictEqual(
      result && result.repoUrl,
      "https://github.com/recipeyak/recipeyak",
    )
  })
  test("https", () => {
    const result = gh.getUrl({
      origin: "https://github.mycompany.com/recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blame",
      providersConfig: {
        github: { hostname: "github.mycompany.com" },
      },
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    assert.strictEqual(
      result && result.fileUrl,
      "https://github.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
    )
  })
})

suite("Gitlab", () => {
  const gl = new Gitlab()
  test("ssh", () => {
    const result = gl.getUrl({
      origin: "git@gitlab.com:recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blob",
      providersConfig: {},
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    assert.strictEqual(
      result && result.fileUrl,
      "https://gitlab.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
    )
    assert.strictEqual(
      result && result.repoUrl,
      "https://gitlab.com/recipeyak/recipeyak",
    )
  })
  test("https", () => {
    const result = gl.getUrl({
      origin: "https://gitlab.mycompany.com/recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blame",
      providersConfig: {
        gitlab: { hostname: "gitlab.mycompany.com" },
      },
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    assert.strictEqual(
      result && result.fileUrl,
      "https://gitlab.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
    )
  })
})

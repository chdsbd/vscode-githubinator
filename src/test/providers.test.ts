import { Github, Gitlab } from "../providers"
import * as assert from "assert"

test("Github", () => {
  const gh = new Github()
  test("ssh", () => {
    const result = gh.getUrl({
      origin: "git@github.com:recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blob",
      providersConfig: {},
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.ts",
    })
    assert.strictEqual(
      result,
      "https://github.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L17-L24",
    )
  })
  test("https", () => {
    const result = gh.getUrl({
      origin: "https://gitlab.mycompany.com/recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blame",
      providersConfig: {
        github: { hostname: "gitlab.mycompany.com" },
      },
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.ts",
    })
    assert.strictEqual(
      result,
      "https://gitlab.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L17-L24",
    )
  })
})

test("Gitlab", () => {
  const gl = new Gitlab()
  test("ssh", () => {
    const result = gl.getUrl({
      origin: "git@gitlab.com:recipeyak/recipeyak.git",
      selection: [17, 24],
      mode: "blob",
      providersConfig: {},
      head: "db99a912f5c4bffe11d91e163cd78ed96589611b",
      relativeFilePath: "frontend/src/components/App.ts",
    })
    assert.strictEqual(
      result,
      "https://gitlab.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L17-L24",
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
      relativeFilePath: "frontend/src/components/App.ts",
    })
    assert.strictEqual(
      result,
      "https://gitlab.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L17-L24",
    )
  })
})

import {
  Github,
  Gitlab,
  Bitbucket,
  VisualStudio,
  createSha,
  createBranch,
} from "../providers"
import * as assert from "assert"

suite("Github", () => {
  const gh = new Github()
  test("ssh", () => {
    const result = gh.getUrls({
      origin: "git@github.com:recipeyak/recipeyak.git",
      selection: [17, 24],
      providersConfig: {},
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://github.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      blameUrl:
        "https://github.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      repoUrl: "https://github.com/recipeyak/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
  test("https", () => {
    const result = gh.getUrls({
      origin: "https://github.mycompany.com/recipeyak/recipeyak.git",
      selection: [17, 24],
      providersConfig: {
        github: { hostnames: ["github.mycompany.com"] },
      },
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://github.mycompany.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      blameUrl:
        "https://github.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      repoUrl: "https://github.mycompany.com/recipeyak/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
})

suite("Gitlab", () => {
  const gl = new Gitlab()
  test("ssh", () => {
    const result = gl.getUrls({
      origin: "git@gitlab.com:recipeyak/recipeyak.git",
      selection: [17, 24],
      providersConfig: {},
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://gitlab.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      blameUrl:
        "https://gitlab.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      repoUrl: "https://gitlab.com/recipeyak/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
  test("https", () => {
    const result = gl.getUrls({
      origin: "https://gitlab.mycompany.com/recipeyak/recipeyak.git",
      selection: [17, 24],
      providersConfig: {
        gitlab: { hostnames: ["gitlab.mycompany.com"] },
      },
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      blameUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      repoUrl: "https://gitlab.mycompany.com/recipeyak/recipeyak",
    }

    assert.deepEqual(result, expected)
  })
})

suite("Bitbucket", () => {
  const bb = new Bitbucket()
  test("ssh", () => {
    const result = bb.getUrls({
      origin: "git@bitbucket.org:recipeyak/recipeyak.git",
      selection: [17, 24],
      providersConfig: {},
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://bitbucket.org/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      blameUrl:
        "https://bitbucket.org/recipeyak/recipeyak/annotate/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      repoUrl: "https://bitbucket.org/recipeyak/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
  test("https", () => {
    const result = bb.getUrls({
      origin: "https://chdsbd@git.mycompany.org/recipeyak/recipeyak.git",
      selection: [17, 24],
      providersConfig: {
        bitbucket: { hostnames: ["git.mycompany.org"] },
      },
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      blameUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/annotate/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      repoUrl: "https://git.mycompany.org/recipeyak/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
})

suite("VisualStudio", () => {
  const vs = new VisualStudio()
  test("ssh", () => {
    const result = vs.getUrls({
      origin: "git@ssh.dev.azure.com:v3/acmecorp/project-alpha/recipeyak",
      selection: [17, 24],
      providersConfig: {},
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&line=18&lineEnd=25",
      blameUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&line=18&lineEnd=25&_a=annotate",
      repoUrl: "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
  test("https", () => {
    const result = vs.getUrls({
      origin:
        "https://chdsbd@git.mycompany.org/acmecorp/project-alpha/_git/recipeyak",
      selection: [17, 24],
      providersConfig: {
        visualstudio: { hostnames: ["git.mycompany.org"] },
      },
      head: createBranch("master"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GBmaster&line=18&lineEnd=25",
      blameUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GBmaster&line=18&lineEnd=25&_a=annotate",
      repoUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak",
    }
    assert.deepEqual(result, expected)
  })
})

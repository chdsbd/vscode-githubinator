import {
  Github,
  Gitlab,
  Bitbucket,
  VisualStudio,
  createSha,
  createBranch,
} from "../providers"
import * as assert from "assert"

suite("Github", async () => {
  const gh = new Github()
  test("ssh", async () => {
    const result = await gh.getUrls({
      findOrigin: async _ => "git@github.com:recipeyak/recipeyak.git",
      globalDefaultRemote: "origin",
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
  test("https", async () => {
    const result = await gh.getUrls({
      findOrigin: async _ =>
        "https://github.mycompany.com/recipeyak/recipeyak.git",
      globalDefaultRemote: "origin",
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

suite("Gitlab", async () => {
  const gl = new Gitlab()
  test("ssh", async () => {
    const result = await gl.getUrls({
      findOrigin: async _ => "git@gitlab.com:recipeyak/recipeyak.git",
      globalDefaultRemote: "origin",
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
  test("https", async () => {
    const result = await gl.getUrls({
      findOrigin: async _ =>
        "https://gitlab.mycompany.com/recipeyak/recipeyak.git",
      globalDefaultRemote: "origin",
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

suite("Bitbucket", async () => {
  const bb = new Bitbucket()
  test("ssh", async () => {
    const result = await bb.getUrls({
      findOrigin: async _ => "git@bitbucket.org:recipeyak/recipeyak.git",
      globalDefaultRemote: "origin",
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
  test("https", async () => {
    let calledOrigin = ""
    const result = await bb.getUrls({
      findOrigin: async originName => {
        calledOrigin = originName
        return "https://chdsbd@git.mycompany.org/recipeyak/recipeyak.git"
      },
      globalDefaultRemote: "blah",
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
    assert.deepEqual(calledOrigin, "blah")
  })
})

suite("VisualStudio", async () => {
  const vs = new VisualStudio()
  test("ssh", async () => {
    let calledOrigin = ""
    const result = await vs.getUrls({
      findOrigin: async originName => {
        calledOrigin = originName
        return "git@ssh.dev.azure.com:v3/acmecorp/project-alpha/recipeyak"
      },
      globalDefaultRemote: "blah",
      selection: [17, 24],
      providersConfig: { visualstudio: { remote: "hello_world" } },
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
    assert.deepEqual(calledOrigin, "hello_world")
  })
  test("https", async () => {
    let calledOrigin = ""
    const result = await vs.getUrls({
      findOrigin: async originName => {
        calledOrigin = originName
        return "https://chdsbd@git.mycompany.org/acmecorp/project-alpha/_git/recipeyak"
      },
      globalDefaultRemote: "origin-two",
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
    assert.deepEqual(calledOrigin, "origin-two")
  })
})

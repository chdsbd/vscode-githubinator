import {
  Gitlab,
  Bitbucket,
  VisualStudio,
  createSha,
  createBranch,
  Github,
} from "../providers"
import * as assert from "assert"

suite("Github", async () => {
  test("ssh", async () => {
    async function findRemote(hostname: string) {
      return "git@github.com:recipeyak/recipeyak.git"
    }
    const gh = new Github({}, "origin", findRemote)
    const result = await gh.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://github.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      blameUrl:
        "https://github.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      repoUrl: "https://github.com/recipeyak/recipeyak",
      historyUrl:
        "https://github.com/recipeyak/recipeyak/commits/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
    }
    assert.deepEqual(result, expected)
  })
  test("https", async () => {
    async function findRemote(hostname: string) {
      return "https://github.mycompany.com/recipeyak/recipeyak.git"
    }
    const gh = new Github(
      {
        github: { hostnames: ["github.mycompany.com"] },
      },
      "origin",
      findRemote,
    )
    const result = await gh.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://github.mycompany.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      blameUrl:
        "https://github.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-L25",
      repoUrl: "https://github.mycompany.com/recipeyak/recipeyak",
      historyUrl:
        "https://github.mycompany.com/recipeyak/recipeyak/commits/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
    }
    assert.deepEqual(result, expected)
  })
})

suite("Gitlab", async () => {
  test("ssh", async () => {
    const gl = new Gitlab(
      {},
      "origin",
      async _ => "git@gitlab.com:recipeyak/recipeyak.git",
    )
    const result = await gl.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://gitlab.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      blameUrl:
        "https://gitlab.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      repoUrl: "https://gitlab.com/recipeyak/recipeyak",
      historyUrl:
        "https://gitlab.com/recipeyak/recipeyak/commits/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
    }
    assert.deepEqual(result, expected)
  })
  test("https", async () => {
    const gl = new Gitlab(
      {
        gitlab: { hostnames: ["gitlab.mycompany.com"] },
      },
      "origin",
      async _ => "https://gitlab.mycompany.com/recipeyak/recipeyak.git",
    )
    const result = await gl.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      blameUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/blame/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#L18-25",
      repoUrl: "https://gitlab.mycompany.com/recipeyak/recipeyak",
      historyUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/commits/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
    }

    assert.deepEqual(result, expected)
  })
})

suite("Bitbucket", async () => {
  test("ssh", async () => {
    const bb = new Bitbucket(
      {},
      "origin",
      async _ => "git@bitbucket.org:recipeyak/recipeyak.git",
    )
    const result = await bb.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://bitbucket.org/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      blameUrl:
        "https://bitbucket.org/recipeyak/recipeyak/annotate/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      repoUrl: "https://bitbucket.org/recipeyak/recipeyak",
      historyUrl:
        "https://bitbucket.org/recipeyak/recipeyak/history-node/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
    }
    assert.deepEqual(result, expected)
  })
  test("https", async () => {
    let calledOrigin = ""
    const getOrigin = async (originName: string) => {
      calledOrigin = originName
      return "https://chdsbd@git.mycompany.org/recipeyak/recipeyak.git"
    }
    const bb = new Bitbucket(
      {
        bitbucket: { hostnames: ["git.mycompany.org"] },
      },
      "blah",
      getOrigin,
    )
    const result = await bb.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/blob/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      blameUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/annotate/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx#lines-18:25",
      repoUrl: "https://git.mycompany.org/recipeyak/recipeyak",
      historyUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/history-node/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
    }
    assert.deepEqual(result, expected)
    assert.deepEqual(calledOrigin, "blah")
  })
})

suite("VisualStudio", async () => {
  test("ssh", async () => {
    let calledOrigin = ""
    const getOrigin = async (originName: string) => {
      calledOrigin = originName
      return "git@ssh.dev.azure.com:v3/acmecorp/project-alpha/recipeyak"
    }
    const vs = new VisualStudio(
      { visualstudio: { remote: "hello_world" } },
      "blah",
      getOrigin,
    )
    const result = await vs.getUrls({
      selection: [17, 24],
      head: createSha("db99a912f5c4bffe11d91e163cd78ed96589611b"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&line=18&lineEnd=25",
      blameUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&line=18&lineEnd=25&_a=annotate",
      historyUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&_a=history",
      repoUrl: "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak",
    }
    assert.deepEqual(result, expected)
    assert.deepEqual(calledOrigin, "hello_world")
  })
  test("https", async () => {
    let calledOrigin = ""
    const getOrigin = async (originName: string) => {
      calledOrigin = originName
      return "https://chdsbd@git.mycompany.org/acmecorp/project-alpha/_git/recipeyak"
    }
    const vs = new VisualStudio(
      {
        visualstudio: { hostnames: ["git.mycompany.org"] },
      },
      "origin-two",
      getOrigin,
    )
    const result = await vs.getUrls({
      selection: [17, 24],
      head: createBranch("master"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GBmaster&line=18&lineEnd=25",
      blameUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GBmaster&line=18&lineEnd=25&_a=annotate",
      historyUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GBmaster&_a=history",
      repoUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak",
    }
    assert.deepEqual(result, expected)
    assert.deepEqual(calledOrigin, "origin-two")
  })
})

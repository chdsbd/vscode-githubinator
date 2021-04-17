import {
  Gitlab,
  Bitbucket,
  VisualStudio,
  createSha,
  createBranch,
  Github,
  pathJoin,
} from "../providers"
import * as assert from "assert"

suite("utils", async () => {
  test("pathJoin", () => {
    assert.strictEqual(
      pathJoin(
        "ghost",
        "ghost.github.io",
        "blob",
        "fixit/-#123✅",
        "C#/C#.Package",
      ),
      "ghost/ghost.github.io/blob/fixit--%23123%E2%9C%85/C%23/C%23.Package",
    )
  })
})

suite("Github", async () => {
  test("ssh", async () => {
    for (let url of [
      "git@github.com:recipeyak/recipeyak.git",
      "git@github.com:recipeyak/recipeyak",
    ]) {
      async function findRemote(hostname: string) {
        return url
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
        compareUrl:
          "https://github.com/recipeyak/recipeyak/compare/db99a912f5c4bffe11d91e163cd78ed96589611b",
        historyUrl:
          "https://github.com/recipeyak/recipeyak/commits/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
        prUrl:
          "https://github.com/recipeyak/recipeyak/pull/new/db99a912f5c4bffe11d91e163cd78ed96589611b",
        repoUrl: "https://github.com/recipeyak/recipeyak",
      }
      assert.deepEqual(result, expected)
    }
  })
  test("https", async () => {
    for (let url of [
      "git@github.mycompany.com:recipeyak/recipeyak.git",
      "git@github.mycompany.com:recipeyak/recipeyak",
    ]) {
      async function findRemote(hostname: string) {
        return url
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
        head: createBranch("master"),
        relativeFilePath: "frontend/src/components/App.tsx",
      })
      const expected = {
        blobUrl:
          "https://github.mycompany.com/recipeyak/recipeyak/blob/master/frontend/src/components/App.tsx#L18-L25",
        blameUrl:
          "https://github.mycompany.com/recipeyak/recipeyak/blame/master/frontend/src/components/App.tsx#L18-L25",
        compareUrl:
          "https://github.mycompany.com/recipeyak/recipeyak/compare/master",
        historyUrl:
          "https://github.mycompany.com/recipeyak/recipeyak/commits/master/frontend/src/components/App.tsx",
        prUrl:
          "https://github.mycompany.com/recipeyak/recipeyak/pull/new/master",
        repoUrl: "https://github.mycompany.com/recipeyak/recipeyak",
      }
      assert.deepEqual(result, expected)
    }
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
      compareUrl:
        "https://gitlab.com/recipeyak/recipeyak/compare/db99a912f5c4bffe11d91e163cd78ed96589611b",
      historyUrl:
        "https://gitlab.com/recipeyak/recipeyak/commits/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
      prUrl:
        "https://gitlab.com/recipeyak/recipeyak/merge_requests/new?merge_request%5Bsource_branch%5D=db99a912f5c4bffe11d91e163cd78ed96589611b",
      repoUrl: "https://gitlab.com/recipeyak/recipeyak",
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
      head: createBranch("master"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/blob/master/frontend/src/components/App.tsx#L18-25",
      blameUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/blame/master/frontend/src/components/App.tsx#L18-25",
      compareUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/compare/master",
      historyUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/commits/master/frontend/src/components/App.tsx",
      prUrl:
        "https://gitlab.mycompany.com/recipeyak/recipeyak/merge_requests/new?merge_request%5Bsource_branch%5D=master",
      repoUrl: "https://gitlab.mycompany.com/recipeyak/recipeyak",
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
      compareUrl:
        "https://bitbucket.org/recipeyak/recipeyak/branches/compare/db99a912f5c4bffe11d91e163cd78ed96589611b..",
      historyUrl:
        "https://bitbucket.org/recipeyak/recipeyak/history-node/db99a912f5c4bffe11d91e163cd78ed96589611b/frontend/src/components/App.tsx",
      prUrl:
        "https://bitbucket.org/recipeyak/recipeyak/pull-requests/new?source=db99a912f5c4bffe11d91e163cd78ed96589611b",
      repoUrl: "https://bitbucket.org/recipeyak/recipeyak",
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
      head: createBranch("master"),
      relativeFilePath: "frontend/src/components/App.tsx",
    })
    const expected = {
      blobUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/blob/master/frontend/src/components/App.tsx#lines-18:25",
      blameUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/annotate/master/frontend/src/components/App.tsx#lines-18:25",
      compareUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/branches/compare/master..",
      historyUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/history-node/master/frontend/src/components/App.tsx",
      prUrl:
        "https://git.mycompany.org/recipeyak/recipeyak/pull-requests/new?source=master",
      repoUrl: "https://git.mycompany.org/recipeyak/recipeyak",
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
      compareUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak/branches?targetVersion=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&_a=commits",
      historyUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GCdb99a912f5c4bffe11d91e163cd78ed96589611b&_a=history",
      prUrl:
        "https://dev.azure.com/acmecorp/project-alpha/_git/recipeyak/pullrequestcreate?sourceRef=db99a912f5c4bffe11d91e163cd78ed96589611b",
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
      compareUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak/branches?targetVersion=GBmaster&_a=commits",
      historyUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak?path=%2Ffrontend%2Fsrc%2Fcomponents%2FApp.tsx&version=GBmaster&_a=history",
      prUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak/pullrequestcreate?sourceRef=master",
      repoUrl:
        "https://git.mycompany.org/acmecorp/project-alpha/_git/recipeyak",
    }
    assert.deepEqual(result, expected)
    assert.deepEqual(calledOrigin, "origin-two")
  })
})

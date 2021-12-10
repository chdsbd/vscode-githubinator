import * as path from "path"
import * as url from "url"
import { IProviderConfig } from "./extension"
import { cleanHostname } from "./utils"
import { flatten } from "lodash"
import gitUrlParse from "git-url-parse"

interface IBaseGetUrls {
  readonly selection: [number | null, number | null]
  readonly head: Head
  readonly relativeFilePath: string | null
}

export interface IUrlInfo {
  readonly blobUrl: string | null
  readonly repoUrl: string | null
  readonly blameUrl: string | null
  readonly historyUrl: string | null
  readonly prUrl: string | null
  readonly compareUrl: string | null
}

interface IOrgInfo {
  readonly org: string
  readonly repo: string
  readonly hostname: string
}

interface IBranch {
  readonly kind: "branch"
  readonly value: string
}

export function createBranch(value: string): IBranch {
  return { kind: "branch", value }
}

interface ISHA {
  readonly kind: "sha"
  readonly value: string
}

type Head = IBranch | ISHA

export function createSha(value: string): ISHA {
  return { kind: "sha", value }
}

abstract class BaseProvider {
  abstract readonly DEFAULT_HOSTNAMES: string[]
  abstract readonly PROVIDER_NAME: string

  private CONFIG: { [key: string]: IProviderConfig | undefined }
  private GLOBAL_DEFAULT_REMOTE: string
  private FIND_REMOTE: (x: string) => Promise<string | null>

  constructor(
    config: { [key: string]: IProviderConfig | undefined },
    global_default_remote: string,
    findRemote: (x: string) => Promise<string | null>,
  ) {
    this.CONFIG = config
    this.GLOBAL_DEFAULT_REMOTE = global_default_remote
    this.FIND_REMOTE = findRemote.bind(this)
  }
  private getConfig() {
    return this.CONFIG[this.PROVIDER_NAME]
  }
  private getRemoteName(): string {
    const conf = this.getConfig()
    return conf && conf.remote ? conf.remote : this.GLOBAL_DEFAULT_REMOTE
  }
  private getHostnames() {
    const conf = this.getConfig()
    return this.DEFAULT_HOSTNAMES.concat((conf && conf.hostnames) || []).map(
      cleanHostname,
    )
  }
  async findOrgInfo(): Promise<IOrgInfo | null> {
    const origin = await this.FIND_REMOTE(this.getRemoteName())
    if (origin == null) {
      return null
    }
    let parsed: gitUrlParse.GitUrl
    try {
      parsed = gitUrlParse(origin)
    } catch {
      return null
    }

    if (!this.getHostnames().some(x => parsed.resource.includes(x))) {
      return null
    }

    return { org: parsed.owner, repo: parsed.name, hostname: parsed.resource }
  }
  abstract getUrls(params: IBaseGetUrls): Promise<IUrlInfo | null>
}

export function pathJoin(...args: string[]): string {
  return path.join(
    ...flatten(args.map(x => x.split("/"))).map(encodeURIComponent),
  )
}

export class Github extends BaseProvider {
  DEFAULT_HOSTNAMES = ["github.com"]
  PROVIDER_NAME = "github"
  async getUrls({
    selection,
    head,
    relativeFilePath,
  }: IBaseGetUrls): Promise<IUrlInfo | null> {
    const repoInfo = await this.findOrgInfo()
    if (repoInfo == null) {
      return null
    }
    const rootUrl = `https://${repoInfo.hostname}/`
    const [start, end] = selection
    // Github uses 1-based indexing
    const lines =
      start != null && end != null ? `L${start + 1}-L${end + 1}` : null
    const repoUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo),
      rootUrl,
    ).toString()
    const createUrl = (mode: string, hash = true) => {
      if (relativeFilePath == null) {
        return null
      }
      const u = new url.URL(
        pathJoin(
          repoInfo.org,
          repoInfo.repo,
          mode,
          head.value,
          relativeFilePath,
        ),
        rootUrl,
      )
      if (hash && lines) {
        u.hash = lines
      }
      return u.toString()
    }
    const blobUrl = createUrl("blob")
    const blameUrl = createUrl("blame")
    const historyUrl = createUrl("commits", false)
    const compareUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo, "compare", head.value),
      rootUrl,
    ).toString()
    const prUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo, "pull", "new", head.value),
      rootUrl,
    ).toString()
    return {
      blobUrl,
      blameUrl,
      compareUrl,
      historyUrl,
      prUrl,
      repoUrl,
    }
  }
}

export class Gitlab extends BaseProvider {
  DEFAULT_HOSTNAMES = ["gitlab.com"]
  PROVIDER_NAME = "gitlab"
  async getUrls({
    selection,
    relativeFilePath,
    head,
  }: IBaseGetUrls): Promise<IUrlInfo | null> {
    const repoInfo = await this.findOrgInfo()
    if (repoInfo == null) {
      return null
    }
    const rootUrl = `https://${repoInfo.hostname}/`
    const [start, end] = selection
    // The format is L34-56 (this is one character off from Github)
    const lines =
      start != null && end != null ? `L${start + 1}-${end + 1}` : null
    const repoUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo),
      rootUrl,
    ).toString()
    const createUrl = (mode: string, hash = true) => {
      if (relativeFilePath == null) {
        return null
      }
      const u = new url.URL(
        pathJoin(
          repoInfo.org,
          repoInfo.repo,
          mode,
          head.value,
          relativeFilePath,
        ),
        rootUrl,
      )
      if (hash && lines) {
        u.hash = lines
      }
      return u.toString()
    }
    const blobUrl = createUrl("blob")
    const blameUrl = createUrl("blame")
    const historyUrl = createUrl("commits", false)
    const compareUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo, "compare", head.value),
      rootUrl,
    ).toString()
    // https://gitlab.com/recipeyak/recipeyak/merge_requests/new?merge_request%5Bsource_branch%5D=master
    const prUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo, "merge_requests", "new"),
      rootUrl,
    )
    prUrl.search = `merge_request%5Bsource_branch%5D=${head.value}`
    return {
      blobUrl,
      blameUrl,
      compareUrl,
      historyUrl,
      prUrl: prUrl.toString(),
      repoUrl,
    }
  }
}

export class Bitbucket extends BaseProvider {
  DEFAULT_HOSTNAMES = ["bitbucket.org"]
  PROVIDER_NAME = "bitbucket"
  async getUrls({
    selection,
    relativeFilePath,
    head,
  }: IBaseGetUrls): Promise<IUrlInfo | null> {
    const repoInfo = await this.findOrgInfo()
    if (repoInfo == null) {
      return null
    }
    // https://bitbucket.org/recipeyak/recipeyak/src/master/app/main.py#lines-12:15
    const rootUrl = `https://${repoInfo.hostname}/`
    const [start, end] = selection
    const lines =
      start != null && end != null ? `lines-${start + 1}:${end + 1}` : null
    const repoUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo),
      rootUrl,
    ).toString()
    const createUrl = (mode: string, hash = true) => {
      if (relativeFilePath == null) {
        return null
      }
      const u = new url.URL(
        pathJoin(
          repoInfo.org,
          repoInfo.repo,
          mode,
          head.value,
          relativeFilePath,
        ),
        rootUrl,
      )
      if (hash && lines) {
        u.hash = lines
      }
      return u.toString()
    }
    const blobUrl = createUrl("blob")
    const blameUrl = createUrl("annotate")
    const compareUrl = new url.URL(
      pathJoin(
        repoInfo.org,
        repoInfo.repo,
        "branches",
        "compare",
        head.value + "..",
      ),
      rootUrl,
    ).toString()
    const historyUrl = createUrl("history-node", false)
    // "https://bitbucket.org/recipeyak/recipeyak/pull-requests/new?source=db99a912f5c4bffe11d91e163cd78ed96589611b"
    const prUrl = new url.URL(
      pathJoin(repoInfo.org, repoInfo.repo, "pull-requests", "new"),
      rootUrl,
    )
    prUrl.search = `source=${head.value}`
    return {
      blobUrl,
      blameUrl,
      compareUrl,
      historyUrl,
      prUrl: prUrl.toString(),
      repoUrl,
    }
  }
}

export const providers = [Bitbucket, Gitlab, Github]

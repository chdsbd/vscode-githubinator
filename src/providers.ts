import * as path from "path"
import * as url from "url"
import { IProviderConfig } from "./extension"
import { cleanHostname } from "./utils"

interface IBaseGetUrls {
  readonly selection: [number, number]
  readonly head: Head
  readonly relativeFilePath: string
}

export interface IUrlInfo {
  readonly blobUrl: string
  readonly repoUrl: string
  readonly blameUrl: string
  readonly historyUrl: string
  readonly prUrl: string
  readonly compareUrl: string
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
  abstract readonly DEFAULT_HOSTNAMES = [] as string[]
  abstract readonly MATCHERS: ((hostname: string) => RegExp)[] = []
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
    for (const hostname of this.getHostnames()) {
      const matches = this.MATCHERS.map(matcher =>
        origin.match(matcher(hostname)),
      )
      let org: string | null = null
      let repo: string | null = null
      for (const match of matches) {
        if (match != null) {
          ;[, org, repo] = match
        }
      }
      if (org == null || repo == null) {
        continue
      }
      return { org, repo, hostname }
    }
    return null
  }
  abstract getUrls(params: IBaseGetUrls): Promise<IUrlInfo | null>
}

export class Github extends BaseProvider {
  DEFAULT_HOSTNAMES = ["github.com"]
  PROVIDER_NAME = "github"
  MATCHERS = [
    (hostname: string) => RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`),
    (hostname: string) => RegExp(`^https:\/\/${hostname}\/(.*)\/(.*)\.git$`),
  ]
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
    const lines = `L${start + 1}-L${end + 1}`
    const repoUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo),
      rootUrl,
    ).toString()
    const createUrl = (mode: string, hash = true) => {
      const u = new url.URL(
        path.join(
          repoInfo.org,
          repoInfo.repo,
          mode,
          head.value,
          relativeFilePath,
        ),
        rootUrl,
      )
      if (hash) {
        u.hash = lines
      }
      return u
    }
    const blobUrl = createUrl("blob").toString()
    const blameUrl = createUrl("blame").toString()
    const compareUrl = createUrl("compare", false).toString()
    const historyUrl = createUrl("commits", false).toString()
    const prUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "pull", "new", head.value),
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
  MATCHERS = [
    (hostname: string) => RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`),
    (hostname: string) => RegExp(`^https:\/\/${hostname}\/(.*)\/(.*)\.git$`),
  ]
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
    const lines = `L${start + 1}-${end + 1}`
    const repoUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo),
      rootUrl,
    ).toString()
    const createUrl = (mode: string, hash = true) => {
      const u = new url.URL(
        path.join(
          repoInfo.org,
          repoInfo.repo,
          mode,
          head.value,
          relativeFilePath,
        ),
        rootUrl,
      )
      if (hash) {
        u.hash = lines
      }
      return u
    }
    const blobUrl = createUrl("blob").toString()
    const blameUrl = createUrl("blame").toString()
    const historyUrl = createUrl("commits", false).toString()
    const compareUrl = createUrl("compare", false).toString()
    // https://gitlab.com/recipeyak/recipeyak/merge_requests/new?merge_request%5Bsource_branch%5D=master
    const prUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "merge_requests", "new"),
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
  MATCHERS = [
    (hostname: string) => RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`),
    (hostname: string) => RegExp(`^https:\/\/.*${hostname}\/(.*)\/(.*)\.git$`),
  ]
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
    const lines = `lines-${start + 1}:${end + 1}`
    const repoUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo),
      rootUrl,
    ).toString()
    const createUrl = (mode: string, hash = true) => {
      const u = new url.URL(
        path.join(
          repoInfo.org,
          repoInfo.repo,
          mode,
          head.value,
          relativeFilePath,
        ),
        rootUrl,
      )
      if (hash) {
        u.hash = lines
      }
      return u
    }
    const blobUrl = createUrl("blob").toString()
    const blameUrl = createUrl("annotate").toString()
    const compareUrl = new url.URL(
      path.join(
        repoInfo.org,
        repoInfo.repo,
        "branches",
        "compare",
        head.value + "..",
      ),
      rootUrl,
    ).toString()
    const historyUrl = createUrl("history-node", false).toString()
    // "https://bitbucket.org/recipeyak/recipeyak/pull-requests/new?source=db99a912f5c4bffe11d91e163cd78ed96589611b"
    const prUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "pull-requests", "new"),
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

export class VisualStudio extends BaseProvider {
  DEFAULT_HOSTNAMES = ["dev.azure.com"]
  PROVIDER_NAME = "visualstudio"
  MATCHERS = [
    // git@ssh.dev.azure.com:v3/chdignam/magnus-montis/magnus-montis
    (hostname: string) => RegExp(`^git@ssh\.${hostname}:v3\/(.*)\/(.*)$`),
    // https://chdignam@dev.azure.com/chdignam/magnus-montis/_git/magnus-montis
    (hostname: string) =>
      RegExp(`^https:\/\/.*@${hostname}\/(.*)\/_git\/(.*)$`),
  ]
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
    const lines = `&line=${start + 1}&lineEnd=${end + 1}`
    const repoUrl = new url.URL(
      path.join(repoInfo.org, "_git", repoInfo.repo),
      rootUrl,
    )
    let filePath = relativeFilePath
    if (!filePath.startsWith("/")) {
      filePath = "/" + filePath
    }
    const version =
      head.kind === "branch" ? `GB${head.value}` : `GC${head.value}`
    const baseSearch = `path=${encodeURIComponent(filePath)}&version=${version}`
    const blobUrl = new url.URL(repoUrl.toString())
    const blameUrl = new url.URL(repoUrl.toString())
    const historyUrl = new url.URL(repoUrl.toString())
    blobUrl.search = baseSearch + lines
    blameUrl.search = baseSearch + lines + "&_a=annotate"
    historyUrl.search = baseSearch + "&_a=history"
    const compareUrl = new url.URL(
      path.join(repoInfo.org, "_git", repoInfo.repo, "branches"),
      rootUrl,
    )
    compareUrl.search = `targetVersion=${version}&_a=commits`
    const prUrl = new url.URL(
      path.join(repoInfo.org, "_git", repoInfo.repo, "pullrequestcreate"),
      rootUrl,
    )
    prUrl.search = `sourceRef=${head.value}`
    return {
      blobUrl: blobUrl.toString(),
      blameUrl: blameUrl.toString(),
      compareUrl: compareUrl.toString(),
      historyUrl: historyUrl.toString(),
      prUrl: prUrl.toString(),
      repoUrl: repoUrl.toString(),
    }
  }
}

export const providers = [Bitbucket, Gitlab, Github, VisualStudio]

import * as path from "path"
import * as url from "url"
import { IGithubinatorConfig } from "./extension"
import { cleanHostname } from "./utils"

interface IGetUrl {
  readonly selection: [number, number]
  readonly head: string
  readonly mode: "blob" | "blame"
  readonly relativeFilePath: string
  readonly origin: string
  readonly providersConfig: IGithubinatorConfig["providers"]
}

interface IUrlInfo {
  readonly fileUrl: string
  readonly repoUrl: string
}
interface IProvider {
  readonly getMatchers: (hostname: string) => RegExp[]
  readonly getUrl: (params: IGetUrl) => IUrlInfo | null
}

/** Match target against multiple matchers. Extract the first two groups. */
function findOrgInfo(target: string, matchers: RegExp[]) {
  const matches = matchers.map(matcher => target.match(matcher))
  let org: string | null = null
  let repo: string | null = null
  for (const match of matches) {
    if (match != null) {
      ;[, org, repo] = match
    }
  }
  if (org == null || repo == null) {
    return null
  }
  return { org, repo }
}

export class Github implements IProvider {
  DEFAULT_HOSTNAME = "github.com"
  getMatchers(hostname: string) {
    const SSH = RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`)
    const HTTPS = RegExp(`^https:\/\/${hostname}\/(.*)\/(.*)\.git$`)
    return [SSH, HTTPS]
  }
  getUrl({
    selection,
    relativeFilePath,
    head,
    mode,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const config = providersConfig["github"]
    const providerHostname =
      (config && config.hostname) || this.DEFAULT_HOSTNAME
    const hostname = cleanHostname(providerHostname)
    const repoInfo = findOrgInfo(origin, this.getMatchers(providerHostname))
    if (repoInfo == null) {
      return null
    }
    const rootUrl = `https://${hostname}/`
    const [start, end] = selection
    // Github uses 1-based indexing
    const lines = `L${start + 1}-L${end + 1}`
    const repoUrl = new url.URL(path.join(repoInfo.org, repoInfo.repo), rootUrl)
    const parsedUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, mode, head, relativeFilePath),
      rootUrl,
    )
    parsedUrl.hash = lines
    return { fileUrl: parsedUrl.toString(), repoUrl: repoUrl.toString() }
  }
}

export class Gitlab implements IProvider {
  DEFAULT_HOSTNAME = "gitlab.com"
  // https://gitlab.com/my_org/my_repo/blob/master/app/main.py#L3-4
  getMatchers(hostname: string) {
    const SSH = RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`)
    const HTTPS = RegExp(`^https:\/\/${hostname}\/(.*)\/(.*)\.git$`)
    return [SSH, HTTPS]
  }
  getUrl({
    selection,
    relativeFilePath,
    head,
    mode,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const config = providersConfig["gitlab"]
    const providerHostname =
      (config && config.hostname) || this.DEFAULT_HOSTNAME
    const hostname = cleanHostname(providerHostname)
    const repoInfo = findOrgInfo(origin, this.getMatchers(providerHostname))
    if (repoInfo == null) {
      return null
    }
    const rootUrl = `https://${hostname}/`
    const [start, end] = selection
    // The format is L34-56 (this is one character off from Github)
    const lines = `L${start + 1}-${end + 1}`
    const repoUrl = new url.URL(path.join(repoInfo.org, repoInfo.repo), rootUrl)
    const parsedUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, mode, head, relativeFilePath),
      rootUrl,
    )
    parsedUrl.hash = lines
    return { fileUrl: parsedUrl.toString(), repoUrl: repoUrl.toString() }
  }
}

export const providers = [Gitlab, Github]

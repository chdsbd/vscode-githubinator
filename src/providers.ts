import * as path from "path"
import * as url from "url"
import { IGithubinatorConfig, IProviderConfig } from "./extension"
import { cleanHostname } from "./utils"

interface IGetUrl {
  readonly selection: [number, number]
  readonly head: string
  readonly relativeFilePath: string
  readonly origin: string
  readonly providersConfig: IGithubinatorConfig["providers"]
}

export interface IUrlInfo {
  readonly blobUrl: string
  readonly repoUrl: string
  readonly blameUrl: string
}
interface IProvider {
  readonly getMatchers: (hostname: string) => RegExp[]
  readonly getUrls: (params: IGetUrl) => IUrlInfo | null
}

interface IOrgInfo {
  org: string
  repo: string
  hostname: string
}
/** Match target against multiple matchers. Extract the first two groups. */
function findOrgInfo(
  origin: string,
  hostnames: string[],
  getMatchers: (hostname: string) => RegExp[],
): IOrgInfo | null {
  for (const hostname of hostnames) {
    const matches = getMatchers(hostname).map(matcher => origin.match(matcher))
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

function getHostnames(
  defaults: string[],
  config: undefined | IProviderConfig,
): string[] {
  return defaults.concat((config && config.hostnames) || []).map(cleanHostname)
}

export class Github implements IProvider {
  DEFAULT_HOSTNAMES = ["github.com"]
  getMatchers(hostname: string) {
    const SSH = RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`)
    const HTTPS = RegExp(`^https:\/\/${hostname}\/(.*)\/(.*)\.git$`)
    return [SSH, HTTPS]
  }
  getUrls({
    selection,
    relativeFilePath,
    head,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const config = providersConfig["github"]
    // We always want to include the default hostnames, so a user cannot
    // accidently remove github.com from the github provider by setting a custom
    // hostname.
    const hostnames = getHostnames(this.DEFAULT_HOSTNAMES, config)
    const repoInfo = findOrgInfo(origin, hostnames, this.getMatchers.bind(this))
    if (repoInfo == null) {
      return null
    }
    const rootUrl = `https://${repoInfo.hostname}/`
    const [start, end] = selection
    // Github uses 1-based indexing
    const lines = `L${start + 1}-L${end + 1}`
    const repoUrl = new url.URL(path.join(repoInfo.org, repoInfo.repo), rootUrl)
    const blobUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "blob", head, relativeFilePath),
      rootUrl,
    )
    const blameUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "blame", head, relativeFilePath),
      rootUrl,
    )
    blobUrl.hash = lines
    blameUrl.hash = lines
    return {
      blobUrl: blobUrl.toString(),
      blameUrl: blameUrl.toString(),
      repoUrl: repoUrl.toString(),
    }
  }
}

export class Gitlab implements IProvider {
  DEFAULT_HOSTNAMES = ["gitlab.com"]
  // https://gitlab.com/my_org/my_repo/blob/master/app/main.py#L3-4
  getMatchers(hostname: string) {
    const SSH = RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`)
    const HTTPS = RegExp(`^https:\/\/${hostname}\/(.*)\/(.*)\.git$`)
    return [SSH, HTTPS]
  }
  getUrls({
    selection,
    relativeFilePath,
    head,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const config = providersConfig["gitlab"]
    const hostnames = getHostnames(this.DEFAULT_HOSTNAMES, config)
    const repoInfo = findOrgInfo(origin, hostnames, this.getMatchers.bind(this))
    if (repoInfo == null) {
      return null
    }
    const rootUrl = `https://${repoInfo.hostname}/`
    const [start, end] = selection
    // The format is L34-56 (this is one character off from Github)
    const lines = `L${start + 1}-${end + 1}`
    const repoUrl = new url.URL(path.join(repoInfo.org, repoInfo.repo), rootUrl)
    const blobUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "blob", head, relativeFilePath),
      rootUrl,
    )
    const blameUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "blame", head, relativeFilePath),
      rootUrl,
    )
    blobUrl.hash = lines
    blameUrl.hash = lines
    return {
      blobUrl: blobUrl.toString(),
      blameUrl: blameUrl.toString(),
      repoUrl: repoUrl.toString(),
    }
  }
}

export class Bitbucket implements IProvider {
  DEFAULT_HOSTNAMES = ["bitbucket.org"]
  getMatchers(hostname: string) {
    // git@bitbucket.org:recipeyak/recipeyak.git
    // https://chdsbd@bitbucket.org/recipeyak/recipeyak.git
    const SSH = RegExp(`^git@${hostname}:(.*)\/(.*)\.git$`)
    const HTTPS = RegExp(`^https:\/\/.*${hostname}\/(.*)\/(.*)\.git$`)
    return [SSH, HTTPS]
  }
  getUrls({
    selection,
    relativeFilePath,
    head,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const config = providersConfig["bitbucket"]
    const hostnames = getHostnames(this.DEFAULT_HOSTNAMES, config)
    const repoInfo = findOrgInfo(origin, hostnames, this.getMatchers.bind(this))
    if (repoInfo == null) {
      return null
    }
    // https://bitbucket.org/recipeyak/recipeyak/src/master/app/main.py#lines-12:15
    const rootUrl = `https://${repoInfo.hostname}/`
    const [start, end] = selection
    const lines = `lines-${start + 1}:${end + 1}`
    const repoUrl = new url.URL(path.join(repoInfo.org, repoInfo.repo), rootUrl)
    const blobUrl = new url.URL(
      path.join(repoInfo.org, repoInfo.repo, "blob", head, relativeFilePath),
      rootUrl,
    )
    const blameUrl = new url.URL(
      path.join(
        repoInfo.org,
        repoInfo.repo,
        "annotate",
        head,
        relativeFilePath,
      ),
      rootUrl,
    )
    blobUrl.hash = lines
    blameUrl.hash = lines
    return {
      blobUrl: blobUrl.toString(),
      blameUrl: blameUrl.toString(),
      repoUrl: repoUrl.toString(),
    }
  }
}

export const providers = [Bitbucket, Gitlab, Github]

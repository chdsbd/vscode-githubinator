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
  readonly getUrl: (params: IGetUrl) => IUrlInfo | null
}

export class Github implements IProvider {
  SSH = /^git@github\.com:(.*)\/(.*)\.git$/
  HTTPS = /^https:\/\/github\.com\/(.*)\/(.*)\.git$/
  HOSTNAME = "github.com"
  getUrl({
    selection,
    relativeFilePath,
    head,
    mode,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const [start, end] = selection
    const ssh = origin.match(this.SSH)
    const https = origin.match(this.HTTPS)
    let [_, org, repo] =
      ssh != null ? ssh : https != null ? https : [null, null, null]
    if (org == null || repo == null) {
      return null
    }
    const providerHostname = providersConfig["github"]
    const hostname = cleanHostname(
      providerHostname ? providerHostname : this.HOSTNAME,
    )
    const rootUrl = `https://${hostname}/`
    // Github uses 1-based indexing
    const lines = `L${start + 1}-L${end + 1}`
    const repoUrl = new url.URL(path.join(org, repo), rootUrl)
    const parsedUrl = new url.URL(
      path.join(org, repo, mode, head, relativeFilePath),
      rootUrl,
    )
    parsedUrl.hash = lines
    return { fileUrl: parsedUrl.toString(), repoUrl: repoUrl.toString() }
  }
}

class Gitlab implements IProvider {
  SSH = /^git@gitlab\.com:(.*)\/(.*)\.git$/
  HTTPS = /^https:\/\/gitlab.com\/(.*)\/(.*)\.git$/
  HOSTNAME = "gitlab.com"
  // https://gitlab.com/my_org/my_repo/blob/master/app/main.py#L3-4
  getUrl({
    selection,
    relativeFilePath,
    head,
    mode,
    providersConfig,
    origin,
  }: IGetUrl): IUrlInfo | null {
    const ssh = origin.match(this.SSH)
    const https = origin.match(this.HTTPS)
    const [_, org, repo] = ssh ? ssh : https ? https : [null, null, null]
    if (org == null || repo == null) {
      return null
    }

    const providerHostname = providersConfig["gitlab"]
    const hostname = cleanHostname(
      providerHostname ? providerHostname : this.HOSTNAME,
    )
    const rootUrl = `https://${hostname}/`

    const [start, end] = selection
    // The format is L34-56 (this is one character off from Github)
    const lines = `L${start + 1}-${end + 1}`
    const repoUrl = new url.URL(path.join(org, repo), rootUrl)
    const parsedUrl = new url.URL(
      path.join(org, repo, mode, head, relativeFilePath),
      rootUrl,
    )
    parsedUrl.hash = lines
    return { fileUrl: parsedUrl.toString(), repoUrl: repoUrl.toString() }
  }
}

export const providers = [Gitlab, Github]

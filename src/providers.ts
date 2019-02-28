import * as path from "path";
import * as url from "url";
import { IGithubinatorConfig } from "./extension";
import { cleanHostname } from "./utils";

interface IGetUrl {
  selection: [number, number];
  head: string;
  mode: "blob" | "blame";
  relativeFilePath: string;
  origin: string;
  providersConfig: IGithubinatorConfig["providers"];
}

interface IProvider {
  getUrl(params: IGetUrl): { fileUrl: string; repoUrl: string } | null;
}

export class Github implements IProvider {
  SSH = /^git@github\.com:(.*)\/(.*)\.git$/;
  HTTPS = /^https:\/\/github\.com\/(.*)\/(.*)\.git$/;
  HOSTNAME = "github.com";
  getUrl({
    selection,
    relativeFilePath,
    head,
    mode,
    providersConfig,
    origin
  }: IGetUrl): { fileUrl: string; repoUrl: string } | null {
    const [start, end] = selection;
    const ssh = origin.match(this.SSH);
    const https = origin.match(this.HTTPS);
    let [_, org, repo] =
      ssh != null ? ssh : https != null ? https : [null, null, null];
    if (org == null || repo == null) {
      return null;
    }
    const providerHostname = providersConfig["github"];
    const hostname = cleanHostname(
      providerHostname ? providerHostname : this.HOSTNAME
    );
    const rootUrl = `https://${hostname}/`;
    // Github uses 1-based indexing
    const lines = `L${start + 1}-L${end + 1}`;
    const repoUrl = new url.URL(path.join(org, repo), rootUrl);
    const parsedUrl = new url.URL(
      path.join(org, repo, mode, head, relativeFilePath),
      rootUrl
    );
    parsedUrl.hash = lines;
    return { fileUrl: parsedUrl.toString(), repoUrl: repoUrl.toString() };
  }
}

export const providers = [Github];

import { getEncodedPackageName } from "../lib/encoder.js"

const downloader = async (packageName, version) => {
  const versionInfo = await (await fetch(`https://registry.npmjs.org/${getEncodedPackageName(packageName)}/${encodeURIComponent(version)}`)).json();
  const tarballURL = new URL(versionInfo.dist.tarball);
  tarballURL.host = "registry.yarnpkg.com"
  return async () => {
    const response = await fetch(tarballURL);
    if (!response.ok) throw new Error("");
    return response.body.cancel();
  }
}

export default downloader;
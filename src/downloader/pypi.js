import { getEncodedPackageName } from "../lib/encoder.js"

const downloader = async (packageName, version) => {
  const versionInfo = await (await fetch(`https://pypi.org/pypi/${getEncodedPackageName(packageName)}/${encodeURIComponent(version)}/json`)).json();
  const url = new URL(versionInfo.urls[0].url);
  return async () => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("");
    return response.body.cancel();
  }
}

export default downloader;

import { getEncodedPackageName } from "../lib/encoder.js";

const extractor = {
  getLatestVersion: async (packageName) => {
    const encodedPackageName = getEncodedPackageName(packageName);
    try {
      const data = await (await fetch(`https://api.deps.dev/v3/systems/pypi/packages/${encodedPackageName}`)).json();
      const latestVersion = data.versions.find((version) => version.isDefault);
      return latestVersion.versionKey
    } catch {
      console.warn("Failed to get version data from deps.dev, falling back to pypi.org ...");
      const data = await (await fetch(`https://pypi.org/pypi/${encodedPackageName}/json`)).json();
      return data.info
    }
  },
  getVersion: async (packageName, version) => {
    const encodedPackageName = getEncodedPackageName(packageName);
    const response = await fetch(`https://pypi.org/pypi/${encodedPackageName}/${encodeURIComponent(version)}/json`);
    if (!response.ok) throw new Error("Version not found");
    const data = await response.json();
    return data.info;
  }
}
export default extractor

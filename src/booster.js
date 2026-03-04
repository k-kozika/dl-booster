import ora from 'ora';
import figlet from "figlet";
import pLimit from 'p-limit';

import npmExtractor from "./extractor/npm.js"
import pypiExtractor from "./extractor/pypi.js"
import npmDownloader from "./downloader/npm.js"
import pypiDownloader from "./downloader/pypi.js"

export async function run({ platform, targetPackage, count, concurrency }) {
  console.log(await figlet.text("BOOSTER"));
  console.log("Artificially inflates download counts by repeatedly downloading packages\n");

  const versionCheckSpinner = ora('Resolving version...').start();
  let extractor = null;
  switch (platform) {
    case "npm":
      extractor = npmExtractor;
      break;
    case "pypi":
      extractor = pypiExtractor;
      break;
    default:
      versionCheckSpinner.fail("No extractor is available for this platform.");
  }
  if (!extractor) return;
  let packageVersion = targetPackage.version;
  if (packageVersion === null) {
    console.log("Package version was not specified. Treating as the latest version.");
    versionCheckSpinner.text = "Fetching latest version"
    const latestVersion = await extractor.getLatestVersion(targetPackage.name);
    versionCheckSpinner.info(`Latest version for package ${targetPackage.name} found, version=${latestVersion.version}`);
    packageVersion = latestVersion.version
  } else {
    console.log("Checking version");
    versionCheckSpinner.text = `Checking if version ${packageVersion} is available`
    try {
      const version = await extractor.getVersion(targetPackage.name, packageVersion);
      versionCheckSpinner.info(`Version ${version.version} for package ${targetPackage.name} found`);
    } catch {
      console.warn(`Failed to get version ${packageVersion} for package ${targetPackage.name}, falling back to the latest version...`);
      const latestVersion = await extractor.getLatestVersion(targetPackage.name);
      versionCheckSpinner.info(`Latest version for package ${targetPackage.name} found, version=${latestVersion.version}`);
      packageVersion = latestVersion.version
    }
  }

  const downloaderSpinner = ora("Ready").start();

  let downloader = null;
  switch (platform) {
    case "npm":
      downloader = await npmDownloader(targetPackage.name, packageVersion);
      break;
    case "pypi":
      downloader = await pypiDownloader(targetPackage.name, packageVersion);
      break;
    default:
      downloaderSpinner.fail("No downloader is available.");
  }
  if (!downloader) return;
  console.log("Starting downloader...");
  downloaderSpinner.color = "magenta";
  const runners = []
  const limit = pLimit(concurrency);
  for (let i = 0; i < count; i++) {
    runners.push(limit(downloader));
    downloaderSpinner.text = `Starting downloader... [${i} / ${count}]`
  }

  console.log("Downlaoder started!");
  downloaderSpinner.text = "Downloading..."
  const downlaodPromise = Promise.allSettled(runners);
  const i = setInterval(() => {
    downloaderSpinner.text = `Downloading... [${limit.activeCount} running / ${limit.pendingCount} waiting / ${runners.length} total]`
  }, 500);
  downlaodPromise.then((results) => {
    clearInterval(i);
    const success = results.filter((r) => r.status === "fulfilled").length
    downloaderSpinner.succeed(`Download numbers have increased! Successful downloads= ${success}`);
  }).catch((e) => {
    clearInterval(i);
    downloaderSpinner.fail(`Something went wrong.\n${e}`);
  });
}

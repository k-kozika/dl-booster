import { parseArgs } from "./src/cli.js"
import { run } from "./src/booster.js"

const args = parseArgs();
await run({
  platform: args._[0],
  targetPackage: args.package,
  count: args.count,
  concurrency: args.concurrency
})

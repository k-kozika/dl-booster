import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

function parsePkg(str) {
  const re = /^(@?[^@]+(?:\/[^@]+)*)(?:@(.+))?$/;
  const m = re.exec(str);
  if (!m) throw new Error(`Invalid package format: ${str}`);
  return { name: m[1], version: m[2] || null };
}

export const parseArgs = () =>
  yargs(hideBin(process.argv))
    .command('npm <package> <count>', 'boost download count on NPM', (yargs) => {
      return yargs
        .positional('package', {
          describe: 'package[@version]',
          type: "string",
          coerce: parsePkg
        })
        .positional('count', {
          describe: 'How much to increase downloads',
          type: "number"
        });
    })
    .command('pypi <package> <count>', 'boost download count on PyPI', (yargs) => {
      return yargs
        .positional('package', {
          describe: 'package[@version]',
          type: "string",
          coerce: parsePkg
        })
        .positional('count', {
          describe: 'How much to increase downloads',
          type: "number"
        });
    })
    .option('concurrency', {
      alias: 'c',
      type: 'number',
      description: 'How many to download in parallel',
      default: 50
    })
    .demandCommand(1)
    .help()
    .strict()
    .parse();

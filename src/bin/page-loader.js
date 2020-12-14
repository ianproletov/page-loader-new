#!/usr/bin/env node

import program from 'commander';
import { version } from '../../package.json';
import loadPage from '..';

program
  .version(version, '-V, --version')
  .description('Usage: page-loader [options]')
  .description('Downloads the page content')
  .arguments('<pageAddress>')
  .option('-o, --output [path]', 'Output directory path', process.cwd())
  .action(async (pageAddress) => loadPage(pageAddress, program.output)
    .then(() => console.log(`${pageAddress} has downloaded to ${program.output}`))
    .catch((error) => {
      console.error(error.message);
      process.exit(1);
    }));
program.parse(process.argv);

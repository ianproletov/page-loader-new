#!usr/bin/env node

import { Command } from 'commander';
import { version } from '../../package.json';
import { getName } from '..';

const program = new Command();
program
  .version(version, '-V, --version')
  .description('Usage: page-loader [options]')
  .description('Downloads the page content')
  .arguments('<pageAddress>')
  .option('-o, --output [path]', 'Output directory path', process.cwd())
  .action((pageAddress) => console.log(getName(pageAddress)));
program.parse(process.argv);

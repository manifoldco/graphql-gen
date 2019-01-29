#!/usr/bin/env node

const { readFileSync, existsSync, writeFileSync } = require('fs');
const { mkdirpSync } = require('fs-extra');
const chalk = require('chalk');
const { dirname, resolve } = require('path');
const meow = require('meow');
const yaml = require('js-yaml');
const graphQLGen = require('../dist/cjs');

const cli = meow(
  `
Usage
  $ @manifoldco/graphql-gen [input] [options]

Options
  --help          display this
  --output, -o    specify output file
  --swagger, -s   specify Swagger version (default 2)
`,
  {
    flags: {
      output: {
        type: 'string',
        alias: 'o',
      },
      swagger: {
        type: 'number',
        alias: 's',
      },
    },
  }
);

let spec = cli.input[0];

// If input is a file, load it
const pathname = resolve(process.cwd(), spec);
if (existsSync(pathname)) {
  spec = readFileSync(pathname, 'UTF-8');
}

// Attempt to parse YAML
try {
  if (/\.ya?ml$/i.test(spec) || spec[0] !== '{') {
    spec = yaml.safeLoad(spec);
  }
} catch (e) {
  console.error(
    chalk.red(`❌ "${spec}" seems to be YAML, but it couldn’t be parsed.
  ${e}`)
  );
}

// Attempt to parse JSON
try {
  if (typeof spec === 'string') {
    spec = JSON.parse(spec);
  }
} catch (e) {
  console.error(
    chalk.red(`❌ Could not parse JSON for "${spec}." Is this a valid Swagger spec?
  ${e}`)
  );
}

const result = graphQLGen(spec, cli.flags);

// Write to file if specifying output
if (cli.flags.output) {
  const timeStart = process.hrtime();
  const outputFile = resolve(process.cwd(), cli.flags.output);
  const parent = dirname(outputFile);
  mkdirpSync(parent);
  writeFileSync(outputFile, result);

  const timeEnd = process.hrtime(timeStart);
  const time = timeEnd[0] + Math.round(timeEnd[1] / 1e6);
  console.log(chalk.green(`🚀 ${cli.input[0]} -> ${chalk.bold(cli.flags.output)} [${time}ms]`));
  return;
}

// Otherwise, return result
return result;

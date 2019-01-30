const { resolve, sep } = require('path');
const { exec } = require('child_process');
const glob = require('glob');

const graphqlGen = resolve(__dirname, '..', 'bin', 'cli.js');

// Settings
const INPUT_DIR = 'spec';
const OUTPUT_DIR = 'types';

// Methods
function rename(filename) {
  return filename
    .replace(`${sep}${INPUT_DIR}${sep}`, `${sep}${OUTPUT_DIR}${sep}`)
    .replace(/\.ya?ml$/i, '.graphql');
}

// Initialize
glob('./spec/**/*.yaml', { root: resolve(__dirname, '..') }, (error, matches) => {
  if (error) {
    console.error('No files found');
    return;
  }

  if (typeof matches === 'string') {
    exec(`node ${graphqlGen} ${matches} -o ${rename(matches)}`);
    return;
  }

  matches.forEach(file => exec(`node ${graphqlGen} ${file} -o ${rename(file)}`));
});

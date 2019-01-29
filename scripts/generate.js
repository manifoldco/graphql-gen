const { resolve, sep } = require('path');
const { exec } = require('child_process');
const glob = require('glob');

const graphqlGen = resolve(__dirname, '..', 'bin', 'graphql-gen.js');

// Load all YAML files from a certain directory
glob('./spec/**/*.yaml', { root: resolve(__dirname, '..') }, (error, matches) => {
  if (error) {
    console.error('No files found');
    return;
  }

  if (typeof matches === 'string') {
    generate(matches);
    return;
  }

  matches.forEach(file => {
    const output = file
      .replace(`${sep}spec${sep}`, `${sep}types${sep}`)
      .replace(/\.ya?ml$/i, '.graphql');
    exec(`node ${graphqlGen} ${file} -o ${output}`);
  });
});

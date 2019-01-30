const { resolve } = require('path');
const { exec } = require('child_process');

const graphqlGen = resolve(__dirname, '..', 'bin', 'cli.js');

// Settings
const INPUT = resolve(__dirname, '..', 'example', 'input.yaml');
const OUTPUT = resolve(__dirname, '..', 'example', 'output.graphql');

// Generate
exec(`node ${graphqlGen} ${INPUT} -o ${OUTPUT}`);

import { readFileSync } from 'fs';
import { resolve, sep } from 'path';
import { execSync } from 'child_process';
import * as glob from 'glob';
import * as yaml from 'js-yaml';
import swaggerToGraphQL from '../src';

describe('GraphQL gen', () => {
  it('matches the snapshots generated', () => {
    execSync('npm run generate');

    const files = glob.sync('../spec/**/*.yaml');

    if (!Array.isArray(files)) return;

    files.forEach(file => {
      const pathname = resolve(__dirname, file);
      const json = yaml.safeLoad(readFileSync(pathname, 'UTF-8'));
      const converted = swaggerToGraphQL(json);
      const snapshot = pathname
        .replace(`${sep}spec${sep}`, `${sep}types${sep}`)
        .replace(/\.yaml$/i, '.graphql');
      expect(converted).toEqual(readFileSync(snapshot, 'UTF-8'));
    });
  });
});

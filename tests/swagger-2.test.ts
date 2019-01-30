import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { resolve } from 'path';
import * as prettier from 'prettier';
import graphqlGen from '../src';
import { Swagger2 } from '../src/swagger-2';

// Let Prettier handle formatting, not the test expectations
function format(spec: string) {
  return prettier.format(spec, { parser: 'graphql' });
}

describe('Swagger 2 spec', () => {
  describe('core Swagger types', () => {
    it('string -> String', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              email: { type: 'string' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        email: String
      }`);

      expect(graphqlGen(swagger)).toBe(graphql);
    });

    it('integer -> Int', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              age: { type: 'integer' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        age: Int
      }`);

      expect(graphqlGen(swagger)).toBe(graphql);
    });

    it('number(float) -> Float', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              lat: { type: 'number', format: 'float' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        lat: Float
      }`);

      expect(graphqlGen(swagger)).toBe(graphql);
    });

    it('number(?) -> Int', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              points: { type: 'number' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        points: Int
      }`);

      expect(graphqlGen(swagger)).toBe(graphql);
    });

    it('boolean -> Boolean', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              active: { type: 'boolean' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        active: Boolean
      }`);

      expect(graphqlGen(swagger)).toBe(graphql);
    });
  });

  describe('GraphQL features', () => {
    it('specifies non-nullable fields', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              username: { type: 'string' },
            },
            required: ['username'],
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        username: String!
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });

    it('flattens single-type $refs', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              password: { $ref: '#/definitions/UserPassword' },
            },
            type: 'object',
          },
          UserPassword: {
            type: 'string',
          },
        },
      };

      const graphql = format(`
      type User {
        password: String
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });

    it('converts things called “ID” to IDs', () => {
      const swagger: Swagger2 = {
        definitions: {
          ID: {
            type: 'string',
          },
          User: {
            properties: {
              id: { $ref: '#/definitions/ID' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        id: ID
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });
  });

  describe('complex structures', () => {
    it('handles arrays of primitive structures', () => {
      const swagger: Swagger2 = {
        definitions: {
          User: {
            properties: {
              teams: { type: 'array', items: { type: 'string' } },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        teams: [String]
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });

    it('handles arrays of complex items', () => {
      const swagger: Swagger2 = {
        definitions: {
          Team: {
            properties: {
              id: { type: 'string' },
            },
            type: 'object',
          },
          User: {
            properties: {
              teams: { type: 'array', items: { $ref: '#/definitions/Team' } },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        teams: [Team]
      }
      type Team {
        id: String
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });

    it('handles allOf', () => {
      const swagger: Swagger2 = {
        definitions: {
          Admin: {
            allOf: [
              { $ref: '#/definitions/User' },
              {
                properties: {
                  rbac: { type: 'string' },
                },
                type: 'object',
              },
            ],
            type: 'object',
          },
          User: {
            properties: {
              email: { type: 'string' },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type User {
        email: String
      }
      type Admin implements User {
        rbac: String
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });

    it('handles oneOf (kinda)', () => {
      const swagger: Swagger2 = {
        definitions: {
          Record: {
            properties: {
              rand: {
                oneOf: [{ type: 'string' }, { type: 'number' }],
                type: 'array',
              },
            },
            type: 'object',
          },
        },
      };

      const graphql = format(`
      type Record {
        rand: String
      }`);

      expect(graphqlGen(swagger)).toBe(format(graphql));
    });
  });

  describe('other output', () => {
    it('generates the example output correctly', () => {
      const input = yaml.safeLoad(
        readFileSync(resolve(__dirname, '..', 'example', 'input.yaml'), 'UTF-8')
      );
      const output = readFileSync(resolve(__dirname, '..', 'example', 'output.graphql'), 'UTF-8');

      expect(graphqlGen(input)).toBe(format(output));
    });
  });
});

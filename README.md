[![version
(scoped)](https://img.shields.io/npm/v/@manifoldco/graphql-gen.svg)](https://www.npmjs.com/package/@manifoldco/graphql-gen)
[![codecov](https://codecov.io/gh/manifoldco/graphql-gen/branch/master/graph/badge.svg)](https://codecov.io/gh/manifoldco/graphql-gen)

# ⚛️ graphql-gen

Node client for generating crude GraphQL specs from Swagger OpenAPI.

💅 Prettifies output via [Prettier][prettier].

#### Support

| GraphQL Features                     |     |
| :----------------------------------- | :-: |
| Enum                                 | ✅  |
| ID                                   | ✅  |
| Union (`oneOf`)                      | ✅  |
| Non-nullable                         | ✅  |
| Primitives (string, boolean, number) | ✅  |
| Query                                | 🚫  |
| Mutation                             | 🚫  |

To compare actual generated output, see the [example](./example) folder.

## Usage

### CLI

```bash
npx @manifoldco/graphql-gen schema.yaml --output schema.graphql

# 🚀 schema.yaml -> schema.graphql [2ms]
```

This will save a `schema.graphql` file in the current folder. The CLI can
accept YAML or JSON for the input file.

#### Generating multiple schemas

Say you have multiple schemas you need to parse. I’ve found the simplest way
to do that is to use npm scripts. In your `package.json`, you can do
something like the following:

```json
"scripts": {
  "generate:specs": "npm run generate:specs:one && npm run generate:specs:two",
  "generate:specs:one": "npx @manifoldco/graphql-gen one.yaml -o one.graphql",
  "generate:specs:two": "npx @manifoldco/graphql-gen two.yaml -o two.graphql"
}
```

Rinse and repeat for more specs.

For anything more complicated, or for generating specs dynamically, you can
also use the Node API (below).

#### CLI Options

| Option                | Alias | Default  | Description                                                |
| :-------------------- | :---- | :------: | :--------------------------------------------------------- |
| `--output [location]` | `-o`  | (stdout) | Where should the output file be saved?                     |
| `--swagger [version]` | `-s`  |   `2`    | Which Swagger version to use. Currently only supports `2`. |

### Node

```bash
npm i --save-dev @manifoldco/graphql-gen
```

```js
const { readFileSync } = require('fs');
const graphqlGen = require('@manifoldco/graphql-gen');

const input = JSON.parse(readFileSync('spec.json', 'utf8')); // Input be any JS object (OpenAPI format)
const output = graphqlGen(input); // Outputs GraphQL schema as a string (to be parsed, or written to a file)
```

(OpenAPI format), and return a GraphQL schema in string format. This lets you pull
from any source (a Swagger server, local files, etc.), and similarly lets put
The Node API is a bit more flexible: it will only take a JS object as input
the output anywhere. It even allows for some post-processing in-between if
desired.

If you are working with local files, you’ll have to read/write files
yourself. Also, if your specs are in YAML, you’ll have to convert them to JS
objects. A library such as [js-yaml][js-yaml] does make this trivial, though!
Lastly, if you’re batching large folders of specs, [glob][glob] may also come
in handy.

#### Node Options

| Name        |   Type   |  Default   | Description                                                                                          |
| :---------- | :------: | :--------: | :--------------------------------------------------------------------------------------------------- |
| `namespace` | `string` | `OpenAPI2` | How should the output be namespaced? (namespacing is enforced as there’s a high chance of collision) |
| `swagger`   | `number` |    `2`     | Which Swagger version to use. Currently only supports `2`.                                           |

## FAQ

#### Why does this exist apart from [yarax/swagger-to-graphql](https://github.com/yarax/swagger-to-graphql) ?

That didn’t work for our Swagger 2.0 specs 🤷. While normally a PR is the best
course of action, this repo exists because it was less effort to build something
that works for us than rewrite a popular library (it wasn’t a quick fix).

#### Why aren’t Queries and Mutations generated from the OpenAPI spec?

While it’s possible to generate _something_ from OpenAPI, it’s intentionally
omitted from autogeneration here. Queries and Mutations are best left up to
humans, so you can determine what developers should access, and how.
Ultimately generating these will always fall short of how real humans
could—and should—use your GraphQL endpoint.

## Notes

GraphQL is a spec, just like OpenAPI. For this reason, automatic generation
isn’t ideal long-term. This library should probably be used as a
**first-pass** to migrate an OpenAPI endpoint to GraphQL. This can generate
types, but can’t intelligently generate the best queries and mutations for
your specific endpoint.

A common example of this: Swagger has a concept of `format: datetime`.
GraphQL cares about this, but doesn’t assume the formatting. Is this UNIX
time? ISO? Are there timezones? Types can be so much more descriptive than
mere `string` or `int`, and GraphQL gives you the tools to declare this
yourself.

[prettier]: https://github.com/prettier/prettier

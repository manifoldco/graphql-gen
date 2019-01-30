# ⚛️ graphql-gen

Node client for generating crude GraphQL specs from Swagger OpenAPI.

💅 Prettifies output via [Prettier][prettier].

#### Support

| GraphQL Features                     |     |
| :----------------------------------- | :-: |
| Enum                                 | ✅  |
| ID                                   | ✅  |
| Implements (`allOf`)                 | ✅  |
| Polymorphism\* (`oneOf`)             | N/A |
| Non-nullable                         | ✅  |
| Primitives (string, boolean, number) | ✅  |
| Query                                | 🚫  |
| Mutation                             | 🚫  |

To compare actual generated output, see the [example](./example) folder.

_\* Polymorphism isn’t supported by GraphQL by design. If this encounters one
in Swagger, it’ll assign the first type it encounters and throw a warning._

## Usage

### CLI

```bash
npx @manifoldco/graphql-gen schema.yaml --output schema.graphql

# 🚀 schema.yaml -> schema.graphql [2ms]
```

This will save a `schema.graphql` file in the current folder. The CLI can
accept YAML or JSON for the input file.

### Node

```bash
npm i --save-dev @manifoldco/graphql-gen
```

```js
const graphqlGen = require('@manifoldco/graphql-gen');

graphqlGen(spec, [options]);
```

`spec` must be in JSON format. For an example of converting YAML to JSON, see
the [generate.js](./scripts/generate.js) script.

### Options

| Name      | Default  | Description                                                |
| :-------- | :------- | :--------------------------------------------------------- |
| `output`  | (stdout) | Where should the output file be saved?                     |
| `swagger` | `2`      | Which Swagger version to use. Currently only supports `2`. |

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

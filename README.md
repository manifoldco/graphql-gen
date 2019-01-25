# ⚛️ swagger-to-graphql

Node client for generating crude GraphQL specs from Swagger OpenAPI.
Currently only supports Swagger v2.

#### Support

| GraphQL Features                     |     |
| :----------------------------------- | :-: |
| Enum                                 | ✅  |
| ID                                   | ✅  |
| Implements (`allOf`)                 | ✅  |
| Non-nullable                         | ✅  |
| Primitives (string, boolean, number) | ✅  |
| Query                                | 🚫  |
| Mutation                             | 🚫  |

## Usage

```
npm i --save-dev @manifoldco/swagger-to-graphql
```

```js
const swaggerToGQL = require('@manifoldco/swagger-to-graphql');

swaggerToGQL(spec, [options]);
```

`spec` must be in JSON format. For an example of converting YAML to JSON, see
the [generate.js](./scripts/generate.js) script.

#### Options

| Name      | Default | Description                                                |
| :-------- | :------ | :--------------------------------------------------------- |
| `version` | `2`     | Which Swagger version to use. Currently only supports `2`. |

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

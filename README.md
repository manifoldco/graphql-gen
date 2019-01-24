# ⚛️ swagger-to-graphql

Node client for generating crude GraphQL specs from Swagger OpenAPI.
Currently only supports Swagger v2.

## Usage

```
npm i --save-dev @manifoldco/swagger-to-graphql
```

See the [generate.js](./scripts/generate.js) script for an example of how to
load files.

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

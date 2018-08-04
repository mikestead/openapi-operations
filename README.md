# OpenAPI 2.0 Operations

[![Build Status](https://travis-ci.org/mikestead/openapi-operations.svg?branch=master)](https://travis-ci.org/mikestead/openapi-operations)

A small (~1kb) library to transform an OpenAPI 2.0 spec into an array of operations.

This opens up the use of higher order functions (map, filter, reduce, etc)
to process the spec for your own needs.

## Install

```
yarn add openapi-operations
```

## Usage

```JavaScript
const openApiOperations = require('openapi-operations')

// load and parse your OpenAPI spec, either remotely or from local file system in Node
const spec = await loadSpec()

// Convert the spec into an array of operations
const operations = openApiOperations(spec)

console.log(
  operations
    .map(op => op.id)
    .sort()
    .join('\n')
)
```


### Options

```
Options {
  /**
   * The mode your tool will be operating in.
   *
   * Defaults to 'server'
   */
  mode: 'client'|'server'
  /**
   * Whether to include common top level spec information across all operations under the property `base`
   *
   * Defaults to false
   */
  includeBase: Boolean
}
```

#### mode

There are two perspectives when building OpenAPI tools, either
delivering services from the server or consuming services from a client.

When on the server an API will potentially `consume` and/or `produce`
specific formats of content.

On the client however these are inverted and more commonly known by the
terms `contentTypes` and `accepts`. These align with the HTTP request headers 
`Content-Type` (the content format you're sending to the server) and `Accept` 
(the content format(s) you expect the server to respond with).

To choose your perspective you can define a `mode`.

`mode === 'server'` // default

- operation.consumes
- operation.produces

`mode === 'client'`

- operation.contentTypes
- operation.accepts

#### includeBase

An OpenAPI spec contains a number of top level details such as an
`info` property with the spec title and description, or a
`securityDefinitions` object defining global security options. These
can be useful to access via an operation if you don't want pass around
them separately.

Setting `options.includeBase` will add a shared `base` object to all
operations which includes these top level properties.

## Operation

Each operation is a plain JavaScript object with the following properties.

```
Operation {
  id: String
  method: String
  summary: String?
  description: String?
  basePath: String
  path: String
  fullPath: String
  url: String
  tags: Array<String>
  deprecated: Boolean?
  pathExt: Object?
  ext: Object?
  parameters: Array<Parameter>
  responses: Array<Response>
  security: Array<Security>?
}

```

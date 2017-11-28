# @pnpm/local-resolver

> Resolver for local packages

<!--@shields('npm', 'travis')-->
[![npm version](https://img.shields.io/npm/v/@pnpm/local-resolver.svg)](https://www.npmjs.com/package/@pnpm/local-resolver) [![Build Status](https://img.shields.io/travis/pnpm/local-resolver/master.svg)](https://travis-ci.org/pnpm/local-resolver)
<!--/@-->

## Install

Install it via npm.

    npm install @pnpm/local-resolver

## Usage

```js
'use strict'
const resolveFromLocal = require('@pnpm/local-resolver').default

resolveFromLocal({pref: './example-package'}, {prefix: process.cwd()})
  .then(resolveResult => console.log(resolveResult))
//> { id: 'file:example-package',
//    normalizedPref: 'file:example-package',
//    package:
//     { name: 'foo',
//       version: '1.0.0',
//       readme: '# foo\n',
//       readmeFilename: 'README.md',
//       description: '',
//       _id: 'foo@1.0.0' },
//    resolution: { directory: 'example-package', type: 'directory' } }

```

## License

[MIT](./LICENSE) © [Zoltan Kochan](https://www.kochan.io/)

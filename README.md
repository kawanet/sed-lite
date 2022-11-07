# sed-lite

`sed` compiler for JavaScript

[![npm](https://img.shields.io/npm/v/sed-lite.svg)](https://www.npmjs.com/package/sed-lite)
[![Node.js CI](https://github.com/kawanet/sed-lite/workflows/Node.js%20CI/badge.svg?branch=master)](https://github.com/kawanet/sed-lite/actions/)
[![minified size](https://img.shields.io/bundlephobia/min/sed-lite)](https://cdn.jsdelivr.net/npm/sed-lite/dist/sed-lite.min.js)

## SYNOPSIS

```js
const {sed} = require("sed-lite");

const foo = sed("s/foo/FOO/"); // str => str.replace(/foo/, "FOO")

foo("Hello, foo!"); // Hello, FOO!

const bar = sed("s/<(\\/?h[1-6]+)>/[$1]/g"); // str => str.replace(/(\/?h[1-6]+)>/g, "[$1]")

bar("<h1>bar</h1>"); // [h1]bar[/h1]

const buz = sed("s#foo#bar#; s#bar#buz#"); // str => str.replace(/foo/, "bar").replace(/bar/, "buz")

buz("Hello, foo!"); // Hello, buz!
```

See TypeScript declaration
[sed-lite.d.ts](https://github.com/kawanet/sed-lite/blob/master/types/sed-lite.d.ts)
for more detail.

## LINKS

- https://github.com/kawanet/sed-lite
- https://www.npmjs.com/package/browserify-sed
- https://www.npmjs.com/package/express-sed
- https://www.npmjs.com/package/sed-lite

## LICENSE

The MIT License (MIT)

Copyright (c) 2020-2022 Yusuke Kawasaki

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

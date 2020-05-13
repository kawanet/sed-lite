# sed-lite

`sed` for JavaScript

[![npm version](https://badge.fury.io/js/sed-lite.svg)](https://www.npmjs.com/package/sed-lite)

## SYNOPSIS

```js
const sed = require("sed-lite").sed;

const foo = sed("s/foo/FOO/"); // str => str.replace(/foo/, "FOO")

foo("Hello, foo!"); // Hello, FOO!

const bar = sed("s/<(\\/?h[1-6]+)>/[$1]/g"); // str => str.replace(/(\/?h[1-6]+)>/g, "[$1]")

bar("<h1>bar</h1>"); // [h1]bar[/h1]

const buz = sed("s#foo#bar#; s#bar#buz#"); // str => str.replace(/foo/, "bar").replace(/bar/, "buz")

buz("Hello, foo!"); // Hello, buz!
```

## LICENSE

The MIT License (MIT)

Copyright (c) 2020 Yusuke Kawasaki

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

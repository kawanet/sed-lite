import {strict as assert} from "node:assert"
import {createRequire} from "node:module"
import {test} from "node:test"
import type * as declared from "sed-lite"
import * as m from "../lib/sed-lite.ts"

const require = createRequire(import.meta.url)

// tsc fails here when a name declared in the published .d.ts is missing
// from the runtime entry -- the surface check derives from the declarations.
const runtime: typeof declared = m
void runtime

test("import entry (.mjs)", () => {
    assert.equal(typeof m.sed, "function")
})

test("require entry (.cjs)", () => {
    const m = require("sed-lite")
    assert.equal(typeof m.sed, "function")
})

test("minified entry (.min.js)", () => {
    const cjs = require.resolve("sed-lite")
    const m = require(cjs.replace(/\.cjs$/, ".min.js"))
    assert.equal(typeof m.sed, "function")
})

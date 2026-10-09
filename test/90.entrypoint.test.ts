import {strict as assert} from "node:assert"
import {test} from "node:test"
import type * as declared from "sed-lite"
import * as m from "../lib/sed-lite.ts"

const isNodeJS = "undefined" !== typeof process && !!process?.versions?.node

const createRequire = async (path: string) => {
    const {createRequire} = await import("node:module")
    return createRequire(path)
}

const resolvePath = async (name: string, path: string) => {
    const require = await createRequire(import.meta.url)
    const {join, dirname} = await import("node:path")
    return join(dirname(require.resolve(name)), path)
}

// tsc fails here when a name declared in the published .d.ts is missing
// from the runtime entry -- the surface check derives from the declarations.
const runtime: typeof declared = m
void runtime

test("import entry (.mjs)", () => {
    // entries
    assert.equal(typeof m.sed, "function")
})

test("require entry (.cjs)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m: typeof declared = require("sed-lite")
    // entries
    assert.equal(typeof m.sed, "function")
})

test("minified entry (.min.js)", {skip: !isNodeJS}, async () => {
    const require = await createRequire(import.meta.url)
    const m: typeof declared = require(await resolvePath("sed-lite", "sed-lite.min.js"))
    // entries
    assert.equal(typeof m.sed, "function")
})

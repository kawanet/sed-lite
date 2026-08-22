import {strict as assert} from "node:assert"
import {createRequire} from "node:module"
import {test} from "node:test"

const require = createRequire(import.meta.url)

test("require entry (.cjs)", () => {
    const m = require("sed-lite")
    assert.equal(typeof m.sed, "function")
})

test("minified entry (.min.js)", () => {
    const cjs = require.resolve("sed-lite")
    const m = require(cjs.replace(/\.cjs$/, ".min.js"))
    assert.equal(typeof m.sed, "function")
})

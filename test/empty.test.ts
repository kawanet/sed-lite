import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {sed} from "../lib/sed-lite.ts"

const TITLE = "empty.test.ts"

describe(TITLE, () => {
    {
        const def = "# comment"
        it(def, () => {
            const replacer = sed(def)
            assert.equal(replacer, undefined)
        })
    }
})

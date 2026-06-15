import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {sed} from "sed-lite"

const TITLE = "error.test.ts"

describe(TITLE, () => {
    {
        const def = "# comment"
        it(def, () => {
            const replacer = sed(def)
            assert.equal(replacer, undefined)
        })
    }
})

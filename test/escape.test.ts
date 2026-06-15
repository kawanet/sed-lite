import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {sed} from "sed-lite"

const TITLE = "escape.test.ts"

describe(TITLE, () => {
    {
        const def = "s/X/\\r:\\n:\\t:\\\\:\\x41:\\u0061/"
        it(def, () => {
            const replacer = sed(def)
            assert.equal(replacer("[X]"), "[\r:\n:\t:\\:\x41:\u0061]")
        })
    }
    {
        const def = "s/(X)/$1:$2:$$/"
        it(def, () => {
            const replacer = sed(def)
            assert.equal(replacer("[X]"), "[X:$2:$]")
        })
    }
    {
        const def = "s/(X)/\\$1:\\x241:\\u00241/"
        it(def, () => {
            const replacer = sed(def)
            assert.equal(replacer("[X]"), "[X:X:X]")
        })
    }
})

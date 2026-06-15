import {strict as assert} from "node:assert"
import {describe, it} from "node:test"
import {sed} from "sed-lite"

const TITLE = "error.test.ts"

describe(TITLE, () => {
    {
        const def = "s/\\(/{(}/"
        it(def, () => {
            const replacer = sed(def)
            assert.equal(replacer("[(]"), "[{(}]")
        })
    }

    {
        const def = "s/(/{(}/"
        it(def, () => {
            assert.throws(() => sed(def))
        })
    }

    {
        const def = "s/foo/FOO/abcdefghijklmnopqrstuvwxyz"
        it(def, () => {
            assert.throws(() => sed(def))
        })
    }

    {
        const def = "s/"
        it(def, () => {
            assert.throws(() => sed(def))
        })
    }

    {
        // without ";" delimiter
        const def = "s/foo/bar/ s/bar/buz/"
        it(def, () => {
            assert.throws(() => sed(def))
        })
    }
})

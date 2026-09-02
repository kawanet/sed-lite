// Browser-side shim for `node:assert`. Aliased into the test bundle
// by the rollup test config. Tests source-import as
// `import {strict as assert} from "node:assert"`, so this file
// exports `strict` matching that surface.
//
// Coverage matches the subset of node:assert used by the test suite
// today (ok / equal / deepEqual / throws / doesNotThrow). Add new
// methods here as tests start using them rather than pulling in the
// whole node:assert polyfill, which would balloon the test bundle.

const isObject = (v: unknown): v is Record<PropertyKey, unknown> =>
    v !== null && typeof v === "object"

const deepEqual = (a: unknown, b: unknown): boolean => {
    if (Object.is(a, b)) return true
    if (!isObject(a) || !isObject(b)) return false
    if (Array.isArray(a) !== Array.isArray(b)) return false
    const ak = Reflect.ownKeys(a)
    const bk = Reflect.ownKeys(b)
    if (ak.length !== bk.length) return false
    for (const k of ak) {
        if (!Object.prototype.hasOwnProperty.call(b, k)) return false
        if (!deepEqual((a as Record<PropertyKey, unknown>)[k], (b as Record<PropertyKey, unknown>)[k])) return false
    }
    return true
}

export const strict = {
    // Truthy check. Mirrors `assert.ok(value, message?)` in node:assert.
    ok(value: unknown, message?: string): void {
        if (!value) {
            throw new Error(message || `expected truthy, got ${JSON.stringify(value)}`)
        }
    },

    // node:assert/strict-compatible `equal`. Uses `Object.is`
    // semantics, matching Node — so `equal(NaN, NaN)` passes and
    // `equal(0, -0)` fails, both opposite of `===`.
    equal(actual: unknown, expected: unknown, message?: string): void {
        if (!Object.is(actual, expected)) {
            throw new Error(message || `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        }
    },

    // Structural equality on plain values, arrays, and objects.
    // Uses `Object.is` at the leaves, matching strict mode. The
    // intent is to cover the test suite's actual usage; exotic
    // values (Map, Set, typed arrays) fall back to reference
    // equality and would need explicit handling if tests start
    // exercising them.
    deepEqual(actual: unknown, expected: unknown, message?: string): void {
        if (!deepEqual(actual, expected)) {
            throw new Error(message || `expected deep-equal ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
        }
    },

    // Verifies `block` throws. If `expected` is a RegExp the thrown
    // message must match it; if it is an Error subclass the thrown
    // value must be an instance of it. With no `expected` any throw
    // counts.
    throws(block: () => void, expected?: RegExp | (new (...args: unknown[]) => Error)): void {
        let thrown: unknown
        let didThrow = false
        try {
            block()
        } catch (e) {
            thrown = e
            didThrow = true
        }
        if (!didThrow) {
            throw new Error("expected to throw, did not")
        }
        if (expected instanceof RegExp) {
            const msg = thrown instanceof Error ? thrown.message : String(thrown)
            if (!expected.test(msg)) {
                throw new Error(`thrown message ${JSON.stringify(msg)} did not match ${expected}`)
            }
        } else if (typeof expected === "function") {
            if (!(thrown instanceof expected)) {
                throw new Error(`thrown is not an instance of ${expected.name}`)
            }
        }
    },

    // Inverse of `throws` — surfaces the actual error to ease
    // debugging instead of just reporting "did throw".
    doesNotThrow(block: () => void, message?: string): void {
        try {
            block()
        } catch (e) {
            const detail = e instanceof Error ? e.message : String(e)
            throw new Error(message ? `${message}: ${detail}` : `expected not to throw, got: ${detail}`)
        }
    },
}

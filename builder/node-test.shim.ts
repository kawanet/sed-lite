// Browser-side resolution target for `node:test`. Aliased into the
// test bundle by the rollup test config. Re-exports mocha BDD
// globals (`describe`, `before`, `after`) that mocha installs on
// `globalThis` after `mocha.setup` runs in tests.html. `it` is
// special-cased only when called as `it(name, {timeout: ms}, fn)`
// to bridge node:test's options-form to mocha's `this.timeout(ms)`.
// `.skip` is attached so conditional patterns like
// `(cond ? it : it.skip)(name, fn)` keep working in the browser.

type Body = () => unknown
type Suite = () => void
type Options = {timeout?: number}
type MochaThis = {timeout: (ms: number) => void}

type ItFn = (name: string, fn: (this: MochaThis) => unknown) => void

const g = globalThis as unknown as {
    describe: (name: string, fn: Suite) => void
    it: ItFn & {skip: ItFn}
    before: (fn: Body) => void
    after: (fn: Body) => void
}

export const {describe, before, after} = g

type ItOverload = ((name: string, fn: Body) => void) & ((name: string, opts: Options, fn: Body) => void)

const wrapIt = (itFn: ItFn): ItOverload => (...args: [string, Body] | [string, Options, Body]): void => {
    if (args.length === 3) {
        const [name, opts, fn] = args
        itFn(name, function (this: MochaThis) {
            if (opts && "number" === typeof opts.timeout) {
                this.timeout(opts.timeout)
            }
            return fn()
        })
        return
    }
    itFn(...args)
}

export const it = wrapIt(g.it) as ItOverload & {skip: ItOverload}
it.skip = wrapIt(g.it.skip)

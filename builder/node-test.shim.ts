// Browser-side resolution target for `node:test`. Aliased into the
// test bundle by the rollup test config. Re-exports mocha BDD
// globals (`describe`, `before`, `after`) that mocha installs on
// `globalThis` after `mocha.setup('bdd')` runs in tests.html. `it`
// is wrapped to bridge node:test's `it(name, options, fn)` form to
// mocha's 2-arg `it(name, fn)`, applying `options.timeout` via
// mocha's `this.timeout(ms)`.

type Body = () => unknown;
type Suite = () => void;
type Options = {timeout?: number};
type MochaThis = {timeout?: (ms: number) => void};

const g = globalThis as unknown as {
    describe: (name: string, fn: Suite) => void;
    it: (name: string, fn: (this: MochaThis) => unknown) => void;
    before: (fn: Body) => void;
    after: (fn: Body) => void;
};

export const {describe, before, after} = g;

export const it = (name: string, ...rest: [Body] | [Options, Body]): void => {
    if (rest.length === 1) {
        g.it(name, rest[0]);
    } else {
        const [opts, fn] = rest;
        g.it(name, function (this: MochaThis) {
            if (opts.timeout && typeof this.timeout === "function") this.timeout(opts.timeout);
            return fn();
        });
    }
};

// Browser-side resolution target for `node:test`. Aliased into the
// test bundle by the rollup test config. Re-exports mocha BDD
// globals (`describe`, `before`, `after`) that mocha installs on
// `globalThis` after `mocha.setup` runs in tests.html. `it` is
// special-cased only when called as `it(name, {timeout: ms}, fn)`
// to bridge node:test's options-form to mocha's `this.timeout(ms)`.

type Body = () => unknown;
type Suite = () => void;
type Options = {timeout?: number};
type MochaThis = {timeout: (ms: number) => void};

const g = globalThis as unknown as {
    describe: (name: string, fn: Suite) => void;
    it: (name: string, fn: (this: MochaThis) => unknown) => void;
    before: (fn: Body) => void;
    after: (fn: Body) => void;
};

export const {describe, before, after} = g;

export const it = (...args: [string, Body] | [string, Options, Body]): void => {
    if (args.length === 3 && typeof args[1].timeout === "number") {
        const [name, opts, fn] = args;
        g.it(name, function (this: MochaThis) {
            this.timeout(opts.timeout!);
            return fn();
        });
        return;
    }
    g.it(...(args as [string, (this: MochaThis) => unknown]));
};

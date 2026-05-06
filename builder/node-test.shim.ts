// Browser-side shim for `node:test`. Aliased into the test bundle by
// the rollup test config so the test sources can import the same
// names (`describe`, `it`, `before`, `after`) under both Node (real
// node:test) and the browser (this file).
//
// Canonical: https://gist.github.com/kawanet/5130469aa49b613fb68c8e6781a2ed46
//
// Test results are rendered into `<ul id="results">` on the host
// page (the element is created on demand if absent).
//
// Lifecycle: registration is pure metadata collection. After the
// last sync `it()` / `before()` / `after()` / `describe()` call, a
// `queueMicrotask` trigger drains the buckets in order:
//   1. all `before()` hooks
//   2. all `it()` tests (sequential — real-timer suites would race
//      otherwise)
//   3. all `after()` hooks
// This matches `node:test`'s "hooks bracket the suite" semantics
// regardless of where in source order `before()` / `after()` is
// declared.
//
// Known limitations (intentional, kept simple):
//   - Per-describe hook isolation is not modelled — nested scopes
//     share the buckets.
//   - Per-file isolation is not modelled either. When the test
//     sources are concatenated by @rollup/plugin-multi-entry,
//     every file's hooks and tests land in the same global bucket.
//     A failing top-level `before()` therefore skips tests across
//     all files, not only the file that declared it.
//   - `options.timeout` rejects the awaited race on the test side
//     but cannot cancel the underlying Promise (JavaScript has no
//     cancellation primitive). A timed-out async test may still
//     settle later and mutate state that subsequent tests observe.
//     Real isolation would require AbortController participation
//     from inside the test body.

const stack: string[] = [];

const root = (): HTMLElement => {
    let el = document.getElementById("results");
    if (!el) {
        el = document.createElement("ul");
        el.id = "results";
        document.body.appendChild(el);
    }
    return el;
};

// Color name → ANSI SGR code for the Node output path.
const ANSI_BY_COLOR: Record<string, string> = {
    green: "\x1b[32m",
    red: "\x1b[31m",
    darkorange: "\x1b[33m",
};
const ANSI_RESET = "\x1b[0m";
const ANSI_DIM = "\x1b[2m";

const append = (text: string, color: string, suffix?: string): void => {
    if (typeof document !== "undefined" && typeof window !== "undefined") {
        const li = document.createElement("li");
        li.textContent = text;
        li.style.color = color;
        if (suffix) {
            const span = document.createElement("span");
            span.textContent = " " + suffix;
            span.style.color = "gray";
            li.appendChild(span);
        }
        root().appendChild(li);
    } else {
        const c = ANSI_BY_COLOR[color] || "";
        const r = c ? ANSI_RESET : "";
        const tail = suffix ? ` ${ANSI_DIM}${suffix}${ANSI_RESET}` : "";
        console.log(`${c}${text}${r}${tail}`);
        if (color === "red" || color === "darkorange") {
            process.exitCode = 1;
        }
    }
};

type Body = () => unknown;
type Options = Record<string, unknown>;
type TestEntry = {label: string; fn: Body; timeout: number};

const befores: Body[] = [];
const afters: Body[] = [];
const tests: TestEntry[] = [];

let scheduled = false;
const schedule = (): void => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(run);
};

const ms = (start: number): string => `(${Math.round(performance.now() - start)}ms)`;

// Race the test body against an `options.timeout` timer (real
// node:test honors this; here it keeps a hung browser test from
// blocking everything that follows). `Promise.resolve().then(fn)`
// converts a sync throw into a rejection so it falls through the
// same await as an async failure.
const runWithTimeout = async (fn: Body, timeout: number): Promise<void> => {
    const work = Promise.resolve().then(fn);
    if (!timeout) {
        await work;
        return;
    }
    let timer!: ReturnType<typeof setTimeout>;
    try {
        await Promise.race([
            work,
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error(`timed out after ${timeout}ms`)), timeout);
            }),
        ]);
    } finally {
        clearTimeout(timer);
    }
};

const runTest = async (test: TestEntry): Promise<void> => {
    const start = performance.now();
    try {
        await runWithTimeout(test.fn, test.timeout);
        append("✔ " + test.label, "green", ms(start));
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ " + test.label + ": " + msg, "red", ms(start));
    }
};

const runHook = async (label: string, fn: Body): Promise<boolean> => {
    try {
        await fn();
        return true;
    } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        append("✘ " + label + ": " + msg, "red");
        return false;
    }
};

// Drain: before-hooks → tests (or ⚠ skip rows when any before-hook
// failed) → after-hooks. `tests` / `scheduled` reset at end so the
// next registration cycle gets a fresh drain; `befores` / `afters`
// persist across drains.
const run = async (): Promise<void> => {
    let setupFailed = false;
    for (const fn of befores) {
        if (!(await runHook("before()", fn))) setupFailed = true;
    }
    for (const test of tests) {
        if (setupFailed) {
            append("⚠ " + test.label + ": skipped (before() failed)", "darkorange");
        } else {
            await runTest(test);
        }
    }
    for (const fn of afters) await runHook("after()", fn);
    tests.length = 0;
    scheduled = false;
};

export const describe = (name: string, fn: () => void): void => {
    stack.push(name);
    try {
        fn();
    } catch (e) {
        // A synchronous throw inside `describe()` is registration-time
        // damage — without this guard it would propagate out of the
        // bundle's IIFE and skip every later test. Convert it into a
        // synthetic failed test that replays the throw at run time so
        // the standard ✘ runner output still shows it.
        const label = [...stack].join(" › ") + " (registration)";
        tests.push({label, fn: () => { throw e; }, timeout: 0});
    } finally {
        stack.pop();
    }
    schedule();
};

// Accepts both `it(name, fn)` and `it(name, options, fn)`. When the
// optional second argument carries `{timeout: ms}` the test is
// race-cancelled at that ms — other options are ignored.
export const it = (name: string, ...rest: [Body] | [Options, Body]): void => {
    const fn = rest[rest.length - 1] as Body;
    const opts = (rest.length > 1 ? rest[0] : {}) as Options;
    const timeout = typeof opts.timeout === "number" ? opts.timeout : 0;
    const label = [...stack, name].join(" › ");
    tests.push({label, fn, timeout});
    schedule();
};

export const before = (fn: Body): void => {
    befores.push(fn);
    schedule();
};

export const after = (fn: Body): void => {
    afters.push(fn);
    schedule();
};

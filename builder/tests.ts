// Node-side test entry for `make test-shim` (parallels
// `browser/tests.html`). Aliases `node:test` / `node:assert` to the
// local shims, then awaits each test file from argv.

import {registerHooks} from "node:module";
import {dirname, resolve as resolvePath} from "node:path";
import {fileURLToPath, pathToFileURL} from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const projectRoot = pathToFileURL(resolvePath(here, "..") + "/").href;
const ALIAS: Record<string, string> = {
    "node:test": resolvePath(here, "node-test.shim.ts"),
    "node:assert": resolvePath(here, "node-assert.shim.ts"),
};

registerHooks({
    resolve(specifier, context, nextResolve) {
        const target = ALIAS[specifier];
        const parent = context?.parentURL;
        // Alias only for project sources; deps under node_modules
        // resolve to real node:test / node:assert.
        if (target && parent && parent.startsWith(projectRoot) && !parent.includes("/node_modules/")) {
            return nextResolve(pathToFileURL(target).href, context);
        }
        return nextResolve(specifier, context);
    },
});

for (const f of process.argv.slice(2)) {
    await import(pathToFileURL(resolvePath(process.cwd(), f)).href);
}

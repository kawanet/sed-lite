import alias from "@rollup/plugin-alias"
import multiEntry from "@rollup/plugin-multi-entry"
import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

// Bundles the test suites for browser/tests.html: Node builtins become
// shims, and the package name resolves to the global left behind by
// dist/*.min.js, so the browser exercises the shipped bundle.
const rollupConfig: RollupOptions = {
    // 90.entrypoint tests require() the shipped files; Node-only, no browser
    // shim, so the negative pattern keeps them out of the browser bundle.
    input: ["../test/*.test.ts", "!../test/90.*"],

    // Bare specifiers stay external; only relative paths are bundled.
    external: /^[^.\/]+$/,

    output: {
        file: "../browser/tests/bundled.mjs",
        format: "esm",
    },

    treeshake: false,

    plugins: [
        alias({
            entries: [
                {find: /^(\.\.\/)+lib\/sed-lite\.ts$/, replacement: "sed-lite"},
            ],
        }),

        multiEntry(),

        nodeResolve({
            browser: true,
            preferBuiltins: false,
        }),

        sucrase({
            disableESTransforms: true,
            exclude: ["node_modules/**"],
            transforms: ["typescript"],
        }),

        showFiles(),
    ],
}

export default rollupConfig

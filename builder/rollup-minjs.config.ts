import nodeResolve from "@rollup/plugin-node-resolve"
import sucrase from "@rollup/plugin-sucrase"
import terser from "@rollup/plugin-terser"
import type {RollupOptions} from "rollup"
import {showFiles} from "./show-files.ts"

const rollupConfig: RollupOptions = {
    input: "../lib/sed-lite.ts",

    output: {
        file: "../dist/sed-lite.min.js",
        format: "iife",
        name: "sed",
        exports: "named",
        // The IIFE's auto-`return exports;` would yield
        // `var sed = {sed: <fn>}` (a namespace global). Override with an
        // early `return exports.sed;` so the global is `var sed = <fn>`
        // (callable directly, matching the long-standing browser API).
        // Rollup's auto-return becomes unreachable and terser drops it.
        outro: "return exports.sed;",
        // Make the bundle dual-purpose: as a browser <script>, the
        // global `sed` is the function (set above by the IIFE); when
        // require()-d from CJS (e.g. by browserify-sed), this footer
        // also writes `exports.sed = sed` so consumers can reach the
        // function via `require(...).sed` — the same named-export shape
        // dist/sed-lite.cjs publishes. The gate is on `typeof exports`
        // for consistency with the body that writes to `exports`.
        //
        // `footer` (not `outro`) is used so the line lands AFTER the
        // IIFE assigns its return value to the outer `var sed`.
        footer: "if (typeof exports !== 'undefined') { exports.sed = sed; }",
    },

    plugins: [
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

        terser({
            compress: true,
            ecma: 2020,
            mangle: true,
        }),
    ],
}

export default rollupConfig

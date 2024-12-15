const commonjs = require("@rollup/plugin-commonjs");
const multiEntry = require("@rollup/plugin-multi-entry");
const nodeResolve = require("@rollup/plugin-node-resolve");

module.exports = {
    input: "../build/es5/test/*.js",
    output: {
        file: "../build/test.browser.js",
        format: "iife",
        globals: id => (/\/sed-lite.js$/.test(id) ? "{sed: sed}" : id),
    },
    external: id => (id === "assert" || id === "sed-lite" || /\/sed-lite.js$/.test(id)),
    plugins: [
        commonjs(),
        multiEntry(),
        nodeResolve()
    ]
};

#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {sed} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    it("leading space", () => {
        const replacer = sed("\ts/foo/FOO/;\n");
        assert.equal(replacer("[foo][fooo]"), "[FOO][fooo]");
    });

    it("comment", () => {
        const replacer = sed("s/foo/FOO/ # comment");
        assert.equal(replacer("[foo][fooo]"), "[FOO][fooo]");
    });

    it("multiple sed", () => {
        const def = `s/foo/bar/g;s/bar/buz/`;
        const replacer = sed(def);
        assert.equal(replacer("[foo][fooo]"), "[buz][baro]");
    });

    it("multiple semi-colons", () => {
        const def = `s/foo/bar/g;;;;s/bar/buz/`;
        const replacer = sed(def);
        assert.equal(replacer("[foo][fooo]"), "[buz][baro]");
    });

    it("multiple lines", () => {
        const def = `
s/foo/bar/g;
s/bar/buz/;
`;
        const replacer = sed(def);
        assert.equal(replacer("[foo][fooo]"), "[buz][baro]");
    });

    it("multiple lines with comments", () => {
        const def = `
    # comments 1
    s/foo/bar/g;
    # comments 2
    # comments 3
    s/bar/buz/;
    # comments 4
`;
        const replacer = sed(def);
        assert.equal(replacer("[foo][fooo]"), "[buz][baro]");
    });
});

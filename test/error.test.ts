#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {sed} from "../";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    {
        const def = "s/\\(/{(}/";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[(]"), "[{(}]");
        });
    }

    {
        const def = "s/(/{(}/";
        it(def, () => {
            assert.throws(() => sed(def));
        });
    }

    {
        const def = "s/foo/FOO/abcdefghijklmnopqrstuvwxyz";
        it(def, () => {
            assert.throws(() => sed(def));
        });
    }

    {
        const def = "s/";
        it(def, () => {
            assert.throws(() => sed(def));
        });
    }

    {
        // without ";" delimiter
        const def = "s/foo/bar/ s/bar/buz/";
        it(def, () => {
            assert.throws(() => sed(def));
        });
    }
});

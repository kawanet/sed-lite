#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {sed} from "../lib/sed-lite";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    {
        const def = "s/X/\\r:\\n:\\t:\\\\:\\x41:\\u0061/";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[X]"), "[\r:\n:\t:\\:\x41:\u0061]");
        });
    }
});

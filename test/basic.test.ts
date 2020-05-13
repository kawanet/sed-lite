#!/usr/bin/env mocha -R spec

import {strict as assert} from "assert";
import {sed} from "../lib/sed-lite";

const TITLE = __filename.split("/").pop();

describe(TITLE, () => {
    {
        const def = "s/foo/FOO/";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo][fooo]"), "[FOO][fooo]");
        });
    }

    {
        const def = "s/foo/FOO/g";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo][fooo]"), "[FOO][FOOo]");
        });
    }

    {
        const def = "s/fo+/FO+/g";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo][fooo]"), "[FO+][FO+]");
        });
    }

    {
        const def = "s/f(o+)/{F$1}/g";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo][fooo]"), "[{Foo}][{Fooo}]");
        });
    }

    {
        const def = "s/(f)(o+)/{$1:$2}/g";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo][fooo]"), "[{f:oo}][{f:ooo}]");
        });
    }

    {
        const def = "s/fo+\\/(fo+)/{FOO=$1}/";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo/fooo]"), "[{FOO=fooo}]");
        });
    }

    {
        const def = "s#fo+/(fo+)#{FOO=$1}#";
        it(def, () => {
            const replacer = sed(def);
            assert.equal(replacer("[foo/fooo]"), "[{FOO=fooo}]");
        });
    }
});

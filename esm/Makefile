#!/usr/bin/env bash -c make

JS_TEST=../build/esm/test/*.js

all: sed-lite.mjs

test: all ../build/test.mjs
	../node_modules/.bin/mocha -R spec ../build/test.mjs

sed-lite.mjs: ../build/esm/lib/sed-lite.js
	cp $< $@

../build/test.mjs: $(JS_TEST) Makefile
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup $(JS_TEST) --format esm \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-multi-entry \
	--plugin @rollup/plugin-node-resolve \
	--external 'assert,../lib/sed-lite.js' |\
	perl -pe 's#^(import \{ ?sed ?\} from .).*(.;)#$$1../esm/sed-lite.mjs$$2#' > $@

../build/esm/%.js: ../%.ts
	../node_modules/.bin/tsc -p .

clean:
	/bin/rm -fr ../build

.PHONY: all clean test

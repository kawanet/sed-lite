#!/usr/bin/env bash -c make

JS_TEST=../build/es5/test/*.js

all: dist test

dist: ../dist/sed-lite.min.js

../dist/sed-lite.min.js: ../build/sed-lite.browser.js
	mkdir -p ../dist
	../node_modules/.bin/terser -c -m --ecma 5 -o $@ $<

../build/sed-lite.browser.js: ../build/es5/lib/sed-lite.js
	echo 'var sed = (function(exports) {' > $@
	cat $< >> $@
	echo 'return sed;})("undefined" !== typeof exports ? exports : {})' >> $@
	perl -i -pe 's#^("use strict"|Object.defineProperty|exports.*= void 0)#// $$&#' $@

test: dist ../build/test.browser.js ../build/assert.browser.js

../build/test.browser.js: $(JS_TEST) Makefile
	../node_modules/.bin/rollup -c rollup.config.js

../build/es5/%.js: ../%.ts
	../node_modules/.bin/tsc -p ../browser

../build/assert.browser.js: ../node_modules/assert/assert.js Makefile
	../node_modules/.bin/rollup $< --file $@ --format iife --name assert \
	--plugin @rollup/plugin-commonjs \
	--plugin @rollup/plugin-node-resolve='{"browser":true, "preferBuiltins":false}'

clean:
	/bin/rm -fr ../build ../dist/*.js ../lib/*.js ../test/*.js

.PHONY: all clean test

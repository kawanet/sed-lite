#!/usr/bin/env bash -c make

all: dist test

dist: ../dist/sed-lite.min.js

../dist/sed-lite.min.js: ../build/bundle.js
	mkdir -p ../dist
	../node_modules/.bin/terser -c -m --ecma 5 -o $@ $<

../build/bundle.js: ../build/lib/sed-lite.js
	echo 'var sed = (function(exports) {' > $@
	cat $< >> $@
	echo 'return sed;})("undefined" !== typeof exports ? exports : {})' >> $@
	perl -i -pe 's#^("use strict"|Object.defineProperty|exports.*= void 0)#// $$&#' $@

test: dist ../build/test.js

../build/test.js: ../build/lib/sed-lite.js ../browser/import.js
	perl -i -pe 's#require\("../"\)#require("../../browser/import")#' ../build/test/*.js
	../node_modules/.bin/browserify -o ../build/test.js ../build/test/*.js

../build/lib/sed-lite.js: ../lib/*.ts ../test/*.ts
	../node_modules/.bin/tsc -p ../browser

clean:
	/bin/rm -fr ../build ../dist/*.js ../lib/*.js ../test/*.js

.PHONY: all clean test

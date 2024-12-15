#!/usr/bin/env bash -c make

all: lib/sed-lite.js
	make -C browser $@
	make -C esm $@

clean:
	/bin/rm -fr ../build
	make -C browser $@
	make -C esm $@

test: all
	./node_modules/.bin/mocha -R spec test/*.test.js
	make -C esm $@

%.js: %.ts
	tsc -p .

.PHONY: all clean test

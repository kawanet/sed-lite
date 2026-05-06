# Force bash so `set -o pipefail` works in the smoke-minjs recipe below.
SHELL := bash
.SHELLFLAGS := -eo pipefail -c

SRC   := $(wildcard ../lib/*.ts)
TYPES := $(wildcard ../types/*.d.ts)
BUILDER_SRC := $(wildcard ./*.ts)
TEST_SRC := $(wildcard ../test/*.ts)
BROWSER_SRC := $(wildcard ../browser/*.js)

MJS_DST   := ../dist/sed-lite.mjs
CJS_DST   := ../dist/sed-lite.cjs
MINJS_DST := ../dist/sed-lite.min.js
PKG_DST   := ../dist/package.json
TEST_DST  := ../browser/tests/bundled.js

MJS_CONFIG   := ./rollup-mjs.config.ts
CJS_CONFIG   := ./rollup-cjs.config.ts
MINJS_CONFIG := ./rollup-minjs.config.ts
TEST_CONFIG  := ./rollup-test.config.ts

# Bundle is small: this package is a single source file with no production
# dependencies. Node builtins are external for cjs/mjs; the browser bundle
# inlines everything (which here is just the source). Anything noticeably
# larger means an accidental bundling of a Node built-in or a transitive
# dep — fail the build so it cannot slip in.
MAX_BYTES := 5000

# The browser test bundle inlines the test sources and the small
# node:test / node:assert shims. The sed-lite source itself is
# externalized through `browser/import.js` and supplied at runtime by
# `dist/sed-lite.min.js` (loaded ahead of the bundle by browser/tests.html),
# so this cap covers test code + shim wiring only. ~15 KB today,
# capped well above for headroom as more tests are added.
TEST_MAX_BYTES := 50000

# Documented named exports that must be verified in every bundle.
NAMED_EXPORTS := sed

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(PKG_DST) $(TEST_DST)

####

# Build all artifacts.
all: $(ALL)

$(MJS_DST): $(MJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

$(CJS_DST): $(CJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

$(MINJS_DST): $(MINJS_CONFIG) $(SRC) $(BUILDER_SRC)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(MAX_BYTES) || { echo "ERROR: $@ exceeds $(MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

# dist/package.json marks the dist/ scope as CommonJS so that
# `dist/sed-lite.min.js` (which is a CJS-compatible IIFE bundle, see
# rollup-minjs.config.ts) is not interpreted as ESM by Node when
# require()-d from a parent project that has set "type": "module".
# The .cjs / .mjs siblings have unambiguous extensions so they are
# unaffected.
$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

# Browser test bundle. Inlines the test sources and the small shims
# (node:test / node:assert), all aliased in via rollup-test.config.ts.
# The package itself is *not* inlined — `sed-lite` resolves to
# `browser/import.js`, a 2-line CJS bridge that re-exports the IIFE
# global set by `dist/sed-lite.min.js` at runtime. Loaded by
# `browser/tests.html`, which side-loads `dist/sed-lite.min.js` first.
# Hence the dependency on $(MINJS_DST): without it, opening the test
# page after a clean of just the test bundle would 404 on min.js.
$(TEST_DST): $(TEST_CONFIG) $(SRC) $(BUILDER_SRC) $(TEST_SRC) $(BROWSER_SRC) $(MINJS_DST)
	@mkdir -p $(dir $@)
	../node_modules/.bin/rollup -c $<
	@test "$$(wc -c < $@)" -le $(TEST_MAX_BYTES) || { echo "ERROR: $@ exceeds $(TEST_MAX_BYTES) byte cap" >&2; exit 1; }
	@ls -l $@
	@echo ""

# Verify the bundles by importing/requiring the package itself.
# This ensures the public entrypoints (exports/main) are correctly configured.
# Note: process.argv.slice(1) is used because `node -e 'code' arg1 arg2`
# results in process.argv = ['node', 'arg1', 'arg2'].
smoke: smoke-mjs smoke-cjs smoke-minjs

# MJS smoke test via public entrypoint.
smoke-mjs: all
	cd .. && node --input-type=module -e 'const m = await import("sed-lite"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

# CJS smoke test via public entrypoint.
smoke-cjs: all
	cd .. && node --input-type=commonjs -e 'const m = require("sed-lite"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

# Minified browser bundle smoke covers two consumer paths:
#
# (1) Browser shape: pipe the IIFE bundle plus a verification tail into
#     `node -`, then look up each named export via direct eval(k). The
#     bundle's top-level `var sed = ...` is in scope for eval(). argv
#     layout is [node, '-', name1, name2, ...] when stdin is the script,
#     hence slice(2) (asymmetric with smoke-mjs / smoke-cjs which use
#     slice(1)).
#
# (2) CJS shape: require() the same .min.js file. The bundle's footer
#     assigns `exports.sed = sed`, so consumers can pull the named
#     export the same way they would from dist/sed-lite.cjs. Verifies
#     the dist/package.json `{"type":"commonjs"}` override also takes
#     effect (Node would otherwise treat .js under a `type: module`
#     parent as ESM and fail).
smoke-minjs: $(MINJS_DST) $(PKG_DST)
	(cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof eval(k) !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/sed-lite.min.js"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing minjs CJS export:", k); process.exit(1); } console.log("minjs CJS export OK:", k); }' $(NAMED_EXPORTS)

####

# Build, run smoke tests, and conditionally run full tests (tsc and node:test).
test: all smoke $(TYPES)
	@node -v | grep -qv "^v20" || echo "Node 20 detected: skipping full tests."
	@ [ "$$npm_command" != "install" ] || echo "npm install detected: skipping full tests."
	@node -v | grep -q "^v20" || [ "$$npm_command" = "install" ] || $(MAKE) test-ts

test-ts:
	../node_modules/.bin/tsc --noEmit
	cd .. && node --test test/*.test.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test smoke smoke-mjs smoke-cjs smoke-minjs test-ts

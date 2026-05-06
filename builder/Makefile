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

# Cap for the browser test bundle, which inlines the test sources
# plus the node:test / node:assert shims. The package source itself
# is externalized through browser/import.js so it does not count.
TEST_MAX_BYTES := 50000

# Documented named exports that must be verified in every bundle.
NAMED_EXPORTS := sed

ALL := $(MJS_DST) $(CJS_DST) $(MINJS_DST) $(PKG_DST) $(TEST_DST)

# Build/test paths require Node's native TypeScript type-strip (default on
# Node 22.18+). Older runtimes (e.g. Node 20) report BUILDABLE=NO and can
# still verify pre-built bundles via `make smoke`.
BUILDABLE := $(shell node -e 'console.log(process.features.typescript ? "YES" : "NO")')

####

# Build all artifacts.
all: is-buildable $(ALL)

# Gate that fails loudly when type-strip is unavailable; consumed by `all`
# and by `npm prepack` to refuse packaging on a non-buildable runtime.
is-buildable:
	@ [ "$(BUILDABLE)" = "YES" ]

# Inverse gate used by `npm prepare` to short-circuit on a non-buildable
# runtime so consumer install on Node 20 silently skips build/test.
is-not-buildable:
	@ [ "$(BUILDABLE)" = "NO" ]

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

# Mark dist/ as CommonJS so the IIFE .min.js is not parsed as ESM
# when require()-d from a parent project that sets "type": "module".
# .cjs / .mjs siblings have unambiguous extensions and are unaffected.
$(PKG_DST):
	@mkdir -p $(dir $@)
	echo '{"type":"commonjs"}' > $@
	@ls -l $@
	@echo ""

# Browser test bundle. Inlines test sources + node:test/assert shims;
# the package itself resolves to browser/import.js, a CJS bridge to
# the IIFE global set by $(MINJS_DST) at runtime. browser/tests.html
# side-loads $(MINJS_DST) first — hence the dep below.
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
smoke-mjs: $(MJS_DST)
	cd .. && node --input-type=module -e 'const m = await import("sed-lite"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing MJS export:", k); process.exit(1); } console.log("MJS export OK:", k); }' $(NAMED_EXPORTS)

# CJS smoke test via public entrypoint.
smoke-cjs: $(CJS_DST)
	cd .. && node --input-type=commonjs -e 'const m = require("sed-lite"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing CJS export:", k); process.exit(1); } console.log("CJS export OK:", k); }' $(NAMED_EXPORTS)

# Smoke the .min.js in two consumer shapes:
#  (1) browser IIFE: verify the named exports are exposed as globals
#      after the bundle is evaluated in a script context.
#  (2) CJS require(): verify the same .min.js is also usable as a
#      CommonJS module (the bundle is intentionally dual-use).
smoke-minjs: $(MINJS_DST) $(PKG_DST)
	(cat $< && echo '; for (const k of process.argv.slice(2)) { if (typeof eval(k) !== "function") { console.error("missing browser export:", k); process.exit(1); } console.log("browser export OK:", k); }') | node - $(NAMED_EXPORTS)
	cd .. && node --input-type=commonjs -e 'const m = require("./dist/sed-lite.min.js"); for (const k of process.argv.slice(1)) { if (typeof m[k] !== "function") { console.error("missing minjs CJS export:", k); process.exit(1); } console.log("minjs CJS export OK:", k); }' $(NAMED_EXPORTS)

####

# Build, run smoke tests, and conditionally run full tests (tsc and node:test).
test: all smoke $(TYPES)
	@ [ "$$npm_command" != "install" ] || echo "npm install detected: skipping full tests."
	@ [ "$$npm_command" = "install" ] || $(MAKE) test-ts

test-ts:
	../node_modules/.bin/tsc --noEmit
	cd .. && node --test test/*.test.ts

clean:
	/bin/rm -fr $(ALL)

.PHONY: all clean test smoke smoke-mjs smoke-cjs smoke-minjs test-ts is-buildable is-not-buildable

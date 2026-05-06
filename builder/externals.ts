import {builtinModules} from "node:module"

// `dependencies` and Node builtins are resolved at runtime by the
// consumer — never bundle them. Cover both bare and `node:` prefixed
// forms so the result does not depend on which form a source uses.
// Includes the package's own name so its self-reference stays external.
const externals = new Set<string>([
    ...builtinModules,
    ...builtinModules.map(m => `node:${m}`),
    "sed-lite",
])

export const isExternal = (id: string): boolean => externals.has(id)

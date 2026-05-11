// Node module-resolution hook: translates the project's '@/...' import alias
// (used throughout src/ via tsconfig.json paths) into a real path under src/.
// Registered via `register()` in scripts that need to import directly from
// src/ — see scripts/recompute-scores.mjs.

import { resolve as pathResolve } from 'node:path'
import { existsSync, statSync } from 'node:fs'
import { pathToFileURL } from 'node:url'

const root = process.cwd()
const EXTS = ['', '.ts', '.tsx', '.mts', '.js', '.mjs']

function tryResolve(base) {
  for (const ext of EXTS) {
    const p = base + ext
    if (existsSync(p) && statSync(p).isFile()) return p
  }
  for (const ext of EXTS) {
    const p = base + '/index' + ext
    if (existsSync(p) && statSync(p).isFile()) return p
  }
  return null
}

export function resolve(specifier, context, nextResolve) {
  // src/types/index.ts is type-only; Node's type-stripping leaves no runtime
  // exports. Redirect value-imports of '@/types' to a placeholder shim.
  if (specifier === '@/types') {
    return nextResolve(pathToFileURL(pathResolve(root, 'scripts/lib/types-shim.mjs')).href, context)
  }
  if (specifier.startsWith('@/')) {
    const candidate = tryResolve(pathResolve(root, 'src', specifier.slice(2)))
    if (candidate) return nextResolve(candidate, context)
  }
  return nextResolve(specifier, context)
}

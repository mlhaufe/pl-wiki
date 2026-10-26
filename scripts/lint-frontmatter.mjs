/**
 * Frontmatter lint for content/languages/*.md — the build-time drift control
 * for the fact contract (docs/knowledgebase-plan.md §5, control 7).
 *
 * Checks per file:
 *  - required fields present (name)
 *  - field set matches content.config.ts (new keys can't sneak in)
 *  - enum fields (kind/status/typing) and vocab axes (paradigms, type_system,
 *    memory, execution, concurrency) hold recognized values
 *  - structural shape: array fields are lists, enum/string fields are scalars,
 *    year is a 4-digit integer
 *  - influences/influenced resolve against the corpus names (warning only:
 *    relations may reference an entry that doesn't exist yet)
 *
 * `--fix` normalizes only what can be safely derived: case/hyphen variants
 * that match a known vocabulary value ("Declarative" -> "declarative",
 * near-misses within edit distance 2), sorts vocab axis arrays
 * deterministically, and rewrites frontmatter in canonical field order.
 * Unrecognized values remain errors — add the value to app/utils/taxonomy.ts
 * if intentional, then re-run.
 *
 * Vocabularies and the schema field list are parsed from the TS sources at
 * runtime (no TS runtime needed) so taxonomy.ts stays the single source.
 *
 * Usage: node scripts/lint-frontmatter.mjs [--fix]
 * Exit: 0 when no errors remain, 1 otherwise (either mode).
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')
const TAXONOMY_TS = join(ROOT, 'app', 'utils', 'taxonomy.ts')
const CONTENT_TS = join(ROOT, 'content.config.ts')

// ---------------------------------------------------------------------------
// Load vocabularies + schema field list from the TS sources (no TS runtime).

function loadVocabFromTs(tsPath) {
  const src = readFileSync(tsPath, 'utf8')
  // strip // comments first: an apostrophe inside one (e.g. "language's")
  // otherwise corrupts the single-quote value extraction below. Vocab values
  // in this file never contain "//", so line-comment stripping is safe.
  const stripped = src.replace(/\/\/[^\n]*/g, '')
  const vocab = {}
  for (const m of stripped.matchAll(/export const ([A-Z_]+) = \[([^\]]*)\] as const/gs)) {
    vocab[m[1]] = [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1])
  }
  return vocab
}

function loadSchemaFields(tsPath) {
  const src = readFileSync(tsPath, 'utf8')
  const body = src.match(/schema: z\.object\(\{([\s\S]*?)\n      \}\)/)?.[1] ?? ''
  return [...body.matchAll(/^\s{8}(\w+):/gm)].map(m => m[1])
}

const VOCAB = loadVocabFromTs(TAXONOMY_TS)
if (!VOCAB.PARADIGMS) {
  console.error('lint-frontmatter: failed to parse app/utils/taxonomy.ts')
  process.exit(1)
}

// lint field -> vocabulary constant
const AXIS_VOCAB = {
  kind: 'KINDS',
  status: 'STATUSES',
  typing: 'TYPING',
  paradigms: 'PARADIGMS',
  type_system: 'TYPE_SYSTEM',
  memory: 'MEMORY',
  execution: 'EXECUTION',
  concurrency: 'CONCURRENCY'
}

const ARRAY_FIELDS = new Set([
  'urls', 'paradigms', 'type_system', 'memory', 'execution',
  'concurrency', 'features', 'influences', 'influenced'
])
const ENUM_FIELDS = new Set(['kind', 'status', 'typing'])
const STRING_FIELDS = new Set(['name', 'homepage', 'logo', 'author', 'note'])
const KNOWN_FIELDS = new Set(loadSchemaFields(CONTENT_TS))
if (!KNOWN_FIELDS.has('name')) {
  console.error('lint-frontmatter: failed to parse schema fields from content.config.ts')
  process.exit(1)
}

// canonical frontmatter field order (schema order; stable diffs)
const FIELD_ORDER = [
  'title', 'name', 'homepage', 'urls', 'references', 'logo', 'author',
  'kind', 'status', 'year', 'paradigms',
  'typing', 'type_system', 'memory', 'execution', 'concurrency', 'features',
  'influences', 'influenced', 'relations', 'note'
]

// ---------------------------------------------------------------------------
// Minimal frontmatter parser. Files use simple YAML: quoted scalars and
// 2-space-indented quoted string lists. Deliberately not a YAML impl —
// malformed shapes surface as lint errors instead of parse magic.

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: null, body: text }
  const data = {}
  let currentKey = null
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const listItem = line.match(/^ {2}- "?([^"]*)"?$/)
    const kv = line.match(/^(\w+):(?: "?([^"[]*)"?|\s*\[\s*\])?$/)
    if (listItem && listItem[1] === '' && line.match(/^ {4}-(\s|$)/) === null) {
      // fallthrough guard: nested object list items handled below
    }
    if (currentKey === 'relations' && line.match(/^ {2}- /)) {
      // start of a { name, kind } edge: `- name: "X"`
      const start = line.match(/^ {2}- name: "?([^"]*)"?$/)
      if (start) {
        data.relations ??= []
        data.relations.push({ name: start[1] })
      }
      continue
    }
    if (currentKey === 'references' && line.match(/^ {2}- url: "?([^"]*)"?$/)) {
      // start of a { url, title } reference
      data.references ??= []
      data.references.push({ url: line.match(/^ {2}- url: "?([^"]*)"?$/)[1] })
      continue
    }
    const refTitleLine = line.match(/^ {4}title: "?([^"]*)"?$/)
    if (refTitleLine && Array.isArray(data.references) && data.references.length) {
      const last = data.references[data.references.length - 1]
      if (last && last.title === undefined) last.title = refTitleLine[1]
      continue
    }
    if (listItem && currentKey && Array.isArray(data[currentKey])) {
      data[currentKey].push(listItem[1])
      continue
    }
    const kindLine = line.match(/^ {4}kind: "?([^"]*)"?$/)
    if (kindLine && Array.isArray(data.relations) && data.relations.length) {
      const last = data.relations[data.relations.length - 1]
      if (last && last.kind === undefined) last.kind = kindLine[1]
      continue
    }
    if (kv) {
      currentKey = kv[1]
      // `key:` -> []; `key: "v"` / `key: v` / `key: []` -> scalar string
      data[kv[1]] = kv[2] !== undefined ? kv[2] : []
    }
  }
  return { data, body: text.slice(m[0].length) }
}

function serializeFrontmatter(data, body) {
  const lines = ['---']
  for (const key of FIELD_ORDER) {
    const value = data[key]
    if (value === undefined) continue
    if (key === 'relations') {
      if (!Array.isArray(value) || value.length === 0) continue
      lines.push(`${key}:`)
      for (const edge of value) {
        lines.push(`  - name: "${edge.name}"`, `    kind: "${edge.kind}"`)
      }
    } else if (key === 'references') {
      if (!Array.isArray(value) || value.length === 0) continue
      lines.push(`${key}:`)
      for (const ref of value) {
        lines.push(`  - url: "${ref.url}"`, `    title: "${ref.title}"`)
      }
    } else if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${key}:`, ...value.map(v => `  - "${v}"`))
    } else if (key === 'year') {
      // unquoted so the Zod schema receives a number (z.number()), not text
      lines.push(`${key}: ${value}`)
    } else if (value !== '') {
      lines.push(`${key}: "${value}"`)
    }
  }
  lines.push('---', '')
  return `${lines.join('\n')}${body.replace(/^\r?\n/, '')}`
}

// ---------------------------------------------------------------------------
// Canonicalization suggestions

function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => Array(b.length + 1).fill(0))
  for (let i = 0; i <= a.length; i++) dp[i][0] = i
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      )
  return dp[a.length][b.length]
}

function canonicalize(value, candidates) {
  if (candidates.includes(value)) return value
  const fold = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '')
  const norm = fold(value)
  const byFold = candidates.find(c => fold(c) === norm)
  if (byFold) return byFold
  const lower = value.toLowerCase()
  let best = null
  let bestD = Infinity
  for (const c of candidates) {
    const d = levenshtein(lower, c)
    if (d < bestD) { bestD = d; best = c }
  }
  return bestD <= 2 ? best : null
}

// ---------------------------------------------------------------------------
// Collect corpus names for cross-link integrity

const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
const parsed = new Map() // file -> parsed frontmatter + body
const names = new Set()
// corpus-level duplicate detection: mirrors the unique DB index on `name`
// (a duplicate name fails the dev-server DB build with a raw SQLite error)
const nameToFiles = new Map()

for (const f of files) {
  const { data, body } = parseFrontmatter(readFileSync(join(LANG_DIR, f), 'utf8'))
  if (data?.name) {
    names.add(data.name)
    if (!nameToFiles.has(data.name)) nameToFiles.set(data.name, [])
    nameToFiles.get(data.name).push(f)
  }
  parsed.set(f, { data, body })
}

// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------

const fix = process.argv.includes('--fix')
let errors = 0
let warnings = 0
const rewritten = []

for (const f of files) {
  const { data, body } = parsed.get(f)
  const rel = `content/languages/${f}`
  if (!data) { console.error(`${rel}: missing frontmatter block`); errors++; continue }

  for (const key of Object.keys(data)) {
    if (!KNOWN_FIELDS.has(key) && key !== 'title') {
      console.error(`${rel}: unknown field "${key}"`)
      errors++
    }
  }
  if (!data.name) { console.error(`${rel}: missing required field "name"`); errors++ }

  // display names are ASCII-only (docs/knowledgebase-plan.md contract):
  // non-ASCII names break slug derivation and URL/SEO portability
  for (const key of ['name', 'title']) {
    const value = data[key]
    if (typeof value === 'string' && /[^\x00-\x7F]/.test(value)) {
      console.error(`${rel}: "${key}" must be ASCII-only (found non-ASCII in "${value}")`)
      errors++
    }
  }

  for (const [key, value] of Object.entries(data)) {
    if (key === 'title') continue
    if (ARRAY_FIELDS.has(key) && !Array.isArray(value) && value !== '') {
      console.error(`${rel}: "${key}" must be a list`)
      errors++
    } else if ((ENUM_FIELDS.has(key) || STRING_FIELDS.has(key)) && Array.isArray(value)) {
      console.error(`${rel}: "${key}" must be a scalar`)
      errors++
    } else if (key === 'year' && value !== '' && value !== undefined && !/^\d{4}$/.test(String(value))) {
      console.error(`${rel}: "year" must be a 4-digit integer`)
      errors++
    }
  }

  // references are MANDATORY (docs/knowledgebase-plan.md: sourced facts):
  // curated (prose-bearing) entries must carry titled references; TODO stubs
  // warn only, so legacy stubs don't hard-fail until curated
  const proseBody = body.trim() && !/^TODO: Write the wiki article for \*\*.+\*\*\./.test(body.trim())
  if (!Array.isArray(data.references) || data.references.length === 0) {
    if (proseBody) {
      console.error(`${rel}: missing required "references" (curated entries must cite sources)`)
      errors++
    } else {
      console.warn(`${rel}: no "references" yet (required once curated)`)
      warnings++
    }
  } else {
    for (const ref of data.references) {
      if (!ref || typeof ref !== 'object' || !ref.url || !ref.title) {
        console.error(`${rel}: references entries must be { url, title } objects`)
        errors++
        continue
      }
      // primary-sources rule: Wikipedia (and other aggregators) may guide
      // research but never serve as a citation; lint flags these hosts.
      // web.archive.org IS allowed (it serves a copy of the primary page).
      try {
        const host = new URL(ref.url).hostname.replace(/^www\./, '')
        if (/(^|\.)wikipedia\.org$|(^|\.)wikimedia\.org$|(^|\.)wikibooks\.org$|(^|\.)wikidata\.org$/.test(host)) {
          console.error(`${rel}: references must cite primary sources — "${host}" is an aggregator; cite the page it led you to instead`)
          errors++
        }
      } catch { /* malformed URL: not our check */ }
    }
  }

  for (const [field, vocabName] of Object.entries(AXIS_VOCAB)) {
    const value = data[field]
    if (value === undefined || value === '') continue
    const candidates = VOCAB[vocabName]
    const items = Array.isArray(value) ? value : [value]
    const next = []
    let changed = false
    for (const item of items) {
      const canon = canonicalize(item, candidates)
      if (canon === item) { next.push(item); continue }
      if (canon) {
        console.warn(`${rel}: "${field}: ${item}" -> "${canon}"${fix ? ' (fixed)' : ''}`)
        warnings++
        changed = true
        next.push(canon)
      } else {
        console.error(
          `${rel}: unknown ${field} value "${item}" ` +
          `— add it to ${vocabName} in app/utils/taxonomy.ts if intentional`
        )
        errors++
        next.push(item)
      }
    }
    if (changed) data[field] = next
    if (fix && Array.isArray(data[field])) data[field].sort()
  }

  // typed relation edges: { name, kind } pairs
  if (Array.isArray(data.relations)) {
    const relKinds = VOCAB.RELATION_KINDS ?? []
    for (const edge of data.relations) {
      if (!edge || typeof edge !== 'object' || !edge.name) {
        console.error(`${rel}: relations entries must be { name, kind } objects`); errors++
        continue
      }
      if (!relKinds.includes(edge.kind)) {
        console.error(`${rel}: unknown relation kind "${edge.kind}" for "${edge.name}" — add it to RELATION_KINDS in app/utils/taxonomy.ts if intentional`)
        errors++
      }
      if (!names.has(edge.name)) {
        console.warn(`${rel}: "relations: ${edge.name}" does not match any language name`)
        warnings++
      }
    }
  }

  for (const field of ['influences', 'influenced']) {
    if (!Array.isArray(data[field])) continue
    for (const name of data[field]) {
      if (!names.has(name)) {
        console.warn(`${rel}: "${field}: ${name}" does not match any language name`)
        warnings++
      }
    }
  }

  if (fix) {
    const rebuilt = serializeFrontmatter(data, body)
    const original = readFileSync(join(LANG_DIR, f), 'utf8')
    if (rebuilt !== original) {
      writeFileSync(join(LANG_DIR, f), rebuilt)
      rewritten.push(f)
    }
  }
}

if (fix) console.log(`\nrewrote ${rewritten.length} file(s)${rewritten.length ? `: ${rewritten.join(', ')}` : ''}`)

// corpus-level duplicate names (mirrors the unique DB index; raw SQLite
// UNIQUE failures in the dev server are worse than a lint error)
for (const [name, dupFiles] of [...nameToFiles].sort()) {
  if (dupFiles.length > 1) {
    console.error(`duplicate name "${name}" in: ${dupFiles.join(', ')} — disambiguate (e.g. author-qualify)`)
    errors++
  }
}

console.log(`\n${files.length} files, ${errors} error(s), ${warnings} warning(s)${fix ? ' (fix mode)' : ''}`)
if (errors > 0) {
  console.error('frontmatter lint FAILED')
  process.exit(1)
}
console.log('frontmatter lint OK')
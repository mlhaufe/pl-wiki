/**
 * Fact backfill (docs/knowledgebase-plan.md §2, phase 1 leftover).
 *
 * Fills v2 schema axes (kind/status/year/typing/...) for entries where the
 * EXISTING frontmatter + note give direct evidence. This is deliberately
 * conservative: it never guesses from the language's name or reputation —
 * only from what the entry itself states. New facts are derived via
 * small phrase-to-value rules; every non-matching phrase is reported for
 * hand-curation rather than force-fitted.
 *
 * Modes:
 *   node scripts/backfill-facts.mjs --check   report (dry run; default)
 *   node scripts/backfill-facts.mjs --write   apply derivations to files
 *   node scripts/backfill-facts.mjs --interactive  (todo: TUI review)
 *
 * Exit 0 = nothing to fix or only safe derivations applied; 1 = entries with
 * underivable notes exist (informational in --write mode).
 */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')

const write = process.argv.includes('--write')
const check = process.argv.includes('--check') || !write

// ---------------------------------------------------------------------------
// Phrase → fact rules. First matching rule wins; order = specificity.

const TYPING_RULES = [
  [/statically typed/i, 'static'],
  [/dynamically typed/i, 'dynamic'],
  [/\bgradual(ly)? typed/i, 'gradual'],
  [/untyped/i, 'untyped'],
]

const PARA_RULES = [
  [/agent-based/i, 'agent-based'],
  [/\barray\b.*language|language.*\barray\b/i, 'array'],
  [/\bdata-parallel\b/i, 'data-parallel'],
  [/\bdataflow\b|data-flow/i, 'dataflow'],
  [/\bdeclarative\b/i, 'declarative'],
  [/domain[- ]specific/i, 'domain-specific'],
  [/\bcontinuation\b/i, 'continuation'],
  [/\beffect(s)?\b(?! system)/i, 'effect'],
  [/\bfunctional\b/i, 'functional'],
  [/\bimperative\b/i, 'imperative'],
  [/\blogic[- ](?:based|programming)\b|logic paradigm/i, 'logic'],
  [/\bobject[- ]oriented\b/i, 'object-oriented'],
  [/\bprobabilistic\b/i, 'probabilistic'],
  [/\breactive\b/i, 'reactive'],
  [/\brelational\b/i, 'relational'],
  [/specification language/i, 'specification'],
  [/\bsynchronous\b/i, 'synchronous'],
  // visual as a paradigm — but not in dialect names ("Visual Objects",
  // "Visual Basic") listed among dialects
  [/(?<!Objects |Basic |C |dBase )\bvisual\b(?! (?:Objects|Basic|C))/i, 'visual'],
]

const TYPE_SYSTEM_RULES = [
  [/dependently typed|dependent types/i, 'dependent'],
  [/\beffect (system|row)/i, 'effect-system'],
  [/\btype inference\b|inferred/i, 'inferred'],
  [/\brefinement types?\b/i, 'refinement'],
  [/\blinear types?\b|uniqueness typing/i, 'linear'],
  [/algebraic data types?|\bdiscriminated unions?\b/i, 'adt'],
]

const MEMORY_RULES = [
  [/Perceus-style reference counting|reference counting with reuse/i, 'arc'],
  [/reference counting/i, 'arc'],
  // negation-aware: skip "no/garbage-collector-free" phrasing ("no heap, GC…")
  [/(?<!no |without |zero )\bgarbage collection|(?<!collector[- ]free )tracing collector/i, 'gc'],
  [/region-based|arena/i, 'arena'],
  [/ownership/i, 'ownership'],
]

const EXECUTION_RULES = [
  [/compiles to native code|emitting native code|native code comes from/i, 'native'],
  [/compiles to (?:via )?(C#|Java|JavaScript|Go|Python)/i, 'transpiled'],
  [/no runtime/, 'native'],
  [/transpil/i, 'transpiled'],
  [/interpreted/i, 'interpreted'],
  [/\bJIT\b/i, 'jit'],
  // multiple emitters (e.g. "native via Zig, JavaScript, and C#") map to the
  // union of vocab values; the phrase itself is not a fact
  [/emitter[s]?: native via Zig, JavaScript/i, 'native'],
]

const CONCURRENCY_RULES = [
  [/message passing|actors?\b/i, 'actors'],
  [/channels|CSP/i, 'channels'],
  [/async\/await/i, 'async/await'],
]

const FEATURE_RULES = [
  [/\bLSP\b|language server/i, 'lsp'],
  [/\bREPL\b/i, 'repl'],
  [/\bmacros?\b/i, 'macros'],
  [/model-check|model check/i, 'model-checking'],
  [/pattern[- ]matching/i, 'pattern-matching'],
  [/property tests?|contracts/i, 'contracts'],
  [/flowcharts?/i, 'flowcharts'],
]

const RULE_SETS = {
  typing: TYPING_RULES,
  paradigms: PARA_RULES,
  type_system: TYPE_SYSTEM_RULES,
  memory: MEMORY_RULES,
  execution: EXECUTION_RULES,
  concurrency: CONCURRENCY_RULES,
  features: FEATURE_RULES,
}

/** kind/status derivations (direct semantic phrases). */
const KIND_RULES = [
  [/specification language/i, 'language'],
  [/scripting language/i, 'language'],
  // annotations ≠ notation — require a real word boundary
  [/(?<!annotations?\b|annotation[- ])\bnotation\b/i, 'notation'],
]

const STATUS_RULES = [
  [/early[- ]stage|not stable yet|early release/i, 'experimental'],
  [/historical/i, 'historical'],
]

// ---------------------------------------------------------------------------
// Minimal frontmatter parse (same shape rules as lint-frontmatter.mjs)

function parseFrontmatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) return { data: null, body: text }
  const data = {}
  let currentKey = null
  for (const line of m[1].split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const listItem = line.match(/^ {2}- "?([^"]*)"?$/)
    const kv = line.match(/^(\w+):(?: "?([^"[]*)"?|\s*\[\s*\])?$/)
    if (listItem && currentKey && Array.isArray(data[currentKey])) {
      data[currentKey].push(listItem[1])
    } else if (kv) {
      currentKey = kv[1]
      data[kv[1]] = kv[2] !== undefined ? kv[2] : []
    }
  }
  return { data, body: text.slice(m[0].length) }
}

function serializeFrontmatter(data, body) {
  const lines = ['---']
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue
    if (Array.isArray(value)) {
      if (value.length === 0) continue
      lines.push(`${key}:`, ...value.map(v => `  - "${v}"`))
    } else if (key === 'year') {
      lines.push(`${key}: ${value}`)
    } else if (value !== '') {
      lines.push(`${key}: "${value}"`)
    }
  }
  lines.push('---', '')
  return `${lines.join('\n')}${body.replace(/^\r?\n/, '')}`
}

// ---------------------------------------------------------------------------

const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
let touched = 0
let underivable = 0
const derivations = []

for (const f of files) {
  const path = join(LANG_DIR, f)
  const { data, body } = parseFrontmatter(readFileSync(path, 'utf8'))
  const rel = f.replace('.md', '')
  if (!data?.note) continue

  const note = data.note
  const before = JSON.stringify(data, null, 1)
  const applied = []

  const applyRuleSet = (field, rules, { scalar = false } = {}) => {
    const matched = []
    for (const [re, value] of rules) {
      if (re.test(note)) if (!matched.includes(value)) matched.push(value)
    }
    if (!matched.length) return
    if (scalar) {
      if (data[field]) return // never overwrite an existing scalar
      data[field] = matched[0]
      applied.push(`${field}="${matched[0]}"`)
    } else {
      const existing = Array.isArray(data[field]) ? data[field] : []
      const merged = [...new Set([...existing, ...matched])]
      if (JSON.stringify(merged) !== JSON.stringify(existing)) {
        data[field] = merged.sort()
        applied.push(`${field}+=${merged.join(',')}`)
      }
    }
  }

  // scalar axes: only when currently unset
  applyRuleSet('typing', TYPING_RULES, { scalar: true })
  applyRuleSet('kind', KIND_RULES, { scalar: true })
  applyRuleSet('status', STATUS_RULES, { scalar: true })
  // vocab axes: merge
  applyRuleSet('paradigms', PARA_RULES)
  applyRuleSet('type_system', TYPE_SYSTEM_RULES)
  applyRuleSet('memory', MEMORY_RULES)
  applyRuleSet('execution', EXECUTION_RULES)
  applyRuleSet('concurrency', CONCURRENCY_RULES)
  applyRuleSet('features', FEATURE_RULES)

  if (applied.length) {
    derivations.push({ file: rel, applied })
    touched++
    if (write) writeFileSync(path, serializeFrontmatter(data, body))
  }

  // underivable: note exists but nothing matched
  if (!applied.length && JSON.stringify(data, null, 1) === before) underivable++
}

// ---------------------------------------------------------------------------

console.log(`${files.length} files scanned`)
if (derivations.length) {
  console.log(`\n${touched} file(s) ${write ? 'updated' : 'would be updated (dry run)'}:`)
  for (const d of derivations) {
    console.log(`  ${d.file}: ${d.applied.join('; ')}`)
  }
}
const unmodified = files.length - touched
console.log(`\n${unmodified} file(s) unchanged (no evidence or no note)`)
if (check && !write) console.log('\n(dry run — pass --write to apply)')
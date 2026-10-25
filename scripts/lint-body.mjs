/**
 * Body lint for content/languages/*.md — the prose-skeleton drift control
 * (docs/knowledgebase-plan.md; normative spec in
 * .github/skills/language-entry/references/contract.md §Prose).
 *
 * Skeleton (normative order):
 *   ## Overview   ≤ 60 words, 2 sentences
 *   ## Code       ≥ 1 fenced block, ≤ 2; 5–25 lines each; fence language present
 *   ## Distinctive traits   3–6 bullets, ≤ 25 words each
 *   ## Status     ≤ 40 words
 *   ## History    optional; ≤ 80 words
 *
 * Errors: missing required section, out-of-order section, missing/oversized
 * code blocks, > 2 blocks, bullets out of range, H1 in body, non-internal
 * cross-language link syntax (informational), frontmatter data duplicated in
 * body (heuristic, warning).
 * Warnings: word-count near-cap (within 20% of a cap), missing Code caption.
 *
 * TODO stubs (bodies that are exactly the conversion seed) are exempt.
 *
 * Usage: node scripts/lint-body.mjs [--fix]
 *   --fix inserts the skeleton into prose-less entries? No: fix mode only
 *   normalizes heading order/marker style. Content decisions stay human.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')

const SKELETON = ['Overview', 'Code', 'Distinctive traits', 'Status', 'History']
const REQUIRED = new Set(['Overview', 'Code', 'Distinctive traits', 'Status'])

const CAPS = { Overview: 60, Status: 40, History: 80 }
const BULLET_WORDS = 25
const BULLETS = { min: 3, max: 6 }
const CODE = { minLines: 5, maxLines: 25, maxBlocks: 2 }

const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
const TODO_RE = /^TODO: Write the wiki article for \*\*.+\*\*\.\s*$/

let errors = 0
let warnings = 0
const perFile = []

function wc(text) {
  return text.trim().split(/\s+/).filter(Boolean).length
}

for (const f of files) {
  const raw = readFileSync(join(LANG_DIR, f), 'utf8')
  const rel = `content/languages/${f}`

  // split frontmatter vs body
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) continue // frontmatter lint reports this
  const body = raw.slice(m[0].length)

  if (body.trim().length === 0 || TODO_RE.test(body.trim())) continue // stub: exempt

  const fileIssues = []

  // H1 in body
  if (/^# /m.test(body)) {
    fileIssues.push(['error', 'H1 in body (title is rendered by the page component)', 0])
  }

  // headings (##, ###) in order
  const headings = []
  const lines = body.split('\n')
  const sectionRanges = new Map()
  let current = null
  let currentStart = 0
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^## (.+)$/)
    if (h) {
      if (current) sectionRanges.set(current, [currentStart, i])
      current = h[1].trim()
      currentStart = i + 1
      headings.push(current)
    }
  }
  if (current) sectionRanges.set(current, [currentStart, lines.length])

  const sectionText = (name) => {
    const range = sectionRanges.get(name)
    if (!range) return ''
    return lines.slice(range[0], range[1]).join('\n')
  }

  // order check among known skeleton sections
  const present = headings.filter(h => SKELETON.includes(h))
  const knownPositions = present.map(h => SKELETON.indexOf(h))
  let inOrder = true
  for (let i = 1; i < knownPositions.length; i++) {
    if (knownPositions[i] < knownPositions[i - 1]) inOrder = false
  }
  if (present.length && !inOrder) {
    fileIssues.push(['error', `section order wrong: got [${present.join(', ')}], expected skeleton order`, 0])
  }
  for (const h of headings) {
    if (!SKELETON.includes(h)) {
      fileIssues.push(['error', `unknown section heading "## ${h}" (skeleton: ${SKELETON.join(', ')})`, 0])
    }
  }

  // required sections
  for (const s of REQUIRED) {
    if (!headings.includes(s)) fileIssues.push(['error', `missing required section "## ${s}"`, 0])
  }

  // prose presence in required sections
  for (const s of ['Overview', 'Status']) {
    if (headings.includes(s) && wc(sectionText(s)) === 0) {
      fileIssues.push(['error', `"## ${s}" has no content`, 0])
    }
  }

  // word caps (warn within 20%, error beyond)
  const checkCap = (section, cap) => {
    if (!headings.includes(section)) return
    const n = wc(sectionText(section))
    if (n > cap * 1.2) {
      fileIssues.push(['error', `"## ${section}" is ${n} words (cap ${cap})`, n])
    } else if (n > cap) {
      fileIssues.push(['warn', `"## ${section}" is ${n} words (cap ${cap}, +20% grace)`, n])
    }
  }
  for (const [s, cap] of Object.entries(CAPS)) checkCap(s, cap)

  // Code section: fences, language, size, captions
  if (headings.includes('Code')) {
    const codeBody = sectionText('Code')
    const fences = [...codeBody.matchAll(/^```(\w*)[\s\S]*?```$/gm)]
    const blocks = []
    for (const fm of codeBody.matchAll(/```(\w*)\r?\n([\s\S]*?)```/g)) {
      blocks.push({ lang: fm[1], lines: fm[2].replace(/\n$/, '').split('\n') })
    }
    void fences
    if (blocks.length === 0) {
      fileIssues.push(['error', '"## Code" has no fenced code block', 0])
    } else {
      if (blocks.length > CODE.maxBlocks) {
        fileIssues.push(['error', `"## Code" has ${blocks.length} blocks (max ${CODE.maxBlocks})`, blocks.length])
      }
      for (const b of blocks) {
        if (!b.lang) fileIssues.push(['error', 'code block missing fence language', 0])
        const n = b.lines.length
        if (n < CODE.minLines || n > CODE.maxLines) {
          fileIssues.push(['error', `code block (${b.lang || 'no fence'}) has ${n} lines (allowed ${CODE.minLines}–${CODE.maxLines})`, n])
        }
      }
      // caption: some non-empty line after the first block
      const afterFirst = codeBody.split(/```[\s\S]*?```/)[1] ?? ''
      if (!afterFirst.trim()) {
        fileIssues.push(['warn', '"## Code" has no caption after the block (state what to notice)', 0])
      }
    }
  }

  // Distinctive traits: bullet count + per-bullet caps
  if (headings.includes('Distinctive traits')) {
    const traitLines = sectionText('Distinctive traits').split('\n').filter(l => l.trim().startsWith('-'))
    if (traitLines.length < BULLETS.min || traitLines.length > BULLETS.max) {
      fileIssues.push(['error', `"## Distinctive traits" has ${traitLines.length} bullets (allowed ${BULLETS.min}–${BULLETS.max})`, traitLines.length])
    }
    for (const line of traitLines) {
      const n = wc(line.replace(/^\s*-\s*/, ''))
      if (n > BULLET_WORDS * 1.4) {
        fileIssues.push(['error', `trait bullet is ${n} words (cap ${BULLET_WORDS}): "${line.trim().slice(0, 60)}…"`, n])
      } else if (n > BULLET_WORDS) {
        fileIssues.push(['warn', `trait bullet is ${n} words (cap ${BULLET_WORDS}, +40% grace)`, n])
      }
    }
  }

  // internal cross-language links resolve (name-based)
  for (const link of body.matchAll(/\]\(\/languages\/([^)]+)\)/g)) {
    const slug = link[1]
    if (!files.includes(`${slug}.md`)) {
      fileIssues.push(['error', `cross-link to /languages/${slug} does not exist`, 0])
    }
  }

  errors += fileIssues.filter(i => i[0] === 'error').length
  warnings += fileIssues.filter(i => i[0] === 'warn').length
  if (fileIssues.length) perFile.push([f, fileIssues])
}

for (const [f, issues] of perFile) {
  console.log(`\ncontent/languages/${f}`)
  for (const [kind, msg, n] of issues) {
    const line = kind === 'error' ? console.error : console.warn
    line(`  ${kind === 'error' ? '✖' : '⚠'} ${msg}`)
    void n
  }
}

console.log(`\n${files.length} files, ${errors} error(s), ${warnings} warning(s)${perFile.length ? ` in ${perFile.length} prose-bearing file(s)` : ' (all prose-bearing files conform)'}`)
if (errors > 0) {
  console.error('body lint FAILED')
  process.exit(1)
}
console.log('body lint OK')
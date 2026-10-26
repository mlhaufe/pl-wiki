// Recovery: 28 files lost their frontmatter during the tourize/repair passes
// (a bad index splice dropped lines 0..si). Restore each file's frontmatter
// + note-rendered body prefix from git HEAD, keeping the newly written body.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const LANG_DIR = join(ROOT, 'content', 'languages')
const files = readdirSync(LANG_DIR).filter(f => f.endsWith('.md')).sort()
const fixed = []

for (const f of files) {
  const raw = readFileSync(join(LANG_DIR, f), 'utf8')
  if (raw.startsWith('---\n')) continue // intact
  // git HEAD version has the full frontmatter; extract its frontmatter block
  let head
  try {
    head = execSync(`git show HEAD:content/languages/${f}`, { cwd: ROOT, encoding: 'utf8' })
  } catch {
    console.error(`no git HEAD for ${f}, skipping`)
    continue
  }
  const hm = head.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!hm) {
    console.error(`no frontmatter in HEAD for ${f}, skipping`)
    continue
  }
  const fm = hm[0]
  writeFileSync(join(LANG_DIR, f), `${fm}${raw}`, 'utf8')
  fixed.push(f)
}
console.log(fixed.length ? `restored frontmatter for:\n${fixed.map(x => '  ' + x).join('\n')}` : 'nothing to restore')
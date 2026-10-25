# Contract Reference (language entries)

> Normative for `content/languages/*.md`. Schema source: `content.config.ts`.
> Vocabulary source: `app/utils/taxonomy.ts`. Enforced by:
> `scripts/lint-frontmatter.mjs` + `scripts/lint-body.mjs`.

## Frontmatter field table

| field | type | rules |
|---|---|---|
| `title` | string | mirrors `name` (native SEO field) |
| `name` | string | **required**; ASCII-only; unique corpus-wide |
| `homepage` | string | official site only |
| `urls` | string[] | bulk references (untitled) |
| `references` | `{url, title}[]` | **mandatory** — the entry's citations; ≥ 1 per entry (homepage counts as one reference; homepage is rendered as "Official site" first). Titled, sourced, primary-preferred. |
| `logo` | string | `/logos/<file>` under `public/` |
| `author` | string | designers/organization verbatim |
| `kind` | enum | `language` \| `family` \| `dialect` \| `notation` |
| `status` | enum | `active` \| `experimental` \| `dormant` \| `historical` |
| `year` | number | first public release; **unquoted** in frontmatter |
| `paradigms` | vocab string[] | `PARADIGMS` |
| `typing` | enum | `untyped` \| `dynamic` \| `static` \| `gradual` |
| `type_system` | vocab string[] | `TYPE_SYSTEM` |
| `memory` | vocab string[] | `MEMORY` |
| `execution` | vocab string[] | `EXECUTION` |
| `concurrency` | vocab string[] | `CONCURRENCY` |
| `features` | string[] | free-form; lowercase-kebab convention |
| `influences` / `influenced` | string[] | names must match corpus `name`s |
| `relations` | `{name, kind}[]` | kind from `RELATION_KINDS`; directional (subject = this entry) |
| `note` | string | ≤ 40 words; rendered on cards + fact sheet |

Serialization rules: field order above = canonical (`lint --fix` rewrites);
scalars in double quotes except `year`, which is unquoted (Zod `z.number()`
receives a number only when YAML has an unquoted scalar); empty arrays are
omitted; 2-space list indentation. `references` follows the two-line-per-item
form (`- url:` / `  title:`) — the lint canonicalizes it.

**References rule (mandatory, lint-enforced):** every entry cites ≥ 1 source
via `references`. TODO stubs get a warning only (legacy corpus grandfathered
until curated); any prose-bearing entry without references FAILS the
frontmatter lint. Derive one reference per distinct source family used
(official site, spec/manual, Wikipedia corroboration, papers). The homepage
URL is auto-rendered as "Official site" — include it in `references` only
with a *different, real* title or omit it.

**Primary-sources rule (lint-enforced):** `references` must point at primary
material — official site, spec/manual/reference, project repo, vendor docs,
standards-body documents, peer-reviewed papers, archived copies of any of
those (web.archive.org). **Wikipedia and other wikis/aggregators are
excluded as citations** (lint errors on `wikipedia.org`, `wikimedia.org`,
`wikibooks.org`, `wikidata.org`): use them during research to discover the
primary material, then cite the primary page itself.

## Prose skeleton (normative order)

```mdc
## Overview
(≤ 60 words; exactly 2 sentences: what it is; why it exists / its niche)

## Code
(≥ 1 fenced block, ≤ 2 total; 5–25 lines each; fence = real language id;
 first line after each block = caption: what to notice)

## Distinctive traits
(3–6 bullets, ≤ 25 words each: claim + consequence)

## Status
(≤ 40 words: maturity, implementations, standards, license, home)

<!-- optional -->
## History
(≤ 80 words; only when history is load-bearing — e.g. Buran/SCADE)
```

Rules:
- Sections appear in this order; absent sections are omitted entirely (no
  empty headers).
- The body carries **no structured data**: no tables of facts, no fact lists
  that belong in frontmatter. Rendering a fact in prose duplicates it —
  prefer linking the chip ("static typing" in traits, data in schema).
- Cross-language mentions link internally: `[Rust](/languages/rust)`. Only
  for languages that exist in the corpus (name = their exact `name`).
- No H1 (`#`) — the page component renders the title. First H2 starts the
  skeleton.
- Marketing adjectives only with attribution ("described as…"); superlatives
  out.
- Code examples: idiomatic, minimal, and *true to the language's documented
  syntax*. If syntax confidence < certain, caption must say "paraphrased"
  and the closing summary must flag it.

## Word-count rationale (fixed caps, not vibes)

Caps keep prose a *reading layer* over the schema rather than a competing
encyclopedia article. They are deliberately tight because the frontmatter
already answers who/when/what; prose answers *why it is interesting* and
*what it looks like*. Entries exceeding a cap by a small amount warn; by a
large amount error.

## Worked example (conforming shape)

```mdc
---
title: "Esterel"
name: "Esterel"
homepage: "http://www-sop.inria.fr/meije/esterel/esterel-eng.html"
kind: "language"
...
---

## Overview
Esterel is a synchronous imperative language for reactive systems. It
replaces physical time with logical instants, making concurrency
deterministic and programs verifiable.

## Code
 esterel sketch — signal/await/preemption shape
```esterel
signal S;
loop
  await S;
  emit O;
end loop
```
Caption: one logical instant per tick; `await S` suspends to the next tick
carrying S.

## Distinctive traits
- Multiform time: instants, not seconds — deterministic by construction.
- Broadcast signals: instantaneous communication within a tick.
- Compiles to C or RTL (VHDL/Verilog) — software and hardware targets.

## Status
Industrialized in the SCADE suite for safety-critical avionics; standardized
attempt (IEEE P1778) dissolved 2011. Open-source Columbia Esterel Compiler
and a Racket implementation exist.
```
# Programming Language Wiki

A wiki of programming languages: resources, influences and paradigms.

Built with [Nuxt 4](https://nuxt.com), [Nuxt UI](https://ui.nuxt.com) and
[Nuxt Content](https://content.nuxt.com). Deployed as a static site on GitHub
Pages: <https://mlhaufe.github.io/pl-wiki/>

## Development

Requires **Node.js 26+** (enforced via `"engines"` in `package.json`).

### Dev container (recommended)

The repository ships a [dev container](https://containers.dev) configuration
(`.devcontainer/`, modeled on the one in [final-hill/cathedral](https://github.com/final-hill/cathedral/tree/master/.devcontainer)):
Node 26 + dependencies preinstalled, non-root `node` user, `gh` CLI feature,
and the recommended VS Code extensions. Docker initializes the container from
the image's `node_modules` (kept in a named volume, isolated from the host
bind mount).

1. Start Docker Desktop.
2. Open the project in VS Code and **Reopen in Container** when prompted.
3. `npm run dev` inside the container, then open
   <http://127.0.0.1:3000/pl-wiki/>.

### Local (no container)

```sh
npm install
npm run dev
```

Then open <http://127.0.0.1:3000/pl-wiki/> (on Windows, prefer `127.0.0.1`
over `localhost` for dev-server performance).

While the dev server is running, the [Nuxt Studio](https://nuxt.studio)
floating button (bottom left) offers a visual editor for `content/languages/*`
pages — frontmatter forms are generated from the collection schema in
`content.config.ts`.

## Editing language pages

One page per language lives in `content/languages/<slug>.md`. The frontmatter
is a fixed, normalized fact contract validated at build time by the Zod schema
in `content.config.ts` (facts are schema; prose is commentary — the page body
is optional curated prose and never a data carrier):

| field | type | |
|---|---|---|
| `name` | string | required |
| `title` | string | native SEO field; mirrors `name` |
| `homepage` | string | optional |
| `urls` | string[] | optional; external articles/references |
| `logo` | string | optional; path under `public/logos/` |
| `author` | string | optional |
| `kind` | enum | optional; `language` \| `family` \| `dialect` \| `notation` |
| `status` | enum | optional; `active` \| `experimental` \| `dormant` \| `historical` |
| `year` | number | optional; first appeared |
| `paradigms` | vocabulary string[] | optional; see `app/utils/taxonomy.ts` |
| `typing` | enum | optional; `untyped` \| `dynamic` \| `static` \| `gradual` |
| `type_system` | vocabulary string[] | e.g. `inferred`, `effect-system`, `dependent` |
| `memory` | vocabulary string[] | e.g. `gc`, `arc`, `ownership`, `arena` |
| `execution` | vocabulary string[] | e.g. `native`, `bytecode`, `jit`, `transpiled` |
| `concurrency` | vocabulary string[] | e.g. `actors`, `channels`, `async/await` |
| `features` | string[] | optional; free-form long tail |
| `influences` / `influenced` | string[] | optional; render as internal wiki links |
| `note` | string | optional; short summary shown on the page |

Vocabulary axes are linted (and `--fix` normalized) against the controlled
vocabularies in `app/utils/taxonomy.ts` — the single source of truth shared by
the schema docs, the lint, and the future faceted UI:

```sh
npm run lint:frontmatter           # check
npm run lint:frontmatter -- --fix  # normalize case/synonym variants + field order
```

Below the frontmatter is optional curated prose. When present, it follows a
fixed four-section skeleton — `Overview` (≤ 60 words) → `Code` (1–2 fenced,
idiomatic examples, 5–25 lines, captions) → `Distinctive traits` (3–6
bullets) → `Status` (≤ 40 words), with `History` optional (≤ 80 words).
A frontmatter-only page is a valid terminal state (a data row).
`content/languages/esterel.md` is the conforming exemplar.

Both layers are enforced by lint gates:

```sh
npm run lint:frontmatter           # fact contract + vocabularies
npm run lint:body                  # prose skeleton + caps + link integrity
npm run lint:frontmatter -- --fix  # normalize frontmatter (canonical order)
```

Authoring new or updated entries is encoded as an agent skill:
[`.github/skills/language-entry/`](.github/skills/language-entry/) — prompt
the agent with a language name to research, create, or update an entry and
it follows the same contract, evidence rules, and validation gates.

The full data architecture (schema v2, taxonomy layer, target routes) lives in
[docs/knowledgebase-plan.md](docs/knowledgebase-plan.md).

Slugs are derived deterministically from `name` (lowercase, `+`→`plus`,
`&`→`and`, Greek letters transliterated, remaining punctuation → `-`;
e.g. `C++` → `cplusplus`, `F#` → `fsharp`, `π` → `pi`).

## Data conversions

The initial corpus was generated from the legacy `_data/languages.yml` by:

```sh
node scripts/convert-languages.mjs --check   # dry run (reports slug collisions)
node scripts/convert-languages.mjs           # writes content/languages/*.md
```

## Production build

```sh
npm run generate     # static output in .output/public
```

Deployment: the `Deploy to GitHub Pages` workflow (`.github/workflows/deploy.yml`)
builds and deploys on pushes to `master`. The repository's Pages source must be
set to **GitHub Actions**.

## Project structure

```
app/                  Nuxt app (pages, layouts, components, css)
content/languages/    one Markdown page per language (source of truth)
content.config.ts     languages collection: schema-locked frontmatter contract
nuxt.config.ts        modules, baseURL (/pl-wiki/), site URL, feed config
public/               static assets (logos, icons, robots.txt)
server/plugins/       feed generation hook
scripts/              migration + maintenance scripts
docs/                 migration plan and notes
.devcontainer/        dev container (Node 26, VS Code extensions, gh CLI)
.github/              Pages deploy workflow
```

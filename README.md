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
is a fixed, normalized contract validated at build time by the Zod schema in
`content.config.ts`:

| field | type | |
|---|---|---|
| `name` | string | required |
| `title` | string | native SEO field; mirrors `name` |
| `homepage` | string | optional |
| `urls` | string[] | optional; external articles/references |
| `logo` | string | optional; path under `public/logos/` |
| `author` | string | optional |
| `paradigms` | string[] | optional |
| `influences` / `influenced` | string[] | optional; render as internal wiki links |
| `note` | string | optional; short summary shown on the page |

The page below the frontmatter is the wiki article body (Markdown/MDC).

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

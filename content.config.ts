import { defineContentConfig, defineCollection } from '@nuxt/content'
import { z } from 'zod'

/**
 * The languages collection is the single source of truth for the wiki.
 *
 * One Markdown page per language in `content/languages/`; the frontmatter is a
 * fixed, normalized contract migrated from `_data/languages.yml`. The Zod schema
 * makes normalization machine-enforced: malformed frontmatter fails the build.
 *
 * See docs/migration-nuxt-plan.md §4 for the architecture decision.
 *
 * NOTE: arrays (`urls`, `paradigms`, `influences`, `influenced`) are persisted as
 * JSON text columns by the Content database; containment queries use `LIKE`
 * (client-side faceting is the primary tool at this scale).
 */
export default defineContentConfig({
  collections: {
    languages: defineCollection({
      type: 'page',
      // default prefix = static part of include → path /languages/<slug>,
      // matching app/pages/languages/[slug].vue
      source: 'languages/*.md',
      schema: z.object({
        name: z.string().min(1),
        homepage: z.string().optional(),
        urls: z.array(z.string()).optional(),
        logo: z.string().optional(),
        author: z.string().optional(),
        paradigms: z.array(z.string()).optional(),
        influences: z.array(z.string()).optional(),
        influenced: z.array(z.string()).optional(),
        note: z.string().optional()
      }),
      indexes: [{ columns: ['name'] }]
    })
  }
})
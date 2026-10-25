<script setup lang="ts">
/**
 * Schema contract page (docs/knowledgebase-plan.md §4 route `/schema`).
 *
 * Renders the field contract and vocabularies live from
 * app/utils/taxonomy.ts + a static field table — the same single source the
 * lint and Studio forms consume, so this page cannot drift from the contract.
 */
import {
  KINDS, STATUSES, TYPING, PARADIGMS, TYPE_SYSTEM, MEMORY, EXECUTION, CONCURRENCY
} from '~/utils/taxonomy'

const LINT_SCALARS = [
  { field: 'name', type: 'string', note: 'required; ASCII-only; unique across the corpus' },
  { field: 'title', type: 'string', note: 'native SEO field; mirrors name; ASCII-only' },
  { field: 'homepage', type: 'string', note: 'official site' },
  { field: 'author', type: 'string', note: 'person or team' },
  { field: 'logo', type: 'string', note: 'path under public/logos/ (media picker in Studio)' },
  { field: 'year', type: 'number', note: 'first appeared; written unquoted so it stores as integer' }
] as const

const LINT_ARRAYS = [
  { field: 'urls', type: 'string[]', note: 'external references' },
  { field: 'paradigms', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'type_system', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'memory', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'execution', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'concurrency', type: 'string[]', note: 'vocabulary-controlled' },
  { field: 'features', type: 'string[]', note: 'free-form long tail' },
  { field: 'influences', type: 'string[]', note: 'language names; cross-linked' },
  { field: 'influenced', type: 'string[]', note: 'language names; cross-linked' },
  { field: 'note', type: 'string', note: 'short summary shown on the page' }
] as const

const vocabGroups = [
  { name: 'kind', values: KINDS, scalars: true },
  { name: 'status', values: STATUSES, scalars: true },
  { name: 'typing', values: TYPING, scalars: true },
  { name: 'paradigms', values: PARADIGMS, scalars: false },
  { name: 'type_system', values: TYPE_SYSTEM, scalars: false },
  { name: 'memory', values: MEMORY, scalars: false },
  { name: 'execution', values: EXECUTION, scalars: false },
  { name: 'concurrency', values: CONCURRENCY, scalars: false }
] as const

useSeoMeta({
  title: 'Data contract',
  description: 'The normalized fact contract for language entries: fields, vocabularies, and lint.'
})
</script>

<template>
  <div class="mx-4 my-2">
    <header class="mb-4">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All languages"
      />
      <h1 class="text-2xl font-semibold my-2">
        Data contract
      </h1>
      <p class="text-sm opacity-70 max-w-3xl">
        Every language is a row: a fixed frontmatter fact profile (this page)
        plus optional curated prose. Facts are schema; prose is commentary.
        Schemas are enforced at build by the Zod collection schema; vocabularies
        by <code>npm run lint:frontmatter</code> against
        <code>app/utils/taxonomy.ts</code> — the same source rendering below.
      </p>
    </header>

    <section class="max-w-4xl">
      <h2 class="text-lg font-semibold mt-6 mb-2">
        Scalar fields
      </h2>
      <table class="lang-table min-w-0">
        <thead>
          <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr v-for="f in LINT_SCALARS" :key="f.field">
            <td><code>{{ f.field }}</code></td>
            <td class="opacity-80">{{ f.type }}</td>
            <td class="text-sm opacity-75">{{ f.note }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-lg font-semibold mt-6 mb-2">
        Array fields
      </h2>
      <table class="lang-table min-w-0">
        <thead>
          <tr><th>Field</th><th>Type</th><th>Notes</th></tr>
        </thead>
        <tbody>
          <tr v-for="f in LINT_ARRAYS" :key="f.field">
            <td><code>{{ f.field }}</code></td>
            <td class="opacity-80">{{ f.type }}</td>
            <td class="text-sm opacity-75">{{ f.note }}</td>
          </tr>
        </tbody>
      </table>

      <h2 class="text-lg font-semibold mt-6 mb-2">
        Vocabularies
      </h2>
      <p class="text-sm opacity-70 mb-3">
        Add a value once in taxonomy.ts, re-run the lint; corpus entries that
        need spelling normalization are reported (or auto-fixed with
        <code>--fix</code>). The page body is optional prose — never a data
        carrier.
      </p>
      <div v-for="g in vocabGroups" :key="g.name" class="mb-3">
        <h3 class="text-sm font-medium uppercase opacity-70 mb-1">
          {{ g.name }} <span v-if="g.scalars" class="opacity-60 normal-case">(single value)</span>
        </h3>
        <div class="flex flex-wrap gap-1.5">
          <UBadge v-for="v in g.values" :key="v" color="neutral" variant="outline" size="sm">
            {{ v }}
          </UBadge>
        </div>
      </div>
    </section>
  </div>
</template>
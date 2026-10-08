<script setup lang="ts">
const route = useRoute()

const { data: language } = await useAsyncData(`language-${route.params.slug}`, () =>
  queryCollection('languages').path(`/languages/${route.params.slug}`).first()
)

if (!language.value) {
  throw createError({ statusCode: 404, statusMessage: 'Language not found', fatal: true })
}

const pageUrl = computed(() => `${language.value?.path}`)

// Resolved registry-based cross-links: influences/influenced -> known slugs
const { data: allLanguages } = await useAsyncData('languages-meta', () =>
  queryCollection('languages').select('name', 'path').order('name', 'ASC').all()
)
const nameToPath = computed(
  () => new Map(allLanguages.value?.map(l => [l.name, l.path]) ?? [])
)

function linkFor(name: string): { label: string, to?: string } | null {
  const to = nameToPath.value.get(name)
  return to ? { label: name, to } : null
}

useSeoMeta({
  title: language.value?.title,
  description: language.value?.note ?? language.value?.description
})
</script>

<template>
  <div v-if="language" class="mx-4 my-2">
    <header class="mb-4">
      <UButton
        to="/"
        variant="link"
        color="neutral"
        size="sm"
        icon="i-lucide-arrow-left"
        label="All languages"
      />
      <h1 class="flex items-center gap-3 text-2xl font-semibold my-2">
        <img v-if="language.logo" :src="language.logo" :alt="`${language.name} logo`" class="h-8">
        {{ language.name }}
      </h1>
    </header>

    <section class="infobox mb-6">
      <dl class="grid grid-cols-[8rem_1fr] gap-y-1">
        <dt v-if="language.homepage">Homepage</dt>
        <dd v-if="language.homepage">
          <a :href="language.homepage" target="_blank" rel="noopener">{{ language.homepage }}</a>
        </dd>
        <template v-if="language.author">
          <dt>Author</dt>
          <dd>{{ language.author }}</dd>
        </template>
        <template v-if="language.paradigms?.length">
          <dt>Paradigms</dt>
          <dd>{{ language.paradigms.join(', ') }}</dd>
        </template>
        <template v-if="language.influences?.length">
          <dt>Influences</dt>
          <dd class="flex flex-wrap gap-2">
            <template v-for="name in language.influences" :key="name">
              <NuxtLink v-if="linkFor(name)?.to" :to="linkFor(name)!.to">{{ name }}</NuxtLink>
              <span v-else>{{ name }}</span>
            </template>
          </dd>
        </template>
        <template v-if="language.influenced?.length">
          <dt>Influenced</dt>
          <dd class="flex flex-wrap gap-2">
            <template v-for="name in language.influenced" :key="name">
              <NuxtLink v-if="linkFor(name)?.to" :to="linkFor(name)!.to">{{ name }}</NuxtLink>
              <span v-else>{{ name }}</span>
            </template>
          </dd>
        </template>
      </dl>
    </section>

    <ContentRenderer :value="language" />
  </div>
</template>
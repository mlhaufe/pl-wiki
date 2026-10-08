<script setup lang="ts">
const { data: languages } = await useAsyncData('languages', () =>
  queryCollection('languages')
    .select('name', 'homepage', 'urls', 'logo', 'path')
    .order('name', 'ASC')
    .all()
)

const search = ref('')

const filtered = computed(() => {
  const reText = new RegExp(search.value.trim(), 'i')
  return languages.value?.filter(lang => reText.test(lang.name)) ?? []
})
</script>

<template>
  <div>
    <header class="site-content_header" />
    <section class="site-content_body">
      <UInput
        v-model="search"
        placeholder="Search"
        class="m-1 mb-2"
        aria-label="Search languages by name"
      />
      <table class="lang-table">
        <thead>
          <tr>
            <th>Logo</th>
            <th>Name</th>
            <th>Urls</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="lang in filtered" :key="lang.name">
            <td>
              <img
                v-if="lang.logo"
                :src="lang.logo"
                :alt="`${lang.name} logo`"
                loading="lazy"
              >
            </td>
            <td>
              <NuxtLink :to="lang.path">{{ lang.name }}</NuxtLink>
            </td>
            <td>
              <ul v-if="lang.urls?.length">
                <li v-for="url in lang.urls" :key="url">
                  <a :href="url" target="_blank" rel="noopener">{{ url }}</a>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>
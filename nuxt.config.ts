// https://nuxt.com/docs/api/configuration/nuxt-config
// Nuxt Studio registers admin routes for the dev-mode editor; production
// editing requires SSR server routes (OAuth) which GitHub Pages cannot serve.
// Register Studio in dev only to keep the static bundle clean.
const isDev = process.env.NODE_ENV === 'development'

export default defineNuxtConfig({
  modules: isDev
    ? ['@nuxt/ui', '@nuxt/content', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-module-feed', 'nuxt-studio']
    : ['@nuxt/ui', '@nuxt/content', '@nuxtjs/sitemap', '@nuxtjs/robots', 'nuxt-module-feed'],

  css: ['~/assets/css/main.css'],

  // GitHub Pages project site: https://mlhaufe.github.io/pl-wiki/
  app: {
    baseURL: '/pl-wiki/',
    head: {
      htmlAttrs: { lang: 'en-US' }
    }
  },

  // Canonical origin for sitemap/robots (site-config composes url + baseURL)
  site: {
    url: 'https://mlhaufe.github.io'
  },

  // Windows workaround for nuxt/nuxt#36467 (Nuxt 4.6.0): Nitro's string-based
  // inline matcher doesn't match backslash paths, leaving the SSR renderer
  // external so prerendering throws "Either manifest or precomputed data must
  // be provided". A regex inline rule matches both separators. Remove once we
  // upgrade to a Nuxt release containing the #36506 hotfix.
  nitro: {
    externals: {
      inline: [/[\\/]node_modules[\\/]nuxt[\\/]dist[\\/]/]
    }
  },

  // The robots module refuses robots.txt generation for base-URL sites (GitHub
  // Pages project pages). We ship a static robots.txt in public/ that points
  // at the prerendered sitemap instead.
  robots: {
    robotsTxt: false
  },

  // nuxt-module-feed: config lives here (the module has no config-file loader).
  // Items are populated by the feed:generate hook in server/plugins/feed.ts.
  feed: {
    sources: [
      {
        path: '/feed.xml',
        type: 'rss2',
        cacheTime: 60 * 15
      }
    ]
  },

  devtools: { enabled: true },

  studio: {
    route: '/_studio',
    repository: {
      provider: 'github',
      owner: 'mlhaufe',
      repo: 'pl-wiki'
    }
  }
})

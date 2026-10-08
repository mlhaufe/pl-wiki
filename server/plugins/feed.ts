// Nitro plugin: build the RSS 2.0 feed at /feed.xml.
// Until a feedable collection exists (blog/changelog), the feed carries the
// site metadata only. Populate items in this hook when such a collection lands
// (docs/migration-nuxt-plan.md phase 7).
import type { NitroCtx, Feed } from 'nuxt-module-feed'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('feed:generate', async ({ feed, options }: NitroCtx) => {
    if (options.path !== '/feed.xml') return

    feed.options = {
      id: 'https://mlhaufe.github.io/pl-wiki/',
      title: 'Programming Language Wiki',
      description: 'A wiki of programming languages: resources, influences and paradigms.',
      copyright: 'Programming Language Wiki contributors',
      link: 'https://mlhaufe.github.io/pl-wiki/'
    }

    // Example of populating items later:
    //   const posts = await queryCollection(event, '...').order(...).all()
    //   posts.forEach(post => feed.addItem({ title, id, link, description, date }))
    void feed
  })
})
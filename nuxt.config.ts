// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  css: ['modern-css-reset'],
  app: {
    head: {
      meta: [
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Twitterシェルター' },
        { property: 'og:locale', content: 'ja_JP' },
      ],
      link: [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Mochiy+Pop+One&family=Noto+Sans+JP:wght@100..900&family=Philosopher&display=swap',
        },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-touch-icon.png' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      baseUrl: '',
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
})

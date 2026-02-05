// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@pinia/nuxt',
    '@nuxtjs/tailwindcss',
  ],
  compatibilityDate: '2025-01-01',
  experimental: {
    appManifest: false,
  },
  typescript: {
    strict: true,
  },
  app: {
    head: {
      title: 'GSD - Get Stuff Done',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'A GTD (Getting Things Done) web application' },
      ],
    },
  },
})

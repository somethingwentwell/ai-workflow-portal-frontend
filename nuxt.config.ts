// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["shadcn-nuxt", "@nuxtjs/tailwindcss"],
  runtimeConfig: {
    public: {
      DOC_COMPARE_WORKFLOW_KEY: process.env.DOC_COMPARE_WORKFLOW_KEY,
    }
  },
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'https://demo.dify.hk/v1/**' },
    }
  }
})
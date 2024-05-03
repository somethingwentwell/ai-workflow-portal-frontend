// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["shadcn-nuxt", "@nuxtjs/tailwindcss", "@kgierke/nuxt-basic-auth"],
  runtimeConfig: {
    public: {
      DOC_COMPARE_WORKFLOW_KEY: process.env.DOC_COMPARE_WORKFLOW_KEY,
      AZURE_OAI_ENDPOINT: process.env.AZURE_OAI_ENDPOINT,
      GPT4TURBO_KEY: process.env.GPT4TURBO_KEY,
    }
  },
  nitro: {
    routeRules: {
      '/api/**': { proxy: 'https://demo.dify.hk/v1/**' },
    }
  },
  basicAuth: {
    enabled: true,
    users: [
      {
        username: "superhub",
        password: "bidbidbid",
      },
    ],
    // Optional: Whitelist routes
    // allowedRoutes: ["/api/.*"],
  },
})
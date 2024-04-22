// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      completionsEndpoint: process.env.NUXT_BASE_URL_COMPLETIONS,
      modelsEndpoint: process.env.NUXT_BASE_URL_MODELS,
      currentModel: process.env.NUXT_BASE_CURRENT_MODEL
    }
  },
  extends: ['@nuxt/ui-pro'],
  modules: ['@nuxt/ui', '@nuxt/content', '@formkit/auto-animate/nuxt'],
  app: {
    head: {
      title: 'AI Chat App'
    }
  }
})
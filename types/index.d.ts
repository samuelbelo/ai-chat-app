declare module 'nuxt/schema' {
	interface RuntimeConfig {
		apiSecret: string
	}
	interface PublicRuntimeConfig {
		completionsEndpoint: string
		modelsEndpoint: string
		currentModel: string
	}
}
export {}
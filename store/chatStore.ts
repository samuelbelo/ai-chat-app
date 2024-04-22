import {defineStore} from "pinia";


interface Chat {
	role: 'user' | 'ai' | 'error'
	content: string
}
export const useChatStore = defineStore('chatStore', () => {
	const chatList = ref<Chat[]>([])
	const userPrompt = ref<string>('')

	return {
		chatList,
		userPrompt
	}
}, {
	persist: true
})
<template>
	<UPage>
		<UContainer>
		
<!--			<USelectMenu v-model="selectedModel" :options="['lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF']" />-->
			<UCard :ui="{ _borderWidth: 0, borderOpacity: 0 }" class="mt-4 h-[87vh]">
				<template #default>
					<div ref="messagesContainer" id="defaultContainer" class="h-[74vh]">
						<div v-auto-animate="{duration: 100}" v-if="chatList.length" class="mt-4" v-for="(chat, i) in chatList">
							<div class="text-center font-bold antialiased dark:text-white p-1 rounded-lg w-16"
							     v-if="chat.role === 'user'">You
							</div>
							<div
									style="background: linear-gradient(to right, #ea6a6a, #5252ae);"
									class="text-center font-bold antialiased text-white p-1 rounded-lg w-16"
									v-else-if="chat.role === 'ai'">AI
							</div>
							<div
									:key="i"
									v-if="chat.role !== 'error'"
									v-html="$mdRenderer.render(chat.content)"
									class="prose-xl
								border
								antialiased
								dark:border-gray-800
								prose-blue
								prose-pre:bg-zinc-800
								prose-pre:text-gray-200
								text-sm
								m-5
								p-5
								shadow-xl
								rounded-2xl">
							</div>
						</div>
						<div v-else>
							<h1 class="text-2xl text-center">No chat yet</h1>
						</div>
					</div>
				</template>
				<template #footer>
					<div id="footerFields" style="display: flex;">
						<UInput
								placeholder="Type your prompt here"
								:disabled="generating"
								class="mr-3 w-full"
								@keyup.enter="fetchChat"
								:ui="{ padding: 'px-6 py-10' }"
								v-model="userPrompt"/>
						<UButton
								v-if="!generating"
								icon="carbon:send"
								@click="fetchChat"
								variant="ghost"/>
						<UButton
								ref="cancelButton"
								color="red"
								v-else
								icon="fluent:record-stop-16-regular"
								id="stopButton"
								variant="ghost"/>
					</div>
				</template>
			</UCard>
		</UContainer>
	</UPage>
</template>
<script lang="ts" setup>
import {useEventListener, useScroll} from "@vueuse/core";
import {useChatStore} from "~/store/chatStore";
import {storeToRefs} from "pinia";

const {chatList} = storeToRefs(useChatStore())

const toast = useToast()
const selectedModel = ref('lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF')

interface Chat {
	role: 'user' | 'ai' | 'error'
	content: string
}

const messagesContainer = ref<HTMLDivElement>()
const {x, y: yScroll} = useScroll(messagesContainer)

const cancelButton = ref<HTMLButtonElement>()
const userPrompt = ref('')
const chatResponse = ref('')
// const chatList = ref<Chat[]>([])
const generating = ref(false)

const fetchChat = async () => {
	if (userPrompt.value === '') return
	chatList.value.push({role: 'user', content: userPrompt.value})
	const userPromptValue = userPrompt.value
	userPrompt.value = ''
	let controller = new AbortController()
	const signal = controller.signal
	useEventListener(cancelButton, 'click', () => {
		controller.abort()
		toast.add({
			icon: 'material-symbols:chat-error-rounded',
			id: 'generatingError',
			title: 'Error',
			description: 'Request aborted by User',
			color: 'red'
		})
	})
	try {
		const config = useRuntimeConfig()
		const response: any = await fetch(config.public.completionsEndpoint,
				{
					method: 'POST',
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						model: config.public.currentModel,
						messages: [
							{
								role: "system",
								content: "You are a helpful, smart, kind, and efficient coach AI assistant. You always fulfill the user's requests to the best of your ability. You're the upmost helper when it comes to job interviews, mainly on the Business Analyst field."
							},
							{
								role: "user",
								content: userPromptValue
							}
						],
						temperature: 0.7,
						max_tokens: -1,
						stream: true
					}),
					signal
				})
		generating.value = true
		const reader = response.body.getReader()
		const decoder = new TextDecoder('utf-8')
		
		chatList.value.push({role: 'ai', content: ''})
		while (true) {
			yScroll.value += 100
			const {done, value} = await reader.read()
			if (done) {
				console.info('Stream is done')
				generating.value = false
				break
			}
			const decodedValue = decoder.decode(value)
			const lines = decodedValue.split('\n')
			const parsedLines = lines
					.map(line => line.replace(/^data: /, "").trim())
					.filter(line => line !== "" && line !== "[DONE]")
					.map(line => JSON.parse(line))
			
			for (const parsedLine of parsedLines) {
				const {choices} = parsedLine
				const {delta} = choices[0]
				const {content} = delta
				if (content) {
					chatList.value[chatList.value.length - 1].content += content
				}
			}
		}
	} catch (error) {
		console.error(error)
	} finally {
		generating.value = false
	}
}

</script>
<style>
#footerFields {
	position: sticky;
	bottom: 0;
}

#defaultContainer {
	scroll-behavior: smooth;
	max-height: calc(100vh - 230px);
	overflow-y: auto;
	overflow-anchor: auto !important;
	flex-direction: column-reverse;
}
</style>

import md from "markdown-it";
import Shiki from '@shikijs/markdown-it'

export default defineNuxtPlugin(() => {
	const renderer = md();
	renderer.use(Shiki, {
		themes: {
			light: 'vitesse-light',
			dark: 'vitesse-dark',
		}
	});
	return {
		provide: {
			mdRenderer: renderer,
		},
	};
});
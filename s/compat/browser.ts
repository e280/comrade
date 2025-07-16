
import {Compat, CompatWorker} from "./types.js"

export const setupBrowserCompat = (): Compat => ({
	getSelf() {
		return self
	},

	guessOptimalThreadCount() {
		const count = navigator.hardwareConcurrency ?? 1
		return Math.max(1, count - 1)
	},

	loadWorker(url, name) {
		return new window.Worker(url, {name, type: "module"}) as CompatWorker
	},

	async loadWasm(url) {
		return WebAssembly.instantiateStreaming(fetch(url))
	},
})


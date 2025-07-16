
import {cpus} from "node:os"
import fs from "node:fs/promises"
import {parentPort, Worker} from "node:worker_threads"

import {Compat, CompatWorker} from "./types.js"
import {ChannelMessage, PostableChannel} from "@e280/renraku"

export const setupNodeCompat = (): Compat => ({
	getSelf() {
		return wrapNodeChannel(parentPort!)
	},

	guessOptimalThreadCount() {
		const count = cpus().length ?? 1
		return Math.max(1, count - 1)
	},

	loadWorker(url, name) {
		const worker = new Worker(url, {name})

		return {
			...wrapNodeChannel(worker),
			terminate: () => worker.terminate(),
		} as CompatWorker
	},

	async loadWasm(url) {
		const buffer = await fs.readFile(url)
		return WebAssembly.instantiate(buffer)
	},
})

type NodeChannel = {
	on(m: string, fn: (a: any) => void): void
	off(m: string, fn: (b: any) => void): void
	postMessage(m: any, t: readonly Transferable[] | undefined): void
}

function wrapNodeChannel(nodeChannel: NodeChannel): PostableChannel {
	const fns = new Map<(m: ChannelMessage) => void, (m: any) => void>()
	return {
		postMessage: (m, t) => nodeChannel.postMessage(m, t as any),
		addEventListener: (_e, fn) => {
			const actual = (m: any) => fn({data: m, origin: ""})
			fns.set(fn, actual)
			nodeChannel.on("message", actual)
		},
		removeEventListener: (_e, fn) => {
			const actual = fns.get(fn)
			if (actual)
				nodeChannel.off("message", actual)
		},
	}
}


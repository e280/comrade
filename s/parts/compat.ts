
import {PostableChannel, ChannelMessage, isNode} from "@e280/renraku"

export type CompatWorker = {
	terminate(): void
} & PostableChannel

export type NodeChannel = {
	on(m: string, fn: (a: any) => void): void
	off(m: string, fn: (b: any) => void): void
	postMessage(m: any, t: readonly Transferable[] | undefined): void
}

export function wrapNodeChannel(nodeChannel: NodeChannel): PostableChannel {
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

export async function getSelf() {
	return isNode()
		? wrapNodeChannel((await import("node:worker_threads")).parentPort!)
		: self
}

export async function guessOptimalThreadCount() {
	const count = (!isNode())
		? (navigator.hardwareConcurrency ?? 1)
		: ((await import("os")).cpus().length ?? 1)
	return Math.max(1, count - 1)
}

export async function loadWorker(url: string | URL, name: string | undefined) {
	if (!isNode())
		return new window.Worker(url, {name, type: "module"}) as CompatWorker

	const {Worker} = await import("node:worker_threads")
	const worker = new Worker(url, {name})

	return {
		...wrapNodeChannel(worker),
		terminate: () => worker.terminate(),
	} as CompatWorker
}

export async function loadWasm(url: string | URL) {
	if (isNode()) {
		const fs = await import("fs/promises")
		const buffer = await fs.readFile(url)
		return await WebAssembly.instantiate(buffer)
	}
	else {
		return await WebAssembly.instantiateStreaming(fetch(url))
	}
}


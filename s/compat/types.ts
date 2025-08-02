
import {PostableChannel} from "@e280/renraku"

export type CompatWorker = {
	terminate(): void
} & PostableChannel

export type Compat = {
	getSelf(): PostableChannel
	guessOptimalThreadCount(): number
	loadWorker(url: string | URL, name: string | undefined): CompatWorker
	loadWasm(url: string | URL): Promise<WebAssembly.WebAssemblyInstantiatedSource | WebAssembly.Instance>
}


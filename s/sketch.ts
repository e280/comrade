
export class Party {
	#workers = new Set<Worker>()
	#freePool = new Set<Worker>()
	#defaultThreads = Math.max(1, navigator.hardwareConcurrency - 1)

	constructor(public options: {
			workerUrl: URL | string
			threads?: number
		}) {

		const threads = options.threads ?? this.#defaultThreads

		for (const _ of Array(threads)) {
			const worker = new Worker(options.workerUrl, {type: "module"})
			// TODO
		}
	}
}


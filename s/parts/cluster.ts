
import {defer} from "@e280/stz"
import {Endpoint, remote, Remote, Tap} from "@e280/renraku"

import {Thread} from "./thread.js"
import {Compat} from "../compat/types.js"
import {defaultTap} from "./default-tap.js"
import {ClusterOptions, Schematic, Task} from "./types.js"

/**
 * a pool of web workers
 *  - please use `await Cluster.make(options)` to create your worker pool
 *  - call your worker functions like `await cluster.remote.hello()`
 */
export class Cluster<S extends Schematic> {

	static async make<S extends Schematic>(compat: Compat, options: ClusterOptions<S>) {
		const workerCount = options.workerCount ?? compat.guessOptimalThreadCount()
		const threads = await Promise.all([...Array(workerCount)].map(
			async(_, index) => Thread.make(compat, {
				...options,
				label: options.label ?? `${options.label ?? "comrade"}_${index + 1}`,
			})
		))
		return new this<S>(threads, {tap: options.tap})
	}

	work: Remote<S["work"]>
	#available = new Set<Thread<S>>()
	#tasks: Task[] = []

	constructor(private threads: Thread<S>[], options: {tap?: Tap} = {}) {
		const tap = options.tap ?? defaultTap

		// delegation
		const remoteEndpoint: Endpoint = async(request, special) => this.#scheduleTask({
			request,
			prom: defer(),
			transfer: special?.transfer,
		})

		// remote proxy to call comrade fns
		this.work = remote({
			tap,
			endpoint: remoteEndpoint,
		})

		// in the beginning, all threads are available
		threads.forEach(t => this.#available.add(t))
	}

	get threadCount() {
		return this.threads.length
	}

	terminate() {
		for (const thread of this.threads)
			thread.terminate()
	}

	#scheduleTask(task: Task) {
		this.#tasks.push(task)
		this.#distributeTasks()
		return task.prom.promise
	}

	#distributeTasks() {
		while (this.#available.size > 0 && this.#tasks.length > 0) {
			const thread = [...this.#available].pop()!
			this.#available.delete(thread)

			const task = this.#tasks.shift()!

			// this thread is no longer available
			this.#available.delete(thread)

			// call the thread endpoint
			const callprom = thread.messenger.remoteEndpoint(task.request, {transfer: task.transfer})

			// resolve/reject the task prom when callprom is done
			task.prom.entangle(callprom).finally(() => {

				// thread is ready again
				this.#available.add(thread)

				// distribute more tasks
				this.#distributeTasks()
			})
		}
	}
}



import {deferPromise} from "@e280/stz"
import {Endpoint, remote, Remote} from "renraku"

import {Thread} from "./parts/thread.js"
import {guessOptimalThreadCount} from "./parts/compat.js"
import {ClusterParams, Schematic, Task} from "./parts/types.js"

/**
 * a pool of web workers
 *  - please use `await Cluster.make(options)` to create your worker pool
 *  - call your worker functions like `await cluster.remote.hello()`
 */
export class Cluster<S extends Schematic> {

	static async make<S extends Schematic>(params: ClusterParams<S>) {
		const workerCount = params.workerCount ?? guessOptimalThreadCount()
		const threads = await Promise.all([...Array(workerCount)].map(
			async(_, index) => Thread.make({
				...params,
				label: params.label ?? `${params.label ?? "comrade"}_${index + 1}`,
			})
		))
		return new this<S>(threads)
	}

	work: Remote<S["work"]>
	#available = new Set<Thread<S>>()
	#tasks: Task[] = []

	constructor(private threads: Thread<S>[]) {

		// delegation
		const remoteEndpoint: Endpoint = async(request, transfer) => this.#scheduleTask({
			request,
			transfer,
			prom: deferPromise(),
		})

		// remote proxy to call comrade fns
		this.work = remote(remoteEndpoint)

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
			const callprom = thread.messenger.remoteEndpoint(task.request, task.transfer)

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


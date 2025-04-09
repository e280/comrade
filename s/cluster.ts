
import {deferPromise} from "@benev/slate"
import {Endpoint, remote, Remote} from "renraku"

import {Thread} from "./parts/thread.js"
import {Options, Schematic, Task} from "./parts/types.js"
import {establishThreads} from "./parts/establish-threads.js"

/**
 * a pool of web workers
 *  - please use `await Cluster.setup(options)` to create a new cluster
 *  - call your worker functions like `await cluster.remote.helloWorld()`
 */
export class Cluster<S extends Schematic> {
	static async setup<S extends Schematic>(plan: Options<S>) {
		const threads = await establishThreads<S>(plan)
		return new this<S>(threads)
	}

	remote: Remote<S["workerFns"]>
	#available = new Set<Thread<S>>()
	#tasks: Task[] = []

	constructor(threads: Thread<S>[]) {

		// delegation
		const remoteEndpoint: Endpoint = async(request, transfer) => this.#scheduleTask({
			request,
			transfer,
			prom: deferPromise(),
		})

		// remote proxy to call comrade fns
		this.remote = remote(remoteEndpoint)

		// in the beginning, all threads are available
		threads.forEach(t => this.#available.add(t))
	}

	#scheduleTask(task: Task) {
		this.#tasks.push(task)
		this.#distributeTasks()
		return task.prom.promise
	}

	#distributeTasks() {
		while (this.#available.size > 0 && this.#tasks.length > 0) {
			const thread = [...this.#available].pop()!
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


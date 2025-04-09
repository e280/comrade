
import {deferPromise} from "@benev/slate"
import {Endpoint, remote, Remote} from "renraku"

import {Thread} from "./parts/thread.js"
import {Options, Schematic, Task} from "./parts/types.js"
import {establishThreads} from "./parts/establish-threads.js"

/**
 * a pool of web workers
 *  - please use `await Workers.setup(options)` to create your workers pool
 *  - call your worker functions like `await workers.remote.hello()`
 */
export class Workers<S extends Schematic> {
	static async setup<S extends Schematic>(options: Options<S>) {
		const threads = await establishThreads<S>(options)
		return new this<S>(threads)
	}

	remote: Remote<S["workerFns"]>
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
		this.remote = remote(remoteEndpoint)

		// in the beginning, all threads are available
		threads.forEach(t => this.#available.add(t))
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


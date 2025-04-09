
import {deferPromise, DeferPromise} from "@benev/slate"
import {endpoint, Endpoint, JsonRpc, Messenger, remote, Remote} from "renraku"

import {Thread} from "./parts/thread.js"
import {ApparatchikFns, Schematic, SetupFns} from "./types.js"

export type Task = {
	request: JsonRpc.Request
	transfer: Transferable[] | undefined
	prom: DeferPromise<JsonRpc.Response | null>
}

export type CentralPlan<S extends Schematic> = {
	workerUrl: string | URL
	setupCommissar: SetupFns<S["commissarFns"], S["comradeFns"]>
	label?: string
	workerCount?: number
}

export class Kremlin<S extends Schematic> {
	remote: Remote<S["comradeFns"]>
	#available = new Set<Thread<S>>()
	#tasks: Task[] = []

	static async setup<S extends Schematic>(plan: CentralPlan<S>) {
		const path = new URL("./worker.js", import.meta.url)
		const workerCount = plan.workerCount ?? Math.max(1, navigator.hardwareConcurrency - 1)

		const threads = await Promise.all(Array(workerCount).map(async(_, index) => {
			const worker = new Worker(path, {
				type: "module",
				name: `${plan.label ?? "comrade"}_${index + 1}`,
			})

			const readyprom = deferPromise<void>()

			const apparatchik: ApparatchikFns = {
				async ready() {
					readyprom.resolve()
				},
			}

			const messenger = new Messenger<S["comradeFns"]>({
				timeout: 120_000,
				getLocalEndpoint: (remote, rig) => endpoint({
					apparatchik,
					commissar: plan.setupCommissar(remote, rig)
				}),
			})

			messenger.attach(worker)

			await readyprom.promise
			return new Thread<S>(worker, messenger)
		}))

		return new this<S>(threads)
	}

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


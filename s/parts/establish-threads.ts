
import {deferPromise, endpoint, Messenger} from "renraku"

import {Thread} from "./thread.js"
import {loadWorker} from "./compat.js"
import {Meta, Options, Schematic} from "./types.js"

export async function establishThreads<S extends Schematic>(options: Options<S>) {
	const workerCount = options.workerCount ?? Math.max(1, navigator.hardwareConcurrency - 1)

	return await Promise.all([...Array(workerCount)].map(async(_, index) => {
		const label = `${options.label ?? "comrade"}_${index + 1}`
		const worker = await loadWorker(options.workerUrl, label)
		const readyprom = deferPromise<void>()

		const meta: Meta = {
			async ready() {
				readyprom.resolve()
			},
		}

		const messenger = new Messenger<S["work"]>({
			timeout: options.timeout ?? Infinity,
			getLocalEndpoint: (remote, rig) => endpoint({
				meta,
				host: options.setupHost(remote, rig)
			}),
		})

		messenger.attach(worker)

		await readyprom.promise
		return new Thread<S>(worker, messenger)
	}))
}


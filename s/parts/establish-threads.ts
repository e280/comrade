
import {deferPromise, endpoint, Messenger} from "renraku"

import {Thread} from "./thread.js"
import {MetaFns, Options, Schematic} from "./types.js"

export async function establishThreads<S extends Schematic>(options: Options<S>) {
	const workerCount = options.workerCount ?? Math.max(1, navigator.hardwareConcurrency - 1)

	return Promise.all(Array(workerCount).map(async(_, index) => {
		const worker = new Worker(options.workerUrl, {
			type: "module",
			name: `${options.label ?? "comrade"}_${index + 1}`,
		})

		const readyprom = deferPromise<void>()

		const metaFns: MetaFns = {
			async ready() {
				readyprom.resolve()
			},
		}

		const messenger = new Messenger<S["workerFns"]>({
			timeout: 120_000,
			getLocalEndpoint: (remote, rig) => endpoint({
				metaFns,
				clusterFns: options.setupClusterFns(remote, rig)
			}),
		})

		messenger.attach(worker)

		await readyprom.promise
		return new Thread<S>(worker, messenger)
	}))
}


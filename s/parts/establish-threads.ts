
import {deferPromise, endpoint, Messenger} from "renraku"

import {Thread} from "./thread.js"
import {ApparatchikFns, CentralPlan, Schematic} from "./types.js"

export async function establishThreads<S extends Schematic>(plan: CentralPlan<S>) {
	const path = new URL("./worker.js", import.meta.url)
	const workerCount = plan.workerCount ?? Math.max(1, navigator.hardwareConcurrency - 1)

	return Promise.all(Array(workerCount).map(async(_, index) => {
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

		const messenger = new Messenger<S["workerFns"]>({
			timeout: 120_000,
			getLocalEndpoint: (remote, rig) => endpoint({
				apparatchik,
				commissar: plan.setupMainFns(remote, rig)
			}),
		})

		messenger.attach(worker)

		await readyprom.promise
		return new Thread<S>(worker, messenger)
	}))
}


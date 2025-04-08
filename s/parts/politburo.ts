
import {deferPromise} from "@benev/slate"
import {endpoint, Messenger} from "renraku"

import {Thread} from "./thread.js"
import {ApparatchikFns, Schematic, SetupFns} from "../types.js"
import { KremlinPortal } from "./kremlin-portal.js"

export type CentralPlan<S extends Schematic> = {
	workerUrl: string | URL
	workerCount?: number
	label?: string
	setupCommissar: SetupFns<S["commissarFns"], S["comradeFns"]>
}

export class Politburo<S extends Schematic> {
	static detectConcurrency = () => Math.max(1, navigator.hardwareConcurrency - 1)

	static async revolution<S extends Schematic>(plan: CentralPlan<S>) {
		const path = new URL("./worker.js", import.meta.url)
		const workerCount = plan.workerCount ?? Politburo.detectConcurrency()

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

			const remotePortal = new Messenger.MessagePortal(worker)

			// TODO how to snipe and forward responses back to the kremlin??
			const messenger = new Messenger<S["comradeFns"]>({
				timeout: 120_000,
				remotePortal,
				getLocalEndpoint: (remote, rig, event) => endpoint({
					apparatchik,
					commissar: plan.setupCommissar(remote, rig, event), // ??
				}),
			})

			await readyprom.promise

			return new Thread(worker, remotePortal, messenger)
		}))

		const kremlinPortal = new KremlinPortal(threads)

		const kremlin = new Messenger<S["comradeFns"]>({
			timeout: 120_000,
			remotePortal: kremlinPortal,
		})
	}

	#workers = new Set<Worker>()
	#available = new Set<Worker>()
	constructor(public plan: CentralPlan<S>) {}
}



import {defer} from "@e280/stz"
import {Messenger, PostableConduit} from "@e280/renraku"

import {shells} from "./shells.js"
import {defaultTap} from "./default-tap.js"
import {Compat, CompatWorker} from "../compat/types.js"
import {Infra, Schematic, ThreadOptions} from "./types.js"

export class Thread<S extends Schematic> {
	constructor(
		public worker: CompatWorker,
		public messenger: Messenger<S["work"]>,
	) {}

	static async make<S extends Schematic>(compat: Compat, options: ThreadOptions<S>) {
		const tap = options.tap ?? defaultTap
		const label = options.label ?? "comrade"
		const worker = compat.loadWorker(options.workerUrl, label)
		const readyprom = defer<void>()

		const meta: Infra = {
			async ready() {
				readyprom.resolve()
			},
		}

		const messenger = new Messenger<S["work"]>({
			tap,
			timeout: options.timeout ?? Infinity,
			conduit: new PostableConduit(worker),
			rpc: async m => ({
				meta,
				host: options.setupHost(
					shells.derive.work<S>(m)
				),
			}),
		})

		await readyprom.promise
		return new this<S>(worker, messenger)
	}

	get work() {
		return this.messenger.remote
	}

	terminate() {
		this.worker.terminate()
	}
}

